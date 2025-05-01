import localFont from 'next/font/local';
import { Creepster, Rubik_Distressed } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';

import './globals.css';
import styles from './layout.module.scss';

import Footer from './components/Footer/footer';
import Navbar from './components/Navbar/navbar';

export const metadata = {
	title: 'Seal Point',
	discription: 'The official website of Seal Point. Tickets on presale now.',
};

const futura = localFont({
	src: [
		{ path: '../../public/font/Futura Heavy font.ttf', weight: '800' },
		{ path: '../../public/font/Futura Bold font.ttf', weight: '700' },
		{ path: '../../public/font/Futura Book font.ttf', weight: '300' },
	],
	weight: '300 700 800',
	display: 'swap',
	variable: '--font-futura',
});

const rubik_dis = Rubik_Distressed({
	display: 'swap',
	weight: '400',
	variable: '--font-rubik-distressed',
	subsets: ['latin'],
	preload: false,
});
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default function RootLayout({ children }) {
	return (
		<html lang="en" className={`${futura.variable} ${rubik_dis.variable}`}>
			<body>
				<section className={styles.main}>
					<Navbar></Navbar>
					<section className={styles.content}>{children}</section>
				</section>
				<Footer></Footer>
				<GoogleAnalytics gaId="G-BXC34PZMJT " />
			</body>
		</html>
	);
}
