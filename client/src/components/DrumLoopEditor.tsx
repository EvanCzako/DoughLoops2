import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import DrumGrid from './DrumGrid';
import type { DoughLoop } from '../store';
import styles from '../styles/DoughLoopManager.module.css';
import DoughLoopManager from './DoughLoopManager';
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
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const store = useStore((s) => s);
    const setBpm = useStore((s) => s.setBpm);
    const setNumBeats = useStore((s) => s.setNumBeats);
    const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);
    const setVolume = useStore((s) => s.setVolume);
    const currentStep = useStore((s) => s.currentStep);

    const setSelectedSample = useStore((s) => s.setSelectedSample);

    // Load the selected loop into the grid
    useEffect(() => {
        if (!selectedLoop) return;

        const decoded = decodeDrumGrid(selectedLoop.beatRep);
        if (!decoded) return;

        setBpm(decoded.bpm);
        setNumBeats(decoded.numBeats);
        setNumSubdivisions(decoded.subdivisions);
        setGrid(decoded.grid);

        // Set instrument sample selections
        decoded.samples.forEach((sample, i) => setSelectedSample(i, sample));

        // Set instrument volumes
        decoded.volumes.forEach((v, i) => setVolume(i, v));

        setName(selectedLoop.name);
    }, [selectedLoop]);

    return (
        <div className={styles.drumLoopEditor}>
            <DrumGrid grid={grid} setGrid={setGrid} currentStep={currentStep} />
        </div>
    );
}