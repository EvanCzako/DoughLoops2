import { RefObject } from 'react';
import * as Tone from 'tone';
import { useStore } from '../store';
import styles from '../styles/ControlsContainer.module.css';

export default function ControlsContainer({ stepRef }: { stepRef: RefObject<number> }) {
    const isPlaying = useStore((s) => s.isPlaying);
    const setIsPlaying = useStore((s) => s.setIsPlaying);
    const setCurrentStep = useStore((s) => s.setCurrentStep);
    const bpm = useStore((s) => s.bpm);
    const setBpm = useStore((s) => s.setBpm);
    const grid = useStore((s) => s.grid);
    const setGrid = useStore((s) => s.setGrid);
    const sampleStatus = useStore((s) => s.sampleStatus);

    const disabled = sampleStatus !== 'ready';

    const handlePlayToggle = async () => {
        // Tone.start() has to run inside the user gesture that requested audio.
        // Doing it from an effect further down the render worked by accident.
        if (!isPlaying) await Tone.start();
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setCurrentStep(0);
        stepRef.current = 0;
    };

    const handleClear = () => {
        setGrid(grid.map((row) => row.map(() => false)));
    };

    const playLabel = isPlaying ? 'Stop' : 'Play';

    return (
        <div className={styles.controlsContainer}>
            <div className={styles.controlsGrid}>
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    onClick={() => setBpm(Math.max(20, bpm - 5))}
                    aria-label="Decrease tempo by 5 BPM"
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        &minus;
                    </span>
                </button>
                <div className={styles.readout} aria-live="polite">
                    <span className="sr-only">Tempo&nbsp;</span>
                    <span className={styles.readoutValue}>{Math.round(bpm)}</span>
                    <span className={styles.readoutCaption} aria-hidden="true">
                        BPM
                    </span>
                </div>
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    onClick={() => setBpm(Math.min(300, bpm + 5))}
                    aria-label="Increase tempo by 5 BPM"
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        +
                    </span>
                </button>

                <button
                    onClick={handleReset}
                    className={`${styles.controlsButton} ${styles.resetButton}`}
                    aria-label="Return playhead to the first step"
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
                    onClick={handlePlayToggle}
                    disabled={disabled}
                    aria-label={playLabel}
                    aria-pressed={isPlaying}
                    title={
                        sampleStatus === 'loading'
                            ? 'Loading samples…'
                            : sampleStatus === 'error'
                              ? 'Samples failed to load'
                              : playLabel
                    }
                >
                    {sampleStatus === 'loading' ? (
                        <span className={styles.spinner} aria-hidden="true" />
                    ) : isPlaying ? (
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
                    onClick={handleClear}
                    className={`${styles.controlsButton} ${styles.clearButton}`}
                    aria-label="Clear all steps"
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
