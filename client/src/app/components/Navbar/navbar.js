'use client';
import Image from 'next/image';

import styles from './navbar.module.scss';
import { useState } from 'react';

export default function Navbar() {
	const [hideLinks, setHideLinks] = useState(true);

	const toggleLinks = (e) => {
		e.preventDefault();
		setHideLinks(!hideLinks);
	};

	return (
		<aside className={styles.navbar}>
			<Image className={styles.logo} src="/sealpoint_yarn_logo_red.png" alt="logo" width={300} height={140} priority />
			<nav className={`${styles.hrefs} ${hideLinks && styles.hidden}`}>
				<a className={styles.header_href} href="/home">
					<div className={styles.bounce}>
						<h4 className={styles.nav}>home</h4>
					</div>
				</a>
				<a className={styles.header_href} href="/band">
					<div className={styles.bounce}>
						<h4 className={styles.nav}>band</h4>
					</div>
				</a>
				<a className={styles.header_href} href="/band">
					<div className={styles.bounce}>
						<h4 className={styles.nav}>flash</h4>
					</div>
				</a>
				<a className={styles.header_href} href="/media">
					<div className={styles.bounce}>
						<h4 className={styles.nav}>media</h4>
					</div>
				</a>
				<a className={styles.header_href} href="/links">
					<div className={styles.bounce}>
						<h4 className={styles.nav}>links</h4>
					</div>
				</a>
				<a className={styles.header_href} href="/merch">
					<div className={styles.bounce}>
						<h4 className={styles.nav}>merch</h4>
					</div>
				</a>
				<a className={styles.header_href} href="/tickets">
					<div className={styles.bounce}>
						<h4 className={`${styles.nav}  ${styles.shimmer}`}>SHOWS</h4>
					</div>
				</a>
			</nav>
			<a className={styles.hamburger} href="#" onClick={toggleLinks}>
				<Image
					src={!hideLinks ? '/close-menu.svg' : '/hamburger-menu.svg'}
					alt="logo"
					width={120}
					height={120}
					priority
				/>
			</a>
			<div className={styles.filler} />
		</aside>
	);
}
