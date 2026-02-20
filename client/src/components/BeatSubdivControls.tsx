import React from 'react';
import { useStore } from '../store';
import styles from '../styles/ControlsContainer.module.css';

export default function BeatSubdivControls() {
    const numBeats = useStore((s) => s.numBeats);
    const setNumBeats = useStore((s) => s.setNumBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);
    const fontSize = useStore((s) => s.fontSize);
    const computedFontSize = Math.max(10, fontSize * 1.6);

    return (
        <div className={styles.controlsContainer}>
            <div className={styles.controlsGrid}>
                {/* Row 1: Beats - / value / + */}
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                    onClick={() => setNumBeats(Math.max(1, numBeats - 1))}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">➖</span>
                </button>
                <div className={styles.beatsLabel}>{numBeats}</div>
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                    onClick={() => setNumBeats(Math.min(16, numBeats + 1))}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">➕</span>
                </button>

                {/* Row 2: Subdivisions - / value / + */}
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                    onClick={() => setNumSubdivisions(Math.max(1, numSubdivisions - 1))}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">➖</span>
                </button>
                <div className={styles.subdivLabel}>{numSubdivisions}</div>
                <button
                    className={`${styles.controlsButton} ${styles.tempoButton}`}
                    style={{ fontSize: `${computedFontSize}px` }}
                    onClick={() => setNumSubdivisions(Math.min(8, numSubdivisions + 1))}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">➕</span>
                </button>
            </div>
        </div>
    );
}
