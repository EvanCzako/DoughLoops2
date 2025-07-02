import React from 'react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import DoughLoopList from './DoughLoopList';
import LogoutButton from './LogoutButton';
import DrumLoopEditor from './DrumLoopEditor';
import type { DoughLoop } from '../store';
import DrumLoopPlayer from './DrumLoopPlayer';
import * as Tone from 'tone';
import styles from '../styles/DoughLoopManager.module.css';
import ControlsContainer from './ControlsContainer';

export default function DoughLoopManager() {

    const user = useStore((s) => s.user);
    const selectedLoop = useStore((s) => s.selectedLoop);
	const setSelectedLoop = useStore((s) => s.setSelectedLoop);
	const grid = useStore((s) => s.grid);
	const setGrid = useStore((s) => s.setGrid);
	const name = useStore((s) => s.name);
	const setName = useStore((s) => s.setName);

	console.log("DOUGHLOOP MANAGER RENDER");
	console.log(selectedLoop);

    // // Reset selected loop on logout
    useEffect(() => {
        if (!user && selectedLoop) {
            setSelectedLoop(null);
        }
    }, [user]);

    return (
        <div className={styles.doughLoopManager}>
            <DrumLoopEditor
                selectedLoop={selectedLoop}
                grid={grid}
                setGrid={setGrid}
                name={name}
                setName={setName}
            />

            <ControlsContainer grid={grid} setGrid={setGrid}/>

        </div>
    );
}
