import React from 'react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';

import DrumLoopEditor from './DrumLoopEditor';
import styles from '../styles/DoughLoopManager.module.css';
import ControlsContainer from './ControlsContainer';
import UserLoopsWrapper from './UserLoopsWrapper';

export default function DoughLoopManager() {
    const user = useStore((s) => s.user);
    const selectedLoop = useStore((s) => s.selectedLoop);
    const setSelectedLoop = useStore((s) => s.setSelectedLoop);
    const grid = useStore((s) => s.grid);
    const setGrid = useStore((s) => s.setGrid);
    const name = useStore((s) => s.name);
    const setName = useStore((s) => s.setName);

    // // Reset selected loop on logout
    useEffect(() => {
        if (!user && selectedLoop) {
            setSelectedLoop(null);
        }
    }, [user]);

    return (
        <div className={styles.doughLoopManager}>
			<ControlsContainer grid={grid} setGrid={setGrid} />
            <DrumLoopEditor
                selectedLoop={selectedLoop}
                grid={grid}
                setGrid={setGrid}
                name={name}
                setName={setName}
            />
        </div>
    );
}
