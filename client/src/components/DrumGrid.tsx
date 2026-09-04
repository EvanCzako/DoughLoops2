import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useStore } from '../store';
import { INSTRUMENTS, resolveSampleName, variantOf } from '../instruments';
import { computeGridMetrics } from '../gridMetrics';
import styles from '../styles/DrumGrid.module.css';

interface DrumGridProps {
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
}

/* Variant 1/2/3 read as three colourways of the same emoji. */
const VARIANT_HUE: Record<number, number> = { 1: 0, 2: 120, 3: 240 };

export default function DrumGrid({ grid, setGrid }: DrumGridProps) {
    const currentStep = useStore((s) => s.currentStep);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const selectedSamples = useStore((s) => s.selectedSamples);
    const setSelectedSample = useStore((s) => s.setSelectedSample);
    const volumes = useStore((s) => s.volumes);
    const setVolume = useStore((s) => s.setVolume);

    const [openVolume, setOpenVolume] = useState<number | null>(null);
    const [focused, setFocused] = useState({ row: 0, col: 0 });

    const gridRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const sequencerRef = useRef<HTMLDivElement>(null);

    const numRows = grid.length;
    const numCols = grid[0]?.length ?? 0;
    const numBeats = numSubdivisions > 0 ? Math.ceil(numCols / numSubdivisions) : 0;

    /*
     * Size the cells from the panel we are actually in, not from the viewport.
     * Observing the sequencer (rather than the scroll area) keeps this out of a
     * feedback loop: the kit track's width is derived from the cell height,
     * so measuring the scroll area would make the observed box depend on the
     * value being computed.
     */
    useEffect(() => {
        const el = sequencerRef.current;
        if (!el) return;

        const apply = (rect: { width: number; height: number }) => {
            const { width, height } = rect;
            const isPortrait = window.matchMedia('(orientation: portrait)').matches;
            const m = computeGridMetrics(width, height, numCols, numRows, isPortrait);

            // Floor, not round: rounding up half a pixel per track is enough to
            // push the grid past its container and show a permanent scrollbar.
            el.style.setProperty('--cell-w', `${Math.floor(m.cellW)}px`);
            el.style.setProperty('--cell-h', `${Math.floor(m.cellH)}px`);
            el.style.setProperty('--kit-main', `${Math.floor(m.kitMain)}px`);
        };

        const contentBox = () => {
            const cs = getComputedStyle(el);
            return {
                width: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
                height: el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom),
            };
        };

        apply(contentBox());

        // contentRect is the content box, so padding is already excluded and a
        // scrollbar appearing inside the grid cannot feed back into the size.
        const observer = new ResizeObserver(([entry]) => apply(entry.contentRect));
        observer.observe(el);
        return () => observer.disconnect();
    }, [numCols, numRows]);

    useEffect(() => {
        if (openVolume === null) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!controlsRef.current?.contains(event.target as Node)) setOpenVolume(null);
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpenVolume(null);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openVolume]);

    const toggle = (row: number, col: number) => {
        setGrid(grid.map((r, ri) => (ri === row ? r.map((c, ci) => (ci === col ? !c : c)) : r)));
    };

    const cycleVariant = (row: number) => {
        const current = variantOf(resolveSampleName(row, selectedSamples[row]));
        const next = current === 3 ? 1 : current + 1;
        setSelectedSample(row, `${INSTRUMENTS[row].key}${next}`);
    };

    /*
     * Roving tabindex. Only one cell is in the tab order at a time -- otherwise
     * a 16-beat pattern puts 512 checkboxes between the grid and everything
     * after it -- and the arrow keys walk the pattern.
     */
    const handleKeyDown = useCallback(
        (event: ReactKeyboardEvent<HTMLDivElement>) => {
            const deltas: Record<string, [number, number]> = {
                ArrowUp: [-1, 0],
                ArrowDown: [1, 0],
                ArrowLeft: [0, -1],
                ArrowRight: [0, 1],
            };
            const delta = deltas[event.key];
            if (!delta) return;

            // Read the origin off the focused element rather than component
            // state: held arrow keys repeat faster than React re-renders, and
            // state would still be reporting the previous cell.
            const origin = event.target as HTMLElement;
            const fromRow = Number(origin.dataset.row);
            const fromCol = Number(origin.dataset.col);
            if (!Number.isInteger(fromRow) || !Number.isInteger(fromCol)) return;

            event.preventDefault();
            const row = Math.min(Math.max(fromRow + delta[0], 0), numRows - 1);
            const col = Math.min(Math.max(fromCol + delta[1], 0), numCols - 1);

            gridRef.current
                ?.querySelector<HTMLInputElement>(`[data-row="${row}"][data-col="${col}"]`)
                ?.focus();
        },
        [numRows, numCols]
    );

    return (
        <div
            ref={sequencerRef}
            className={styles.sequencer}
            style={{ '--num-rows': numRows, '--num-cols': numCols } as CSSProperties}
        >
            <div className={styles.controlsTrack} ref={controlsRef}>
                {INSTRUMENTS.slice(0, numRows).map((instrument, row) => {
                    const variant = variantOf(resolveSampleName(row, selectedSamples[row]));
                    return (
                        <div
                            className={styles.controlItem}
                            key={instrument.key}
                            style={{ '--lane': row } as CSSProperties}
                        >
                            <button
                                type="button"
                                className={styles.instrumentButton}
                                onClick={() => cycleVariant(row)}
                                aria-label={`${instrument.label}: sound ${variant} of 3. Activate to cycle.`}
                            >
                                <span
                                    className={styles.instrumentEmoji}
                                    style={{
                                        filter: `hue-rotate(${VARIANT_HUE[variant] ?? 0}deg)`,
                                    }}
                                    aria-hidden="true"
                                >
                                    {instrument.emoji}
                                </span>
                                <span className={styles.variantBadge} aria-hidden="true">
                                    {variant}
                                </span>
                            </button>

                            <button
                                type="button"
                                className={styles.volumeButton}
                                onClick={() => setOpenVolume(openVolume === row ? null : row)}
                                aria-expanded={openVolume === row}
                                aria-label={`${instrument.label} volume, ${Math.round((volumes[row] ?? 1) * 100)}%`}
                            >
                                <svg
                                    className={styles.volumeIcon}
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M4 9h3.5L12 4.5v15L7.5 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z" />
                                    <path d="M15.5 8.5a4.5 4.5 0 0 1 0 7v-1.8a2.8 2.8 0 0 0 0-3.4V8.5z" />
                                    <path d="M18 5.5a8 8 0 0 1 0 13v-1.8a6.2 6.2 0 0 0 0-9.4V5.5z" />
                                </svg>
                            </button>

                            {openVolume === row && (
                                <div className={styles.volumePopup}>
                                    <span className={styles.volumeValue} aria-hidden="true">
                                        {Math.round((volumes[row] ?? 1) * 100)}
                                    </span>
                                    <input
                                        className={styles.volumeSlider}
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        autoFocus
                                        value={Number.isFinite(volumes[row]) ? volumes[row] : 1}
                                        aria-label={`${instrument.label} volume`}
                                        onChange={(e) => setVolume(row, parseFloat(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className={styles.scrollArea}>
                <div
                    className={styles.grid}
                    ref={gridRef}
                    role="group"
                    aria-label="Step sequencer pattern"
                    onKeyDown={handleKeyDown}
                >
                    {Array.from({ length: numBeats }, (_, beat) => (
                        <div
                            key={`ruler-${beat}`}
                            className={styles.beatMarker}
                            style={{ '--beat-start': beat * numSubdivisions + 1 } as CSSProperties}
                            aria-hidden="true"
                        >
                            {beat + 1}
                        </div>
                    ))}

                    {Array.from({ length: numBeats }, (_, beat) => (
                        <div
                            key={`beat-${beat}`}
                            className={`${styles.beatStripe} ${beat % 2 === 0 ? styles.evenBeat : styles.oddBeat}`}
                            style={
                                {
                                    '--beat-start': beat * numSubdivisions + 1,
                                    '--beat-span': Math.min(
                                        numSubdivisions,
                                        numCols - beat * numSubdivisions
                                    ),
                                } as CSSProperties
                            }
                            aria-hidden="true"
                        />
                    ))}

                    {grid.map((row, rowIndex) =>
                        row.map((checked, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`${styles.cell} ${currentStep === colIndex ? styles.playing : ''}`}
                                style={
                                    {
                                        '--row': rowIndex + 1,
                                        '--col': colIndex + 1,
                                    } as CSSProperties
                                }
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    data-row={rowIndex}
                                    data-col={colIndex}
                                    tabIndex={
                                        focused.row === rowIndex && focused.col === colIndex
                                            ? 0
                                            : -1
                                    }
                                    aria-label={`${INSTRUMENTS[rowIndex]?.label ?? `Row ${rowIndex + 1}`}, beat ${Math.floor(colIndex / numSubdivisions) + 1}, step ${(colIndex % numSubdivisions) + 1}`}
                                    onFocus={() => setFocused({ row: rowIndex, col: colIndex })}
                                    onChange={() => toggle(rowIndex, colIndex)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
