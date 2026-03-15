import { useEffect, RefObject } from 'react';
import { useStore } from '../store';
import styles from '../styles/ControlsContainer.module.css';

export default function ControlsContainer(opts: {
    grid: boolean[][];
    setGrid: (grid: boolean[][]) => void;
    stepRef: RefObject<number>;
}) {
    const isPlaying = useStore((s) => s.isPlaying);
    const setIsPlaying = useStore((s) => s.setIsPlaying);
    const setCurrentStep = useStore((s) => s.setCurrentStep);
    const bpm = useStore((s) => s.bpm);
    const setBpm = useStore((s) => s.setBpm);
    const numBeats = useStore((s) => s.numBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const fontSize = useStore((s) => s.fontSize);
    const computedFontSize = Math.max(10, fontSize * 2);

    const handlePlayToggle = async () => {
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        const grid = useStore.getState().grid;
        opts.setGrid(
            grid.map((row) => {
                const newRow = [...row];
                newRow.length = numBeats * numSubdivisions;
                return newRow.fill(false, row.length);
            })
        );
    }, [numBeats, numSubdivisions, opts.setGrid]);

    return (
        <div className={styles.controlsContainer}>
            <div className={styles.controlsGrid}>
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                    onClick={() => setBpm(Math.max(20, bpm - 5))}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        ➖
                    </span>
                </button>
                <div className={styles.bpmLabel}>{Math.round(bpm)}</div>
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                    onClick={() => setBpm(Math.min(300, bpm + 5))}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        ➕
                    </span>
                </button>

                <button
                    onClick={() => {
                        setCurrentStep(0);
                        opts.stepRef.current = 0;
                    }}
                    className={`${styles.controlsButton} ${styles.resetButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="1em"
                        height="1em"
                        aria-hidden="true"
                    >
                        <rect x="4" y="4" width="3" height="16" rx="1" />
                        <polygon points="20,4 9,12 20,20" />
                    </svg>
                </button>
                <button
                    className={`${styles.controlsButton} ${isPlaying ? styles.playing : styles.stopped}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                    onClick={handlePlayToggle}
                >
                    {isPlaying ? (
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="1em"
                            height="1em"
                            aria-hidden="true"
                        >
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                        </svg>
                    ) : (
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="1em"
                            height="1em"
                            aria-hidden="true"
                        >
                            <polygon points="6,3 20,12 6,21" />
                        </svg>
                    )}
                </button>
                <button
                    onClick={() => {
                        const numRows = opts.grid.length;
                        const numCols = opts.grid[0]?.length || 0;
                        const cleared = Array.from({ length: numRows }, () =>
                            Array(numCols).fill(false)
                        );
                        opts.setGrid(cleared);
                    }}
                    className={`${styles.controlsButton} ${styles.clearButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="1em"
                        height="1em"
                        aria-hidden="true"
                    >
                        <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z" />
                        <rect x="3" y="6" width="18" height="2" rx="1" />
                        <path d="M5 9l1.5 11a1 1 0 0 0 1 .9h9a1 1 0 0 0 1-.9L19 9H5z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
