import { RemovalPolicy, SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import {
	Distribution,
	OriginAccessControlBase,
	OriginAccessControlOriginType,
	OriginAccessIdentity,
	ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { CompositePrincipal, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface PipelineStackProps extends StackProps {
	envName: string;
	repositoryName: string;
	branch: string;
	repositoryOwner: string;
	domain: string;
	subdomain: string;
}

export class PipelineStack extends Stack {
	constructor(scope: Construct, id: string, props: PipelineStackProps) {
		super(scope, id, props);
		console.log(props);
		const { envName, repositoryName, branch, repositoryOwner, domain, subdomain } = props;

		const gitHubtoken = SecretValue.secretsManager('github-token');

		const infrastructureDeployRole = new Role(this, 'InfrastructureDeployRole', {
			assumedBy: new CompositePrincipal(
				new ServicePrincipal('codebuild.amazonaws.com'),
				new ServicePrincipal('codepipeline.amazonaws.com')
			),
			inlinePolicies: {
				CdkDeployPermissions: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ['sts:AssumeRole'],
							resources: ['arn:aws:iam::*:role/cdk-*'],
						}),
					],
				}),
			},
		});

		const frontendBucket = new Bucket(this, 'FontendBucket', {
			bucketName: `sealpoint-${envName}-frontend-source-bucket`,
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});

		const artifactBucket = new Bucket(this, 'ArtifactBucket', {
			bucketName: `sealpoint-${envName}-codepipeline-artifact-bucket`,
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});

		const domainName = `${subdomain}${domain}`;
		const hostedZone = new HostedZone(this, 'HostedZone', {
			zoneName: domainName,
		});

		const certificate = new Certificate(this, 'SSLCert', {
			domainName,
			validation: CertificateValidation.fromDns(hostedZone),
		});

		const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
		frontendBucket.grantRead(originAccessIdentity);

		const distribution = new Distribution(this, 'FrontendDistribution', {
			defaultRootObject: 'index.html',
			defaultBehavior: {
				origin: S3BucketOrigin.withOriginAccessIdentity(frontendBucket, {
					originAccessIdentity,
				}),
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			},
			domainNames: [domainName],
			certificate,
		});

		const arecord = new ARecord(this, 'ARecord', {
			zone: hostedZone,
			target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
		});

		const frontendSourceOutput = new Artifact('FrontendSourceOutput');
		const infrastructureSourceOutput = new Artifact('InfrastructureSourceOutput');

		const frontendBuildProject = new PipelineProject(this, 'FrontendBuildProject', {
			environment: {
				buildImage: LinuxBuildImage.AMAZON_LINUX_2_5,
			},
			buildSpec: BuildSpec.fromObject({
				version: '0.2',
				phases: {
					install: {
						'runtime-version': {
							nodejs: '20.x',
						},
						commands: ['cd client/', 'npm install'],
					},
					build: {
						commands: ['echo "Building the frontend application..."', 'npm run build'],
					},
				},
				artifacts: {
					'base-directory': 'client/.next',
					files: ['**/*'],
				},
			}),
		});

		const infrastructureBuildProject = new PipelineProject(this, 'InfrastructureProject', {
			role: infrastructureDeployRole,
			environment: {
				buildImage: LinuxBuildImage.AMAZON_LINUX_2_5,
			},
			environmentVariables: {
				DEPLOY_ENVIRONMENT: {
					value: envName,
				},
			},
			buildSpec: BuildSpec.fromObject({
				version: '0.2',
				phases: {
					install: {
						'runtime-versions': {
							nodejs: '20.x',
						},
						commands: ['npm install -g aws-cdk', 'cd sealpoint-cdk-ci-cd-pipeline/infrastructure', 'npm install'],
					},
					build: {
						commands: [`cdk deploy --context env=${envName}`],
					},
				},
			}),
		});

		const pipeline = new Pipeline(this, 'CIPipeline', {
			pipelineName: `${envName}-CI-Pipeline`,
			role: infrastructureDeployRole,
			artifactBucket,
		});

		pipeline.addStage({
			stageName: 'Source',
			actions: [
				new GitHubSourceAction({
					owner: repositoryOwner,
					repo: repositoryName,
					actionName: 'InfrastructureSource',
					branch: branch,
					output: infrastructureSourceOutput,
					oauthToken: gitHubtoken,
				}),
			],
		});

		pipeline.addStage({
			stageName: 'Deploy',
			actions: [
				new CodeBuildAction({
					actionName: 'DeployCdkInfrastructure',
					project: infrastructureBuildProject,
					input: infrastructureSourceOutput,
					role: infrastructureDeployRole,
				}),
			],
		});
	}
}
