import React from 'react';
import { useState, useEffect, useRef } from 'react';
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
    const setCurrentStep = useStore((s) => s.setCurrentStep);
    const currentStep = useStore((s) => s.currentStep);
    const bpm = useStore((s) => s.bpm);
    const setBpm = useStore((s) => s.setBpm);
    const numBeats = useStore((s) => s.numBeats);
    const setNumBeats = useStore((s) => s.setNumBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);
	const stepRef = useRef(currentStep);
	const fontSize = useStore((s) => s.fontSize);
	const computedFontSize = Math.max(10, fontSize*2);

    const handlePlayToggle = async () => {
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
                bpm={bpm}
				stepRef={stepRef}
            />
            <div className={styles.buttonRow}>
                <button
                    className={`${styles.controlsButton} ${isPlaying ? styles.playing : styles.stopped}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                    onClick={handlePlayToggle}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        {isPlaying ? '⏹️' : '▶️'}
                    </span>
                </button>
                <button
                    onClick={() => {
                        const numRows = opts.grid.length;
                        const numCols = opts.grid[0]?.length || 0;
                        const cleared = Array.from({ length: numRows }, () => Array(numCols).fill(false));
                        opts.setGrid(cleared);
                    }}
                    className={`${styles.controlsButton} ${styles.clearButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">🧹</span>
                </button>
                <button
                    onClick={() => {
                        setCurrentStep(0);
                        stepRef.current = 0;
                    }}
                    className={`${styles.controlsButton} ${styles.resetButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">↩️</span>
                </button>
            </div>
        </div>
    );
}
