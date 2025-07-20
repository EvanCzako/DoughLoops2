import { JSX, useEffect, useRef } from 'react';
import { useStore } from './store';
import React from 'react';
import DoughLoopManager from './components/DoughLoopManager';
import TitleBox from './components/TitleBox';
import AuthPage from './components/AuthPage';
import DropdownWrapper from './components/DropdownWrapper';
import UserLoopsWrapper from './components/UserLoopsWrapper';
import styles from './App.module.css';

export default function App(): JSX.Element {
	const grid = useStore((s) => s.grid);
	const setGrid = useStore((s) => s.setGrid);
	const name = useStore((s) => s.name);
	const setName = useStore((s) => s.setName);
	const updateFontSize = useStore((s) => s.updateFontSize);
	const showDropdown = useStore((s) => s.userDropdownOpen);

	const dropdownAnchorRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		updateFontSize();
		window.addEventListener('resize', updateFontSize);
		return () => window.removeEventListener('resize', updateFontSize);
	}, [updateFontSize]);

	return (
		<div className={styles.App}>
			<TitleBox dropdownAnchorRef={dropdownAnchorRef} />
			{showDropdown && (
				<DropdownWrapper anchorRef={dropdownAnchorRef}>
					<AuthPage grid={grid} setGrid={setGrid} name={name} setName={setName} />
				</DropdownWrapper>
			)}
			<div className={styles.gridAndLoopsWrapper}>
				<DoughLoopManager />
				<UserLoopsWrapper />
			</div>
		</div>

	);
}
