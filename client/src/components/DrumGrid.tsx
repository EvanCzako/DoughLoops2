import React from 'react';
import { useStore } from '../store';
import styles from '../styles/DrumGrid.module.css';

interface DrumGridProps {
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
    currentStep?: number;
}

const instrumentEmojis: Record<string, string> = {
    kick: '🔊',
    clap: '👏',
    snare: '🥁',
    hat: '🎩',
    rim: '🔔',
    tom: '🎯',
    cymbal: '✨',
    triangle: '🔺',
};

export default function DrumGrid({ grid, setGrid, currentStep }: DrumGridProps) {
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const orientation = useStore((s) => s.orientation);
    const instruments = ['kick', 'clap', 'snare', 'hat', 'rim', 'tom', 'cymbal', 'triangle'];
    const selectedSamples = useStore((s) => s.selectedSamples);
    const setSelectedSample = useStore((s) => s.setSelectedSample);
    const volumes = useStore((s) => s.volumes);
    const setVolume = useStore((s) => s.setVolume);
    const fontSize = useStore((s) => s.fontSize);
    const computedFontSize = Math.max(10, fontSize * 1.4);

    const toggle = (row: number, col: number) => {
        const updated = grid.map((r, ri) =>
            ri === row ? r.map((c, ci) => (ci === col ? !c : c)) : r
        );
        setGrid(updated);
    };

    const numCols = grid[0]?.length || 0;
    const numRows = grid.length;

    // Calculate beat dimensions for grid background (different for each orientation)
    // Portrait: calc based on proportion of total rows (numSubdivisions rows per beat)
    const beatSizePortrait = `${(numSubdivisions / numCols) * 100}%`;
    // Landscape: steps flow horizontally, cell-size per cell, no extra gap accounting
    const beatSizeLandscape = `calc(var(--grid-cell-size) * ${numSubdivisions})`;

    const isPortrait = orientation === 'portrait';

    // PORTRAIT MODE: Render grid with steps as rows, instruments as columns
    if (isPortrait) {
        return (
            <div className={styles.drumGridOuter} data-orientation="portrait">
                <div className={styles.portraitContainer}>
                    {/* Scrollable grid area containing controls and grid */}
                    <div className={styles.scrollContainerPortrait}>
                        <div className={styles.innerGridContainerPortrait}>
                            {/* Controls row at top */}
                            <div className={styles.controlsRowPortrait}>
                                {/* Instrument controls in horizontal row */}
                                {grid.map((_, instrumentIndex) => (
                                    <div className={styles.controlsBoxPortrait} key={`controls-${instrumentIndex}`}>
                                        <div
                                            className={styles.instrumentEmojiPortrait}
                                            title={instruments[instrumentIndex]}
                                        >
                                            {instrumentEmojis[instruments[instrumentIndex]]}
                                        </div>

                                        <input
                                            className={styles.volumeSliderPortrait}
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={volumes[instrumentIndex]}
                                            onChange={(e) => setVolume(instrumentIndex, parseFloat(e.target.value))}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Grid: rows = steps, columns = instruments */}
                            <div className={styles.drumGridPortrait}>
                                {/* Beat background - horizontally striped behind grid */}
                                <div className={styles.beatBackgroundPortrait}>
                                    {Array.from({ length: numCols / numSubdivisions }).map((_, beatIndex) => (
                                        <div
                                            key={`beat-bg-${beatIndex}`}
                                            className={`${styles.beatStripePortrait} ${
                                                beatIndex % 2 === 0 ? styles.evenBeatHue : styles.oddBeatHue
                                            }`}
                                            style={{ height: beatSizePortrait }}
                                        />
                                    ))}
                                </div>

                                {/* Grid rows */}
                                {grid[0]?.map((_, stepIndex) => (
                                    <div className={styles.gridRowPortrait} key={`row-${stepIndex}`}>
                                        {grid.map((_, instrumentIndex) => (
                                            <div
                                                key={`cell-${stepIndex}-${instrumentIndex}`}
                                                className={`${styles.cellPortrait} ${styles.responsiveCell} ${
                                                    currentStep === stepIndex ? styles.playing : ''
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={grid[instrumentIndex][stepIndex]}
                                                    onChange={() => toggle(instrumentIndex, stepIndex)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // LANDSCAPE MODE: Keep original layout (steps as columns, instruments as rows)
    return (
        <div className={styles.drumGridOuter} data-orientation="landscape">
            <div className={styles.fixedGridContainer}>
                {/* Controls column on left */}
                <div className={styles.controlsColumn}>
                    {grid.map((_, rowIndex) => (
                        <div className={styles.controlsBox} key={`controls-${rowIndex}`}>
                            <div
                                className={styles.instrumentEmoji}
                                title={instruments[rowIndex]}
                            >
                                {instrumentEmojis[instruments[rowIndex]]}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Scrollable grid */}
                <div className={styles.scrollContainer}>
                    <div className={styles.innerGridContainer}>
                        <div className={styles.gridContainer}>
                            <div className={styles.beatBackground}>
                                {Array.from({ length: numCols / numSubdivisions }).map((_, beatIndex) => (
                                    <div
                                        key={`beat-bg-${beatIndex}`}
                                        className={`${styles.beatStripe} ${
                                            beatIndex % 2 === 0 ? styles.evenBeatHue : styles.oddBeatHue
                                        }`}
                                        style={{ width: beatSizeLandscape }}
                                    />
                                ))}
                            </div>

                            <div className={styles.drumGrid}>
                                {grid.map((row, rowIndex) => (
                                    <div className={styles.gridRow} key={`row-${rowIndex}`}>
                                        {row.map((checked, colIndex) => (
                                            <div
                                                key={`cell-${rowIndex}-${colIndex}`}
                                                className={`${styles.cell} ${styles.responsiveCell} ${
                                                    currentStep === colIndex ? styles.playing : ''
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggle(rowIndex, colIndex)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
