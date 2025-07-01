import React from 'react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import type { DoughLoop } from '../store';
import DrumLoopPlayer from './DrumLoopPlayer';
import * as Tone from 'tone';
import styles from '../styles/ControlsContainer.module.css';

export default function ControlsContainer() {
    const user = useStore((s) => s.user);
    const isPlaying = useStore((s) => s.isPlaying);
    const setIsPlaying = useStore((s) => s.setIsPlaying);
    const [selectedLoop, setSelectedLoop] = useState<DoughLoop | undefined>(undefined);
	const currentStep = useStore((s) => s.currentStep);
	const setCurrentStep = useStore((s) => s.setCurrentStep);
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
        <div className={styles.controlsContainer}>
            <DrumLoopPlayer grid={grid} isPlaying={isPlaying} onStep={setCurrentStep} bpm={bpm} />
            <div style={{ marginBottom: 16 }}>
                <label>
                    Beats: {numBeats}
                    <input
                        type="range"
                        min={1}
                        max={8}
                        value={numBeats}
                        onChange={(e) => setNumBeats(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>
            <div style={{ margin: '10px 0' }}>
                <label htmlFor="subdivisions">Subdivisions per Beat: {numSubdivisions}</label>
                <input
                    id="subdivisions"
                    type="range"
                    min={1}
                    max={8}
                    value={numSubdivisions}
                    onChange={(e) => setNumSubdivisions(Number(e.target.value))}
                />
            </div>
            <div style={{ margin: '20px 0' }}>
                <label>
                    BPM: {bpm}
                    <input
                        type="range"
                        min="60"
                        max="180"
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>

            <button onClick={handlePlayToggle}>{isPlaying ? 'Stop' : 'Play'}</button>
        </div>
    );
}
