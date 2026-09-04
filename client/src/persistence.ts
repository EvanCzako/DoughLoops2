import { encodeDrumGrid, decodeDrumGrid } from './utils';

const WORKING_LOOP_KEY = 'doughloops.workingLoop';

export interface WorkingLoop {
    bpm: number;
    numBeats: number;
    subdivisions: number;
    grid: boolean[][];
    samples: string[];
    volumes: number[];
    name: string;
}

/*
 * The working pattern is stored as a beatRep -- the same string the API and the
 * demo loops use -- so there is one format to reason about rather than a second
 * localStorage-only shape that could drift from it.
 */
export function saveWorkingLoop(loop: WorkingLoop): void {
    try {
        localStorage.setItem(
            WORKING_LOOP_KEY,
            JSON.stringify({ name: loop.name, beatRep: encodeDrumGrid(loop) })
        );
    } catch {
        /* Storage unavailable or full: the session just won't survive a reload. */
    }
}

export function loadWorkingLoop(): WorkingLoop | null {
    try {
        const raw = localStorage.getItem(WORKING_LOOP_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as { name?: unknown; beatRep?: unknown };
        if (typeof parsed?.beatRep !== 'string') return null;

        const decoded = decodeDrumGrid(parsed.beatRep);
        if (!decoded) return null;

        return {
            ...decoded,
            name: typeof parsed.name === 'string' ? parsed.name : '',
        };
    } catch {
        return null;
    }
}

export function clearWorkingLoop(): void {
    try {
        localStorage.removeItem(WORKING_LOOP_KEY);
    } catch {
        /* Nothing to do. */
    }
}
