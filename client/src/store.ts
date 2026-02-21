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

// Default Funk loop
const DEFAULT_FUNK_LOOP: DoughLoop = {
    id: -7,
    userId: -1,
    name: 'Funk',
    beatRep:
        '95,4,4::kick1:1|clap1:1|snare2:1|hat1:0.48|rim3:1|tom3:0.54|cymbal1:1|triangle1:1::1000100110011000::0000100000000000::0000000000001000::1000000110001001::0000001001000000::0000000000000010::0000000000000000::0000000000000000',
};

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
	userDropdownOpen: boolean;
	demoDropdownOpen: boolean;
    orientation: 'portrait' | 'landscape';
    instrumentVariants: number[];

    setVolume: (index: number, volume: number) => void;
    setSelectedSample: (index: number, sample: string) => void;
    setInstrumentVariant: (index: number, variant: number) => void;
    setName: (name: string) => void;
    setGrid: (grid: boolean[][]) => void;
    setSelectedLoop: (loop: DoughLoop | null) => void;
    setCurrentStep: (step: number) => void;
    setNumBeats: (numBeats: number) => void;
    setNumSubdivisions: (numSubdivisions: number) => void;
    setBpm: (bpm: number) => void;
    setIsPlaying: (playing: boolean) => void;
    updateFontSize: () => void;
    setOrientation: (orientation: 'portrait' | 'landscape') => void;

    // Auth actions
	setUserDropdownOpen: (open: boolean) => void;
	setDemoDropdownOpen: (open: boolean) => void;
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

export const useStore = create<StoreState>((set) => {
    // Decode the default Funk loop
    const decoded = decodeDrumGrid(DEFAULT_FUNK_LOOP.beatRep);

    return {
        user: null,
        doughLoops: [],
        loading: false,
        error: null,
        numBeats: decoded?.numBeats ?? 4,
        numSubdivisions: decoded?.subdivisions ?? 4,
        bpm: decoded?.bpm ?? 95,
        isPlaying: false,
        currentStep: 0,
        selectedLoop: DEFAULT_FUNK_LOOP,
        name: DEFAULT_FUNK_LOOP.name,
        grid: decoded?.grid ?? Array(8)
            .fill(null)
            .map(() => Array(16).fill(false)),
        selectedSamples: decoded?.samples ?? ['kick1', 'clap1', 'snare1', 'hat1', 'rim1', 'tom1', 'cymbal1', 'triangle1'],
        volumes: decoded?.volumes ?? [1, 1, 1, 1, 1, 1, 1, 1],
        fontSize: 0,
        userDropdownOpen: false,
        demoDropdownOpen: false,
        orientation: 'landscape',
        instrumentVariants: [1, 1, 1, 1, 1, 1, 1, 1],
	setUserDropdownOpen: (val: boolean) => set({ userDropdownOpen: val }),
	setDemoDropdownOpen: (val: boolean) => set({ demoDropdownOpen: val }),
    setOrientation: (orientation: 'portrait' | 'landscape') => set({ orientation }),

    updateFontSize: () => {
        const width = window.visualViewport?.width ?? window.innerWidth;
        const height = window.visualViewport?.height ?? window.innerHeight;

        // Detect orientation: portrait if height > width
        const newOrientation = height > width ? 'portrait' : 'landscape';
        set({ orientation: newOrientation });
        document.documentElement.setAttribute('data-orientation', newOrientation);

        // Set viewport unit root values
        document.documentElement.style.setProperty('--vw-unit', `${width / 100}px`);
        document.documentElement.style.setProperty('--vh-unit', `${height / 100}px`);
        
        // Calculate base font size from viewport height (preserve original formula)
        const product = Math.max(8, Math.pow(height * 0.8, 1 / 3));
        const fontSize = product * 1.1;
        set({ fontSize });
        document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);

        // Grid scaling: use width-aware calculation in portrait
        if (newOrientation === 'portrait') {
            // Portrait: fit 8 columns across with 6px gaps
            // Available width = viewport - padding - gaps
            const gridPadding = 16 * 2; // padding on drum grid
            const totalGaps = 6 * 7; // 7 gaps between 8 columns
            const cellSize = Math.max(40, (width - gridPadding - totalGaps) / 8);
            document.documentElement.style.setProperty('--grid-cell-size', `${cellSize}px`);
        } else {
            // Landscape: base on height (original formula: sqrt(height * 3) * 0.9)
            const cellSize = Math.sqrt(height * 3) * 0.9;
            document.documentElement.style.setProperty('--grid-cell-size', `${cellSize}px`);
        }

        // Logo sizing
        const logoWidth = Math.min(300, width * 0.5);
        document.documentElement.style.setProperty('--logo-width', `${logoWidth}px`);
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

    setInstrumentVariant: (index, variant) =>
        set((state) => {
            const updated = [...state.instrumentVariants];
            updated[index] = variant;
            return { instrumentVariants: updated };
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
    };
});
