import { useStore } from '../store';
import styles from '../styles/ControlsContainer.module.css';

export default function BeatSubdivControls() {
    const numBeats = useStore((s) => s.numBeats);
    const setNumBeats = useStore((s) => s.setNumBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);

    return (
        <div className={styles.controlsContainer}>
            <div className={styles.controlsGrid}>
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    onClick={() => setNumBeats(Math.max(1, numBeats - 1))}
                    aria-label="Remove a beat"
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        &minus;
                    </span>
                </button>
                <div className={styles.readout} aria-live="polite">
                    <span className="sr-only">Beats&nbsp;</span>
                    <span className={styles.readoutValue}>{numBeats}</span>
                    <span className={styles.readoutCaption} aria-hidden="true">
                        BEATS
                    </span>
                </div>
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    onClick={() => setNumBeats(Math.min(16, numBeats + 1))}
                    aria-label="Add a beat"
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        +
                    </span>
                </button>

                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    onClick={() => setNumSubdivisions(Math.max(1, numSubdivisions - 1))}
                    aria-label="Remove a subdivision per beat"
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        &minus;
                    </span>
                </button>
                <div className={styles.readout} aria-live="polite">
                    <span className="sr-only">Subdivisions&nbsp;</span>
                    <span className={styles.readoutValue}>{numSubdivisions}</span>
                    <span className={styles.readoutCaption} aria-hidden="true">
                        SPLIT
                    </span>
                </div>
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    onClick={() => setNumSubdivisions(Math.min(8, numSubdivisions + 1))}
                    aria-label="Add a subdivision per beat"
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        +
                    </span>
                </button>
            </div>
        </div>
    );
}
