import React from 'react';
import { useStore } from '../store';
import styles from '../styles/TitleBox.module.css';
import DoughLoopsLogo from "../assets/DoughLoops2-downSaturated.png";

export default function TitleBox({
	dropdownAnchorRef,
}: {
	dropdownAnchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
	const user = useStore((s) => s.user);
	const userDropdownOpen = useStore((s) => s.userDropdownOpen);
	const setUserDropdownOpen = useStore((s) => s.setUserDropdownOpen);
	const dropdownClickedHandler = () => {
		if (userDropdownOpen) {
			setUserDropdownOpen(false);
		} else {
			setUserDropdownOpen(true);
		}
	}

	return (
		<div className={styles.titleBox}>
			<a href="https://evanczako.github.io/DoughLab2/" target="_blank" rel="noopener noreferrer">
				<img className={styles.logoImage} src={DoughLoopsLogo} alt="DoughLoops" />
			</a>
		</div>
	);
}
