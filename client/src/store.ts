// client/src/store.ts
import { create } from 'zustand';
import { decodeDrumGrid } from './components/utils'; // adjust path as needed

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
    volumes: number[]; // from 0 (mute) to 1 (full volume)
    fontSize: number;
	userDropdownOpen: boolean,

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
    updateFontSize: () => void;

    // Auth actions
	setUserDropdownOpen: (open: boolean) => void;
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
    bpm: 85,
    isPlaying: false,
    currentStep: 0,
    selectedLoop: null,
    name: '',
    grid: Array(8)
        .fill(null)
        .map(() => Array(16).fill(false)),
    selectedSamples: ['kick1', 'clap1', 'snare1', 'hat1', 'rim1', 'tom1', 'cymbal1', 'triangle1'],

    volumes: [1, 1, 1, 1, 1, 1, 1, 1],
    fontSize: 0,
	userDropdownOpen: false,
	setUserDropdownOpen: (val: boolean) => set({ userDropdownOpen: val }),

    updateFontSize: () => {
        const vw = (window.visualViewport?.width ?? window.innerWidth) / 100;
        const vh = (window.visualViewport?.height ?? window.innerHeight) / 100;

        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--vw', `${vw}px`);

        const product = Math.sqrt(vh ** 2 * Math.min(3, vw / vh));
        const fontSize = product;
        set({ fontSize });

        // Clamp width from 60 to 100px
        const controlsColumnClampedWidth = Math.min(120, Math.max(75, product * 9));
        document.documentElement.style.setProperty('--controls-column-width', `${controlsColumnClampedWidth}px`);


		// Clamp drumGridRowHeight from 25 to 80px
        const drumGridRowHeight = Math.max(Math.min(product*4,100),40);
        document.documentElement.style.setProperty('--drum-grid-row-height', `${drumGridRowHeight}px`);

        const controlsContainerWidth = Math.max(Math.min(product*30,500),250);
        document.documentElement.style.setProperty('--controls-container-width', `${controlsContainerWidth}px`);
		const controlsContainerHeight = Math.max(Math.min(product*20,200),140);

        document.documentElement.style.setProperty('--controls-container-height', `${controlsContainerHeight}px`);

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
		set((state) => {
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
