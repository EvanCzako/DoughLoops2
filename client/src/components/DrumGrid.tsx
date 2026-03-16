import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import styles from '../styles/DrumGrid.module.css';

interface DrumGridProps {
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
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

export default function DrumGrid({ grid, setGrid }: DrumGridProps) {
    const [volumeSliderOpen, setVolumeSliderOpen] = useState<Set<number>>(new Set());
    const [popupPositions, setPopupPositions] = useState<
        Record<number, { top: number; left: number }>
    >({});
    const volumeSliderRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const volumeButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const controlItemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const currentStep = useStore((s) => s.currentStep);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const orientation = useStore((s) => s.orientation);
    const instruments = ['kick', 'clap', 'snare', 'hat', 'rim', 'tom', 'cymbal', 'triangle'];
    const setSelectedSample = useStore((s) => s.setSelectedSample);
    const volumes = useStore((s) => s.volumes);
    const setVolume = useStore((s) => s.setVolume);
    const instrumentVariants = useStore((s) => s.instrumentVariants);
    const setInstrumentVariant = useStore((s) => s.setInstrumentVariant);
    const isPortrait = orientation === 'portrait';

    useEffect(() => {
        if (volumeSliderOpen.size === 0) return;

        const updatePositions = () => {
            const newPositions: Record<number, { top: number; left: number }> = {};
            volumeSliderOpen.forEach((instrumentIndex) => {
                const button = volumeButtonRefs.current[instrumentIndex];
                if (button) {
                    const rect = button.getBoundingClientRect();
                    if (isPortrait) {
                        newPositions[instrumentIndex] = {
                            top: rect.bottom + 4,
                            left: rect.left + rect.width / 2,
                        };
                    } else {
                        newPositions[instrumentIndex] = {
                            top: rect.top + rect.height / 2,
                            left: rect.right + 4,
                        };
                    }
                }
            });
            setPopupPositions(newPositions);
        };

        const rafId = requestAnimationFrame(updatePositions);
        window.addEventListener('resize', updatePositions);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', updatePositions);
        };
    }, [volumeSliderOpen, isPortrait]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isClickOnButton = volumeButtonRefs.current.some(
                (btn) => btn && btn.contains(target)
            );
            const isClickOnSlider = Array.from(volumeSliderOpen).some((idx) =>
                volumeSliderRefs.current[idx]?.contains(target)
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

    const beatSizePortrait = `${(numSubdivisions / numCols) * 100}%`;

    const beatSizeLandscape = `calc(var(--grid-cell-size) * ${numSubdivisions})`;

    if (isPortrait) {
        return (
            <div className={styles.drumGridOuter} data-orientation="portrait">
                <div className={styles.portraitContainer}>
                    <div className={styles.controlsRowPortrait}>
                        {grid.map((_, instrumentIndex) => (
                            <div
                                className={styles.controlsItemPortrait}
                                key={`controls-${instrumentIndex}`}
                                ref={(el) => {
                                    if (el) controlItemRefs.current[instrumentIndex] = el;
                                }}
                            >
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
                                onChange={(e) =>
                                    setVolume(instrumentIndex, parseFloat(e.target.value))
                                }
                            />
                        </div>
                    ))}

                    <div className={styles.scrollContainerPortrait}>
                        <div className={styles.innerGridContainerPortrait}>
                            <div className={styles.drumGridPortrait}>
                                <div className={styles.beatBackgroundPortrait}>
                                    {Array.from({ length: numCols / numSubdivisions }).map(
                                        (_, beatIndex) => (
                                            <div
                                                key={`beat-bg-${beatIndex}`}
                                                className={`${styles.beatStripePortrait} ${
                                                    beatIndex % 2 === 0
                                                        ? styles.evenBeatHue
                                                        : styles.oddBeatHue
                                                }`}
                                                style={{ height: beatSizePortrait }}
                                            />
                                        )
                                    )}
                                </div>

                                {grid[0]?.map((_, stepIndex) => (
                                    <div
                                        className={styles.gridRowPortrait}
                                        key={`row-${stepIndex}`}
                                    >
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
                                                    onChange={() =>
                                                        toggle(instrumentIndex, stepIndex)
                                                    }
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

    return (
        <div className={styles.drumGridOuter} data-orientation="landscape">
            <div className={styles.fixedGridContainer}>
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

                <div className={styles.scrollContainer}>
                    <div className={styles.innerGridContainer}>
                        <div className={styles.gridContainer}>
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
                                            style={{ width: beatSizeLandscape }}
                                        />
                                    )
                                )}
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
