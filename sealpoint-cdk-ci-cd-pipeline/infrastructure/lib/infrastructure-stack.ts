import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface InfrastructureStackProps extends StackProps {
	DEPLOY_ENVIRONMENT: string;
}

export class InfrastructureStack extends Stack {
	constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
		super(scope, id, props);

		const { DEPLOY_ENVIRONMENT } = props;

		console.log(`${DEPLOY_ENVIRONMENT} environment detected. Deploying s3 bucket`);

		const infrastructureBucket = new Bucket(this, 'InfrastructureBucket', {
			bucketName: `sealpoint-${DEPLOY_ENVIRONMENT}-infrastructure-bucket`,
			removalPolicy: RemovalPolicy.DESTROY,
		});
	}
}
