import React, { useEffect } from 'react';
import { useStore } from '../store';
import DrumGrid from './DrumGrid';
import type { DoughLoop } from '../store';
import styles from '../styles/DoughLoopManager.module.css';
import { decodeDrumGrid } from './utils';

interface DrumLoopEditorProps {
    selectedLoop: DoughLoop | null;
    currentStep?: number;
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
    name: string;
    setName: (s: string) => void;
}

export default function DrumLoopEditor({
    selectedLoop,
    grid,
    setGrid,
    name,
    setName,
}: DrumLoopEditorProps) {
    const setBpm = useStore((s) => s.setBpm);
    const setNumBeats = useStore((s) => s.setNumBeats);
    const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);
    const setVolume = useStore((s) => s.setVolume);
    const currentStep = useStore((s) => s.currentStep);

    const setSelectedSample = useStore((s) => s.setSelectedSample);

    useEffect(() => {
        if (!selectedLoop) return;

        const decoded = decodeDrumGrid(selectedLoop.beatRep);
        if (!decoded) return;

        setBpm(decoded.bpm);
        setNumBeats(decoded.numBeats);
        setNumSubdivisions(decoded.subdivisions);
        setGrid(decoded.grid);

        decoded.samples.forEach((sample, i) => setSelectedSample(i, sample));

        decoded.volumes.forEach((v, i) => setVolume(i, v));

        setName(selectedLoop.name);
    }, [selectedLoop]);

    return (
        <div className={styles.drumLoopEditor}>
            <DrumGrid grid={grid} setGrid={setGrid} currentStep={currentStep} />
        </div>
    );
}
