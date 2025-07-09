import React from 'react';
import { useStore } from '../store';
import { DoughLoop } from '../store';
import NewDoughLoopForm from './NewDoughLoopForm';
import DoughLoopList from './DoughLoopList';
import styles from '../styles/UserLoopsWrapper.module.css';

interface Props {
	onSelectLoop: (loop: DoughLoop) => void;
	selectedLoop: DoughLoop | null;
}

export default function UserLoopsWrapper() {

	const user = useStore((s) => s.user);

	const loggedInDisp = <div className={styles.userLoopsInternal}>
			<NewDoughLoopForm/>
			<DoughLoopList/>
		</div>

	const loggedOutDisp = <div className={styles.userLoopsInternal}>
		Log in or register to save and edit your loops!
	</div>

	return (
		<div className={styles.userLoopsWrapper}>
			{user ? loggedInDisp : loggedOutDisp}
		</div>
		
	)
}