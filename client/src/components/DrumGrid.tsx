import React from 'react';
import { useStore } from '../store';
import styles from '../styles/DrumGrid.module.css';
import Knob from './Knob';


interface DrumGridProps {
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
    currentStep?: number;
}

export default function DrumGrid({ grid, setGrid, currentStep }: DrumGridProps) {
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const instruments = ['kick', 'clap', 'snare', 'hat', 'rim', 'tom', 'cymbal', 'triangle'];
    const selectedSamples = useStore((s) => s.selectedSamples);
    const setSelectedSample = useStore((s) => s.setSelectedSample);
	const volumes = useStore((s) => s.volumes);
	const setVolume = useStore((s) => s.setVolume);

    const toggle = (row: number, col: number) => {
        const updated = grid.map((r, ri) =>
            ri === row ? r.map((c, ci) => (ci === col ? !c : c)) : r
        );
        setGrid(updated);
    };

    const numCols = grid[0]?.length || 0;
    const numRows = grid.length;

    // Calculate beat width in px for each beat group
    const beatWidth = `calc(var(--cell-size) * ${numSubdivisions})`;

    return (
        <div className={styles.drumGridOuter}>
            <div className={styles.scrollContainer} style={{ width: '100%', overflowX: 'auto' }}>
                <div className={styles.innerGridContainer} style={{ width: 'fit-content' }}>
                    {/* Ghost Row */}
                    <div className={styles.ghostRow}>
                        <span className={styles.label} /> {/* label spacer */}
                        {Array.from({ length: numCols }).map((_, colIndex) => (
                            <div
                                key={`ghost-${colIndex}`}
                                className={`${styles.ghostCell} ${
                                    currentStep === colIndex ? styles.active : ''
                                }`}
                            />
                        ))}
                    </div>

                    {/* Drum grid container (position: relative) */}
                    <div className={styles.gridContainer}>
                        {/* Beat background stripes */}
                        <div className={styles.beatBackground}>
                            {Array.from({ length: numCols / numSubdivisions }).map(
                                (_, beatIndex) => (
                                    <div
                                        key={`beat-bg-${beatIndex}`}
                                        className={`${styles.beatStripe} ${
                                            beatIndex % 2 === 0
                                                ? styles.evenBeatHue
                                                : styles.oddBeatHue
                                        }`}
                                        style={{ width: beatWidth }}
                                    />
                                )
                            )}
                        </div>

                        {/* Drum Grid Rows */}
                        <div className={styles.drumGrid}>
							{grid.map((row, rowIndex) => (
							<div className={styles.gridRow} key={`row-${rowIndex}`}>
							
								<div className={styles.controlsBox}>
									<select
										className={styles.sampleComboBox}
										value={selectedSamples[rowIndex]}
										onChange={(e) => setSelectedSample(rowIndex, e.target.value)}
									>
										{['1', '2', '3'].map((num) => (
											<option key={num} value={`${instruments[rowIndex]}${num}`}>
												{instruments[rowIndex]}{num}
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


								{row.map((checked, colIndex) => (
								<div
									key={`cell-${rowIndex}-${colIndex}`}
									className={`${styles.cell} ${styles.responsiveCell} ${currentStep === colIndex ? styles.playing : ''}`}
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
    );
}
