import React from 'react';
import { useStore } from '../store';
import { DoughLoop } from '../store';
import NewDoughLoopForm from './NewDoughLoopForm';
import DoughLoopList from './DoughLoopList';
import DemoLoopList from './DemoLoopList';
import styles from '../styles/UserLoopsWrapper.module.css';

export default function UserLoopsWrapper() {
	const user = useStore((s) => s.user);

	return (
		<div className={styles.userLoopsWrapper}>
			<div className={styles.section}>
				{/* <h3>User Loops</h3> */}
				{user ? (
					<>
						<NewDoughLoopForm />
						<DoughLoopList/>
					</>
				) : (
					<p>Log in or register to save and edit your loops!</p>
				)}
			</div>

			<div className={styles.section}>
				<DemoLoopList/>
			</div>
		</div>
	);
}
