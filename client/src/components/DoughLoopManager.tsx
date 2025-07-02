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

export default function DoughLoopManager(opts: {
	grid: any,
	setGrid: any,
	name: any,
	setName: any,
}) {
    const user = useStore((s) => s.user);
    const isPlaying = useStore((s) => s.isPlaying);
    const setIsPlaying = useStore((s) => s.setIsPlaying);
    const selectedLoop = useStore((s) => s.selectedLoop);
	const setSelectedLoop = useStore((s) => s.setSelectedLoop);
	const currentStep = useStore((s) => s.currentStep);
    const numBeats = useStore((s) => s.numBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);

    // // When numBeats changes, reset grid to correct length
    // useEffect(() => {
    //     opts.setGrid((prev: any) =>
    //         prev.map((row: any) => {
    //             const newRow = [...row];
    //             newRow.length = numBeats * numSubdivisions;
    //             return newRow.fill(false, row.length);
    //         })
    //     );
    // }, [numBeats, numSubdivisions]);

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
                grid={opts.grid}
                setGrid={opts.setGrid}
                name={opts.name}
                setName={opts.setName}
                currentStep={currentStep}
            />

            <ControlsContainer grid={opts.grid} setGrid={opts.setGrid}/>

        </div>
    );
}
