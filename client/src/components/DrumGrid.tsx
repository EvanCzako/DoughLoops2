import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import styles from '../styles/DrumGrid.module.css';

interface DrumGridProps {
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
    currentStep?: number;
}

const instrumentEmojis: Record<string, string> = {
    kick: '🥾',
    clap: '👏',
    snare: '🥁',
    hat: '📀',
    rim: '🎯',
    tom: '🪘',
    cymbal: '✨',
    triangle: '🔺',
};

export default function DrumGrid({ grid, setGrid, currentStep }: DrumGridProps) {
    const [volumeSliderOpen, setVolumeSliderOpen] = useState<Set<number>>(new Set());
    const [popupPositions, setPopupPositions] = useState<Record<number, { top: number; left: number }>>({});
    const volumeSliderRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const volumeButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const controlItemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const orientation = useStore((s) => s.orientation);
    const instruments = ['kick', 'clap', 'snare', 'hat', 'rim', 'tom', 'cymbal', 'triangle'];
    const selectedSamples = useStore((s) => s.selectedSamples);
    const setSelectedSample = useStore((s) => s.setSelectedSample);
    const volumes = useStore((s) => s.volumes);
    const setVolume = useStore((s) => s.setVolume);
    const fontSize = useStore((s) => s.fontSize);
    const instrumentVariants = useStore((s) => s.instrumentVariants);
    const setInstrumentVariant = useStore((s) => s.setInstrumentVariant);
    const computedFontSize = Math.max(10, fontSize * 1.4);
    const isPortrait = orientation === 'portrait';

    // Calculate popup positions when opened or window resizes
    useEffect(() => {
        const updatePositions = () => {
            const newPositions: Record<number, { top: number; left: number }> = {};
            volumeSliderOpen.forEach((instrumentIndex) => {
                if (volumeButtonRefs.current[instrumentIndex]) {
                    const button = volumeButtonRefs.current[instrumentIndex];
                    if (button) {
                        const rect = button.getBoundingClientRect();
                        if (isPortrait) {
                            // Portrait: popup below the button, centered
                            newPositions[instrumentIndex] = {
                                top: rect.bottom + 4,
                                left: rect.left + rect.width / 2,
                            };
                        } else {
                            // Landscape: popup to the right of the button
                            newPositions[instrumentIndex] = {
                                top: rect.top + rect.height / 2,
                                left: rect.right + 4,
                            };
                        }
                    }
                }
            });
            setPopupPositions(newPositions);
        };

        // Use requestAnimationFrame to ensure DOM is fully updated
        if (volumeSliderOpen.size > 0) {
            requestAnimationFrame(updatePositions);
        }

        if (volumeSliderOpen.size > 0) {
            window.addEventListener('resize', updatePositions);
            return () => {
                window.removeEventListener('resize', updatePositions);
            };
        }
    }, [volumeSliderOpen, isPortrait]);

    // Close volume slider when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isClickOnButton = volumeButtonRefs.current.some(
                (btn) => btn && btn.contains(target)
            );
            const isClickOnSlider = Array.from(volumeSliderOpen).some(
                (idx) => volumeSliderRefs.current[idx]?.contains(target)
            );

            if (!isClickOnSlider && !isClickOnButton) {
                setVolumeSliderOpen(new Set());
            }
        };

        if (volumeSliderOpen.size > 0) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [volumeSliderOpen]);

    const cycleVariant = (index: number) => {
        const currentVariant = instrumentVariants[index];
        const nextVariant = currentVariant === 3 ? 1 : currentVariant + 1;
        setInstrumentVariant(index, nextVariant);
        // Update the selected sample to match the new variant
        const newSample = `${instruments[index]}${nextVariant}`;
        setSelectedSample(index, newSample);
    };

    const getHueRotation = (variant: number): number => {
        switch (variant) {
            case 1:
                return 0;
            case 2:
                return 120;
            case 3:
                return 240;
            default:
                return 0;
        }
    };

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

    // PORTRAIT MODE: Render grid with steps as rows, instruments as columns
    if (isPortrait) {
        return (
            <div className={styles.drumGridOuter} data-orientation="portrait">
                <div className={styles.portraitContainer}>
                    {/* Controls row at top - FIXED, outside scroll container */}
                    <div className={styles.controlsRowPortrait}>
                        {/* Instrument controls in horizontal row */}
                        {grid.map((_, instrumentIndex) => (
                            <div
                                className={styles.controlsItemPortrait}
                                key={`controls-${instrumentIndex}`}
                                ref={(el) => {
                                    if (el) controlItemRefs.current[instrumentIndex] = el;
                                }}
                            >
                                {/* Instrument control box */}
                                <div
                                    className={styles.controlsBoxPortrait}
                                    onClick={() => cycleVariant(instrumentIndex)}
                                    style={{
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div
                                        className={styles.instrumentEmojiPortrait}
                                        title={`${instruments[instrumentIndex]} (Variant ${instrumentVariants[instrumentIndex]})`}
                                        style={{
                                            filter: `hue-rotate(${getHueRotation(instrumentVariants[instrumentIndex])}deg)`,
                                        }}
                                    >
                                        {instrumentEmojis[instruments[instrumentIndex]]}
                                    </div>
                                </div>

                                {/* Volume button - small and yellow, BELOW the control box */}
                                <button
                                    className={styles.volumeButtonPortrait}
                                    ref={(el) => {
                                        if (el) volumeButtonRefs.current[instrumentIndex] = el;
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newSet = new Set(volumeSliderOpen);
                                        if (newSet.has(instrumentIndex)) {
                                            newSet.delete(instrumentIndex);
                                        } else {
                                            newSet.add(instrumentIndex);
                                        }
                                        setVolumeSliderOpen(newSet);
                                    }}
                                    title="Adjust volume"
                                >
                                    Vol
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Volume slider popups - fixed positioning */}
                    {Array.from(volumeSliderOpen).map((instrumentIndex) => (
                        <div
                            key={`volume-popup-${instrumentIndex}`}
                            className={styles.volumeSliderPopup}
                            ref={(el) => {
                                if (el) volumeSliderRefs.current[instrumentIndex] = el;
                            }}
                            style={{
                                top: `${popupPositions[instrumentIndex]?.top || 0}px`,
                                left: `${popupPositions[instrumentIndex]?.left || 0}px`,
                                transform: 'translateX(-50%)',
                                width: `calc(${controlItemRefs.current[instrumentIndex]?.offsetWidth || 70}px - 4px)`,
                                visibility: popupPositions[instrumentIndex] ? 'visible' : 'hidden',
                            }}
                        >
                            <input
                                className={styles.volumeSliderPopupInput}
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volumes[instrumentIndex]}
                                onChange={(e) => setVolume(instrumentIndex, parseFloat(e.target.value))}
                            />
                        </div>
                    ))}

                    {/* Scrollable grid area - below controls */}
                    <div className={styles.scrollContainerPortrait}>
                        <div className={styles.innerGridContainerPortrait}>
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
                        <div
                            className={styles.controlsItemLandscape}
                            key={`controls-${rowIndex}`}
                            ref={(el) => {
                                if (el) controlItemRefs.current[rowIndex] = el;
                            }}
                        >
                            <div
                                className={styles.controlsBox}
                                onClick={() => cycleVariant(rowIndex)}
                                style={{
                                    cursor: 'pointer',
                                }}
                            >
                                <div
                                    className={styles.instrumentEmoji}
                                    title={`${instruments[rowIndex]} (Variant ${instrumentVariants[rowIndex]})`}
                                    style={{
                                        filter: `hue-rotate(${getHueRotation(instrumentVariants[rowIndex])}deg)`,
                                    }}
                                >
                                    {instrumentEmojis[instruments[rowIndex]]}
                                </div>
                            </div>

                            {/* Volume button on the right - landscape mode */}
                            <button
                                className={styles.volumeButtonLandscape}
                                ref={(el) => {
                                    if (el) volumeButtonRefs.current[rowIndex] = el;
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newSet = new Set(volumeSliderOpen);
                                    if (newSet.has(rowIndex)) {
                                        newSet.delete(rowIndex);
                                    } else {
                                        newSet.add(rowIndex);
                                    }
                                    setVolumeSliderOpen(newSet);
                                }}
                                title="Adjust volume"
                            >
                                V
                            </button>
                        </div>
                    ))}
                </div>

                {/* Volume slider popups - fixed positioning */}
                {Array.from(volumeSliderOpen).map((rowIndex) => (
                    <div
                        key={`volume-popup-${rowIndex}`}
                        className={styles.volumeSliderPopupLandscape}
                        ref={(el) => {
                            if (el) volumeSliderRefs.current[rowIndex] = el;
                        }}
                        style={{
                            top: `${popupPositions[rowIndex]?.top || 0}px`,
                            left: `${popupPositions[rowIndex]?.left || 0}px`,
                            height: `calc(${controlItemRefs.current[rowIndex]?.offsetHeight || 32}px - 4px)`,
                            visibility: popupPositions[rowIndex] ? 'visible' : 'hidden',
                        }}
                    >
                        <input
                            className={styles.volumeSliderPopupInputLandscape}
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volumes[rowIndex]}
                            onChange={(e) => setVolume(rowIndex, parseFloat(e.target.value))}
                        />
                    </div>
                ))}

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
