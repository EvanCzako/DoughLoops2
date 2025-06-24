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
	selectedLoopId: number | null;
	editingLoopId: number | null; 

	setNumBeats: (numBeats: number) => void;
	setNumSubdivisions: (numSubdivisions: number) => void;
	setBpm: (bpm: number) => void;
	setSelectedLoopId: (id: number | null) => void;
	setEditingLoopId: (id: number | null) => void;

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
	selectedLoopId: null,
	editingLoopId: null,

    setUser: (user) => set({ user }),
    logout: () => set({ user: null, doughLoops: [] }),
	setNumBeats: (numBeats: number) => set({ numBeats, editingLoopId: null }),
	setNumSubdivisions: (numSubdivisions: number) => set({ numSubdivisions, editingLoopId: null }),
	setBpm: (bpm: number) => set({ bpm, editingLoopId: null }),
	setSelectedLoopId: (id: number | null) => set({selectedLoopId: id}),
	setEditingLoopId: (id: number | null) => set({editingLoopId: id}),

    setDoughLoops: (loops) => set({ doughLoops: loops }),
    addDoughLoop: (loop) => set((state) => ({ doughLoops: [...state.doughLoops, loop] })),
    replaceDoughLoop: (loop: DoughLoop) =>
        set((state) => ({
            doughLoops: state.doughLoops.map((dl) => (dl.id === loop.id ? loop : dl)),
        })),

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
