// client/src/store.ts
import { create } from 'zustand';

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

interface StoreState {
    user: User | null;
    doughLoops: DoughLoop[];
    loading: boolean;
    error: string | null;
    numBeats: number;
    numSubdivisions: number;
    bpm: number;
    isPlaying: boolean;
    currentStep: number;
    selectedLoop: DoughLoop | null;
    name: string;
    grid: boolean[][];
    selectedSamples: string[];

    setSelectedSample: (index: number, sample: string) => void;
    setName: (name: string) => void;
    setGrid: (grid: boolean[][]) => void;
    setSelectedLoop: (loop: DoughLoop | null) => void;
    setCurrentStep: (step: number) => void;
    setNumBeats: (numBeats: number) => void;
    setNumSubdivisions: (numSubdivisions: number) => void;
    setBpm: (bpm: number) => void;
    setIsPlaying: (playing: boolean) => void;

    // Auth actions
    setUser: (user: User | null) => void;
    logout: () => void;

    // DoughLoop actions
    setDoughLoops: (loops: DoughLoop[]) => void;
    addDoughLoop: (loop: DoughLoop) => void;
    replaceDoughLoop: (loop: DoughLoop) => void;

    // UI actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useStore = create<StoreState>((set) => ({
    user: null,
    doughLoops: [],
    loading: false,
    error: null,
    numBeats: 4,
    numSubdivisions: 4,
    bpm: 120,
    isPlaying: false,
    currentStep: 0,
    selectedLoop: null,
    name: '',
    grid: Array(4)
        .fill(null)
        .map(() => Array(16).fill(false)),
    selectedSamples: ['kick1', 'snare1', 'hat1', 'clap1'],

    setSelectedSample: (index, sample) =>
        set((state) => {
            const updated = [...state.selectedSamples];
            updated[index] = sample;
            return { selectedSamples: updated };
        }),

    setName: (name: string) => set({ name }),
    setGrid: (grid: boolean[][]) => set({ grid }),

    setSelectedLoop: (loop: DoughLoop | null) => {
        set({ selectedLoop: loop });
    },

    setUser: (user) => set({ user }),
    logout: () => set({ user: null, doughLoops: [], selectedLoop: null }),
    setNumBeats: (numBeats: number) => set({ numBeats }),
    setNumSubdivisions: (numSubdivisions: number) => set({ numSubdivisions }),
    setBpm: (bpm: number) => set({ bpm }),
    setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
    setCurrentStep: (step: number) => set({ currentStep: step }),

    setDoughLoops: (loops) => set({ doughLoops: loops }),
    addDoughLoop: (loop) => set((state) => ({ doughLoops: [...state.doughLoops, loop] })),
    replaceDoughLoop: (loop: DoughLoop) =>
        set((state) => ({
            doughLoops: state.doughLoops.map((dl) => (dl.id === loop.id ? loop : dl)),
        })),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
