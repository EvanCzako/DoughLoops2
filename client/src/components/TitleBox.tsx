import React from 'react';
import { useStore } from '../store';
import { encodeDrumGrid } from './utils';
import styles from '../styles/TitleBox.module.css';
import DoughLoopsLogo from "../assets/DoughLoops2-downSaturated.png";

export default function TitleBox({
	dropdownAnchorRef,
	demoDropdownAnchorRef,
}: {
	dropdownAnchorRef: React.RefObject<HTMLButtonElement | null>;
	demoDropdownAnchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
	const user = useStore((s) => s.user);
	const userDropdownOpen = useStore((s) => s.userDropdownOpen);
	const setUserDropdownOpen = useStore((s) => s.setUserDropdownOpen);
	const demoDropdownOpen = useStore((s) => s.demoDropdownOpen);
	const setDemoDropdownOpen = useStore((s) => s.setDemoDropdownOpen);
	const bpm = useStore((s) => s.bpm);
	const numBeats = useStore((s) => s.numBeats);
	const numSubdivisions = useStore((s) => s.numSubdivisions);
	const grid = useStore((s) => s.grid);
	const selectedSamples = useStore((s) => s.selectedSamples);
	const volumes = useStore((s) => s.volumes);
	
	const dropdownClickedHandler = () => {
		if (userDropdownOpen) {
			setUserDropdownOpen(false);
		} else {
			setUserDropdownOpen(true);
		}
	}

	const demoDropdownClickedHandler = () => {
		const currentBeatRep = encodeDrumGrid({
			bpm,
			numBeats,
			subdivisions: numSubdivisions,
			grid,
			samples: selectedSamples,
			volumes,
		});
		console.log('Current doughloop:', currentBeatRep);
		if (demoDropdownOpen) {
			setDemoDropdownOpen(false);
		} else {
			setDemoDropdownOpen(true);
		}
	}

	return (
		<div className={styles.titleBox}>
			<a href="https://evanczako.github.io/DoughLab2/" target="_blank" rel="noopener noreferrer">
				<img className={styles.logoImage} src={DoughLoopsLogo} alt="DoughLoops" />
			</a>
			<div className={styles.spacer} />
			<button
				ref={demoDropdownAnchorRef}
				className={styles.demoButton}
				onClick={demoDropdownClickedHandler}
			>
				Demos {demoDropdownOpen ? '▼' : '▶'}
			</button>
		</div>
	);
}
