import React from 'react';
import { useStore } from '../store';
import { DoughLoop } from '../store';
import NewDoughLoopForm from './NewDoughLoopForm';
import DoughLoopList from './DoughLoopList';
import DemoLoopList from './DemoLoopList';
import styles from '../styles/UserLoopsWrapper.module.css';

export default function UserLoopsWrapper() {
	const user = useStore((s) => s.user);
	const fontSize = useStore((s) => s.fontSize);

	return (
		<div className={styles.userLoopsWrapper}>
			<div className={styles.section}>
				{user ? (
					<>
						<NewDoughLoopForm />
						<DoughLoopList/>
					</>
				) : (
					<p style={{fontSize: fontSize*2}}>Log in or register to save and edit your loops!</p>
				)}
			</div>

			<div className={styles.section}>
				<DemoLoopList/>
			</div>
		</div>
	);
}
