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
    const isPlaying = useStore((s) => s.isPlaying);
    const setIsPlaying = useStore((s) => s.setIsPlaying);
    const selectedLoop = useStore((s) => s.selectedLoop);
	const setSelectedLoop = useStore((s) => s.setSelectedLoop);
	const currentStep = useStore((s) => s.currentStep);
    const bpm = useStore((s) => s.bpm);
    const setBpm = useStore((s) => s.setBpm);

    const numBeats = useStore((s) => s.numBeats);
    const setNumBeats = useStore((s) => s.setNumBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);

    const numSteps = numBeats * 4;

    const emptyGrid = Array(4)
        .fill(null)
        .map(() => Array(numSteps).fill(false));
    const [grid, setGrid] = useState<boolean[][]>(emptyGrid);

    const [name, setName] = useState('');

    const handlePlayToggle = async () => {
        await Tone.start(); // <-- resumes AudioContext
        setIsPlaying(!isPlaying);
    };

    // When numBeats changes, reset grid to correct length
    useEffect(() => {
        setGrid((prev) =>
            prev.map((row) => {
                const newRow = [...row];
                newRow.length = numBeats * numSubdivisions;
                return newRow.fill(false, row.length);
            })
        );
    }, [numBeats, numSubdivisions]);

    // Reset selected loop on logout
    useEffect(() => {
        if (!user && selectedLoop) {
            setSelectedLoop(undefined);
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
                currentStep={currentStep}
            />

            <ControlsContainer grid={grid} setGrid={setGrid}/>

        </div>
    );
}
