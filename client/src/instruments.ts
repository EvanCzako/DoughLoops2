export interface Instrument {
    key: string;
    emoji: string;
    label: string;
}

/*
 * The single source of truth for instrument identity and ordering.
 *
 * Position in this array IS the row index in the grid, the index into
 * `volumes`, `selectedSamples` and `instrumentVariants`, and the row order in
 * an encoded `beatRep`. Reordering or resizing this array changes the on-disk
 * format for every saved loop, so don't.
 */
export const INSTRUMENTS: readonly Instrument[] = [
    { key: 'kick', emoji: '🥾', label: 'Kick' },
    { key: 'clap', emoji: '👏', label: 'Clap' },
    { key: 'snare', emoji: '🥁', label: 'Snare' },
    { key: 'hat', emoji: '📀', label: 'Hi-hat' },
    { key: 'rim', emoji: '🎯', label: 'Rim' },
    { key: 'tom', emoji: '🪘', label: 'Tom' },
    { key: 'cymbal', emoji: '✨', label: 'Cymbal' },
    { key: 'triangle', emoji: '🔺', label: 'Triangle' },
];

export const INSTRUMENT_KEYS: readonly string[] = INSTRUMENTS.map((i) => i.key);
export const NUM_INSTRUMENTS = INSTRUMENTS.length;

export const SAMPLE_VARIANTS = [1, 2, 3] as const;

export const SAMPLE_NAMES: ReadonlySet<string> = new Set(
    INSTRUMENT_KEYS.flatMap((key) => SAMPLE_VARIANTS.map((v) => `${key}${v}`))
);

/** Falls back to variant 1 of the row's own instrument for unknown names. */
export function resolveSampleName(rowIndex: number, sampleName: string | undefined): string {
    if (sampleName && SAMPLE_NAMES.has(sampleName)) return sampleName;
    return `${INSTRUMENT_KEYS[rowIndex] ?? INSTRUMENTS[0].key}1`;
}

export function variantOf(sampleName: string): number {
    const n = Number(sampleName.slice(-1));
    return Number.isInteger(n) && n >= 1 && n <= 3 ? n : 1;
}
