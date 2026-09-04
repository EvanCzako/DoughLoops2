import { create } from 'zustand';
import { decodeDrumGrid } from './utils';
import { storeToken } from './api';
import { loadWorkingLoop, saveWorkingLoop } from './persistence';

export type SampleStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface User {
    id: number;
    username: string;
}

export interface DoughLoop {
    id: number;
    userId: number;
    name: string;
    beatRep: string;
}

const DEFAULT_FUNK_LOOP: DoughLoop = {
    id: -7,
    userId: -1,
    name: 'Funk',
    beatRep:
        '95,4,4::kick1:1|clap1:1|snare2:1|hat1:0.48|rim3:1|tom3:0.54|cymbal1:1|triangle1:1::1000100110011000::0000100000000000::0000000000001000::1000000110001001::0000001001000000::0000000000000010::0000000000000000::0000000000000000',
};

interface StoreState {
    user: User | null;
    token: string | null;
    doughLoops: DoughLoop[];
    loading: boolean;
    error: string | null;
    numBeats: number;
    numSubdivisions: number;
    bpm: number;
    isPlaying: boolean;
    currentStep: number;
    sampleStatus: SampleStatus;
    selectedLoop: DoughLoop | null;
    name: string;
    grid: boolean[][];
    selectedSamples: string[];
    volumes: number[];
    userDropdownOpen: boolean;
    demoDropdownOpen: boolean;

    setVolume: (index: number, volume: number) => void;
    setSelectedSample: (index: number, sample: string) => void;
    setName: (name: string) => void;
    setGrid: (grid: boolean[][]) => void;
    setSelectedLoop: (loop: DoughLoop | null) => void;
    setCurrentStep: (step: number) => void;
    setNumBeats: (numBeats: number) => void;
    setNumSubdivisions: (numSubdivisions: number) => void;
    setBpm: (bpm: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setSampleStatus: (status: SampleStatus) => void;
    updateViewportMetrics: () => void;

    setUserDropdownOpen: (open: boolean) => void;
    setDemoDropdownOpen: (open: boolean) => void;
    setSession: (user: User | null, token: string | null) => void;
    logout: () => void;

    setDoughLoops: (loops: DoughLoop[]) => void;
    upsertDoughLoop: (loop: DoughLoop) => void;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

/*
 * Grid width is derived state: it must always equal numBeats * numSubdivisions.
 * Keeping the resize inside the setters makes that invariant hold atomically.
 * It used to live in a ControlsContainer effect, which remounted on every
 * orientation change and re-ran the resize as a side effect of rotating.
 */
function resizeGrid(grid: boolean[][], numCols: number): boolean[][] {
    return grid.map((row) => {
        if (row.length === numCols) return row;
        if (row.length > numCols) return row.slice(0, numCols);
        return [...row, ...Array(numCols - row.length).fill(false)];
    });
}

export const useStore = create<StoreState>((set) => {
    const restored = loadWorkingLoop();
    const decoded = restored ?? decodeDrumGrid(DEFAULT_FUNK_LOOP.beatRep);

    return {
        user: null,
        token: null,
        doughLoops: [],
        loading: false,
        error: null,
        numBeats: decoded?.numBeats ?? 4,
        numSubdivisions: decoded?.subdivisions ?? 4,
        bpm: decoded?.bpm ?? 95,
        isPlaying: false,
        currentStep: 0,
        sampleStatus: 'idle',
        selectedLoop: restored ? null : DEFAULT_FUNK_LOOP,
        name: restored?.name ?? DEFAULT_FUNK_LOOP.name,
        grid:
            decoded?.grid ??
            Array(8)
                .fill(null)
                .map(() => Array(16).fill(false)),
        selectedSamples: decoded?.samples ?? [
            'kick1',
            'clap1',
            'snare1',
            'hat1',
            'rim1',
            'tom1',
            'cymbal1',
            'triangle1',
        ],
        volumes: decoded?.volumes ?? [1, 1, 1, 1, 1, 1, 1, 1],
        userDropdownOpen: false,
        demoDropdownOpen: false,
        setUserDropdownOpen: (val: boolean) => set({ userDropdownOpen: val }),
        setDemoDropdownOpen: (val: boolean) => set({ demoDropdownOpen: val }),

        updateViewportMetrics: () => {
            const height = window.visualViewport?.height ?? window.innerHeight;
            // Grid geometry is measured per-panel by the sequencer itself (see
            // gridMetrics.ts); the only thing left here is global type scale.
            document.documentElement.style.setProperty(
                '--base-font-size',
                `${Math.max(8, Math.pow(height * 0.8, 1 / 3)) * 1.1}px`
            );
        },

        setVolume: (index, volume) =>
            set((state) => {
                const updated = [...state.volumes];
                updated[index] = volume;
                return { volumes: updated };
            }),

        setSelectedSample: (index, sample) =>
            set((state) => {
                const updated = [...state.selectedSamples];
                updated[index] = sample;
                return { selectedSamples: updated };
            }),

        setName: (name: string) => set({ name }),
        setGrid: (grid: boolean[][]) => set({ grid }),

        setSelectedLoop: (loop: DoughLoop | null) => {
            set((_state) => {
                if (!loop) {
                    return { selectedLoop: null };
                }

                const decoded = decodeDrumGrid(loop.beatRep);
                if (!decoded) return { error: 'Invalid beatRep format', selectedLoop: null };

                const { grid, bpm, numBeats, subdivisions, samples, volumes } = decoded;

                return {
                    selectedLoop: loop,
                    grid,
                    bpm,
                    numBeats,
                    numSubdivisions: subdivisions,
                    selectedSamples: samples,
                    volumes,
                    name: loop.name,
                };
            });
        },

        setSession: (user, token) => {
            storeToken(token);
            set({ user, token });
        },
        logout: () => {
            storeToken(null);
            set({ user: null, token: null, doughLoops: [], selectedLoop: null });
        },
        setNumBeats: (numBeats: number) =>
            set((state) => ({
                numBeats,
                grid: resizeGrid(state.grid, numBeats * state.numSubdivisions),
            })),
        setNumSubdivisions: (numSubdivisions: number) =>
            set((state) => ({
                numSubdivisions,
                grid: resizeGrid(state.grid, state.numBeats * numSubdivisions),
            })),
        setBpm: (bpm: number) => set({ bpm }),
        setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
        setSampleStatus: (status: SampleStatus) => set({ sampleStatus: status }),
        setCurrentStep: (step: number) => set({ currentStep: step }),

        setDoughLoops: (loops) => set({ doughLoops: loops }),
        upsertDoughLoop: (loop: DoughLoop) =>
            set((state) => ({
                doughLoops: state.doughLoops.some((dl) => dl.id === loop.id)
                    ? state.doughLoops.map((dl) => (dl.id === loop.id ? loop : dl))
                    : [...state.doughLoops, loop],
            })),

        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
    };
});

/*
 * Mirror the working pattern into localStorage.
 *
 * Debounced, because dragging a volume slider fires this on every pointer move
 * and the encode walks the whole grid. Subscribing here rather than from a
 * component keeps it out of the render path entirely.
 */
let saveTimer: ReturnType<typeof setTimeout> | undefined;

useStore.subscribe((state, prev) => {
    if (
        state.grid === prev.grid &&
        state.bpm === prev.bpm &&
        state.numBeats === prev.numBeats &&
        state.numSubdivisions === prev.numSubdivisions &&
        state.selectedSamples === prev.selectedSamples &&
        state.volumes === prev.volumes &&
        state.name === prev.name
    ) {
        return;
    }

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        const s = useStore.getState();
        saveWorkingLoop({
            bpm: s.bpm,
            numBeats: s.numBeats,
            subdivisions: s.numSubdivisions,
            grid: s.grid,
            samples: s.selectedSamples,
            volumes: s.volumes,
            name: s.name,
        });
    }, 400);
});
