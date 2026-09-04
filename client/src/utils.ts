import { NUM_INSTRUMENTS, resolveSampleName } from './instruments';

export interface DrumGridData {
    bpm: number;
    numBeats: number;
    subdivisions: number;
    grid: boolean[][];
    samples: string[];
    volumes: number[];
}

const MAX_BEATS = 16;
const MAX_SUBDIVISIONS = 8;

function encodeDrumGrid({
    bpm,
    numBeats,
    subdivisions,
    grid,
    samples,
    volumes,
}: DrumGridData): string {
    const meta = `${bpm},${numBeats},${subdivisions}`;
    const config = samples.map((s, i) => `${s}:${volumes[i]}`).join('|');
    const gridRows = grid.map((row) => row.map((cell) => (cell ? '1' : '0')).join(''));
    return `${meta}::${config}::${gridRows.join('::')}`;
}

/*
 * Parses a beatRep. This is the trust boundary for three different sources --
 * the API, the hardcoded demo loops, and localStorage -- so it normalises
 * rather than assuming: rows are padded or truncated to the instrument count,
 * unknown sample names fall back to their row's own instrument, and a
 * non-finite volume becomes 1. Returns null only when the string is
 * unsalvageable.
 */
function decodeDrumGrid(encoded: string): DrumGridData | null {
    try {
        const [meta, config, ...rows] = encoded.split('::');
        if (!meta || !config || rows.length === 0) return null;

        const [bpmStr, beatsStr, subsStr] = meta.split(',');
        const bpm = parseInt(bpmStr, 10);
        const numBeats = parseInt(beatsStr, 10);
        const subdivisions = parseInt(subsStr, 10);

        if (!Number.isInteger(bpm) || bpm < 20 || bpm > 300) return null;
        if (!Number.isInteger(numBeats) || numBeats < 1 || numBeats > MAX_BEATS) return null;
        if (
            !Number.isInteger(subdivisions) ||
            subdivisions < 1 ||
            subdivisions > MAX_SUBDIVISIONS
        ) {
            return null;
        }

        const cols = numBeats * subdivisions;
        if (rows.some((row) => row.length !== cols || /[^01]/.test(row))) return null;

        const grid: boolean[][] = [];
        for (let i = 0; i < NUM_INSTRUMENTS; i += 1) {
            const row = rows[i];
            grid.push(
                row ? [...row].map((char) => char === '1') : Array<boolean>(cols).fill(false)
            );
        }

        const sampleData = config.split('|');
        const samples: string[] = [];
        const volumes: number[] = [];
        for (let i = 0; i < NUM_INSTRUMENTS; i += 1) {
            const [name, volume] = (sampleData[i] ?? '').split(':');
            samples.push(resolveSampleName(i, name));
            const parsed = parseFloat(volume);
            volumes.push(Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 1);
        }

        return { bpm, numBeats, subdivisions, grid, samples, volumes };
    } catch {
        return null;
    }
}

export { encodeDrumGrid, decodeDrumGrid };
