import React from 'react';
import { useStore } from '../store';
import styles from '../styles/DrumGrid.module.css';

interface DrumGridProps {
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
    currentStep?: number;
}

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
    // Portrait: steps flow vertically, account for row gaps
    const beatSizePortrait = `calc(var(--drum-grid-row-height) * 0.9 * ${numSubdivisions} + 6px * ${numSubdivisions})`;
    // Landscape: steps flow horizontally, no gap accounting needed
    const beatSizeLandscape = `calc(var(--drum-grid-row-height) * 0.9 * ${numSubdivisions})`;

    const isPortrait = orientation === 'portrait';

    // PORTRAIT MODE: Render grid with steps as rows, instruments as columns
    if (isPortrait) {
        return (
            <div className={styles.drumGridOuter} data-orientation="portrait">
                <div className={styles.portraitContainer}>
                    {/* Controls row at top */}
                    <div className={styles.controlsRowPortrait}>
                        {/* Ghost column spacer */}
                        <div className={styles.controlsSpacerPortrait} style={{ fontSize: fontSize * 1.8 }}>
                            Time
                        </div>

                        {/* Instrument controls in horizontal row */}
                        {grid.map((_, instrumentIndex) => (
                            <div className={styles.controlsBoxPortrait} key={`controls-${instrumentIndex}`}>
                                <select
                                    className={styles.sampleComboBox}
                                    value={selectedSamples[instrumentIndex]}
                                    onChange={(e) => setSelectedSample(instrumentIndex, e.target.value)}
                                    style={{ fontSize: `${computedFontSize * 0.7}px` }}
                                    title={instruments[instrumentIndex]}
                                >
                                    {['1', '2', '3'].map((num) => (
                                        <option key={num} value={`${instruments[instrumentIndex]}${num}`}>
                                            {instruments[instrumentIndex].slice(0, 3).toUpperCase()} {num}
                                        </option>
                                    ))}
                                </select>

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

                    {/* Scrollable grid area */}
                    <div className={styles.scrollContainerPortrait}>
                        <div className={styles.innerGridContainerPortrait}>
                            {/* Ghost column on left (shows current step) */}
                            <div className={styles.ghostColumnWrapper}>
                                <div className={styles.ghostColumnSpacer} />
                                {Array.from({ length: numCols }).map((_, stepIndex) => (
                                    <div
                                        key={`ghost-${stepIndex}`}
                                        className={`${styles.ghostCellPortrait} ${
                                            currentStep === stepIndex ? styles.active : ''
                                        }`}
                                    />
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
                    <div className={styles.controlsBoxSpacer} style={{ fontSize: fontSize * 1.8 }}>
                        Sounds
                    </div>

                    {grid.map((_, rowIndex) => (
                        <div className={styles.controlsBox} key={`controls-${rowIndex}`}>
                            <select
                                className={styles.sampleComboBox}
                                value={selectedSamples[rowIndex]}
                                onChange={(e) => setSelectedSample(rowIndex, e.target.value)}
                                style={{ fontSize: `${computedFontSize}px` }}
                            >
                                {['1', '2', '3'].map((num) => (
                                    <option key={num} value={`${instruments[rowIndex]}${num}`}>
                                        {`${instruments[rowIndex].slice(0, 1).toUpperCase() + instruments[rowIndex].slice(1)}`}{' '}
                                        {num}
                                    </option>
                                ))}
                            </select>

                            <input
                                className={styles.volumeSlider}
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volumes[rowIndex]}
                                onChange={(e) => setVolume(rowIndex, parseFloat(e.target.value))}
                            />
                        </div>
                    ))}
                </div>

                {/* Scrollable grid */}
                <div className={styles.scrollContainer}>
                    <div className={styles.innerGridContainer}>
                        <div className={styles.gridContainer}>
                            <div className={styles.ghostRowWrapper}>
                                <div className={styles.ghostRow}>
                                    <div className={styles.ghostSpacer} />
                                    <div style={{ display: 'flex' }}>
                                        {Array.from({ length: numCols }).map((_, colIndex) => (
                                            <div
                                                key={`ghost-${colIndex}`}
                                                className={`${styles.ghostCell} ${currentStep === colIndex ? styles.active : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

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
