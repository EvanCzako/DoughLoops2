import React from 'react';
import { useStore } from '../store';
import styles from '../styles/Footer.module.css';

export default function Footer() {
	const fontSize = useStore((s) => s.fontSize);

	return (
		<div className={styles.footerWrapper} style={{fontSize: fontSize*2}}>
			<a href="https://evanczako.github.io/DoughLab2/" target='_blank'>More interactive projects by Evan Czako here! (Click me)</a>
		</div>
	);
}
