import React from 'react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import type { DoughLoop } from '../store';
import DrumLoopPlayer from './DrumLoopPlayer';
import * as Tone from 'tone';
import styles from '../styles/ControlsContainer.module.css';

export default function ControlsContainer(opts: {
    grid: boolean[][];
    setGrid: (grid: boolean[][]) => void;
}) {
    const user = useStore((s) => s.user);
    const isPlaying = useStore((s) => s.isPlaying);
    const setIsPlaying = useStore((s) => s.setIsPlaying);
    const [selectedLoop, setSelectedLoop] = useState<DoughLoop | undefined>(undefined);
    // const currentStep = useStore((s) => s.currentStep);
    const setCurrentStep = useStore((s) => s.setCurrentStep);
    const bpm = useStore((s) => s.bpm);
    const setBpm = useStore((s) => s.setBpm);

    const numBeats = useStore((s) => s.numBeats);
    const setNumBeats = useStore((s) => s.setNumBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);

    const numSteps = numBeats * 4;

    const handlePlayToggle = async () => {
        // await Tone.start(); // <-- resumes AudioContext
        setIsPlaying(!isPlaying);
    };

    // When numBeats changes, reset grid to correct length
    useEffect(() => {
        opts.setGrid(
            opts.grid.map((row) => {
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
            <DrumLoopPlayer
                grid={opts.grid}
                isPlaying={isPlaying}
                onStep={setCurrentStep}
                bpm={bpm}
            />
            <button
                className={`${styles.controlsButton} ${isPlaying ? styles.playing : styles.stopped}`}
                onClick={handlePlayToggle}
            >
                {isPlaying ? 'Stop' : 'Play'}
            </button>
            <div style={{ marginBottom: 16 }}>
                <label>
                    Beats: {numBeats}
                    <input
                        type="range"
                        min={1}
                        max={8}
                        value={numBeats}
                        onChange={(e) => setNumBeats(Number(e.target.value))}
                        className={styles.controlsSlider}
                    />
                </label>
            </div>
            <div style={{ margin: '10px 0' }}>
                <label htmlFor="subdivisions">Subdivisions: {numSubdivisions}</label>
                <input
                    id="subdivisions"
                    type="range"
                    min={1}
                    max={8}
                    value={numSubdivisions}
                    onChange={(e) => setNumSubdivisions(Number(e.target.value))}
                    className={styles.controlsSlider}
                />
            </div>
            <div style={{ margin: '20px 0' }}>
                <label>
                    BPM: {bpm}
                    <input
                        type="range"
                        min="50"
                        max="180"
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className={styles.controlsSlider}
                    />
                </label>
            </div>
        </div>
    );
}
