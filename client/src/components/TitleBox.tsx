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
			{/* <h1>DoughLoops</h1> */}
			<img className={styles.logoImage} src={DoughLoopsLogo} alt="" />
			<button
				ref={dropdownAnchorRef}
				onClick={dropdownClickedHandler}
				className={styles.authToggleButton}
			>
				{user ? `Account (${user.username})` : 'Login / Register'}
			</button>
		</div>
	);
}
