import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import DrumGrid from './DrumGrid';
import type { DoughLoop } from '../store';
import styles from '../styles/DoughLoopManager.module.css';
import DoughLoopManager from './DoughLoopManager';

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
    setName
}: DrumLoopEditorProps) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const store = useStore((s) => s);
    const setBpm = useStore((s) => s.setBpm);
    const setNumBeats = useStore((s) => s.setNumBeats);
    const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);
    const currentStep = useStore((s) => s.currentStep);

    // Load the selected loop into the grid
    useEffect(() => {
        if (!selectedLoop) return;

        const decoded = decodeDrumGrid(selectedLoop.beatRep);
        if (!decoded) return;

        setGrid(decoded.grid);
        setNumBeats(decoded.numBeats);
        setNumSubdivisions(decoded.subdivisions);
        setBpm(decoded.bpm);
        setName(selectedLoop.name);

    }, [selectedLoop]);



    return (
        <div className={styles.drumLoopEditor}>
            <DrumGrid grid={grid} setGrid={setGrid} currentStep={currentStep} />
        </div>
    );
}

function decodeDrumGrid(encoded: string): {
    bpm: number;
    numBeats: number;
    subdivisions: number;
    grid: boolean[][];
} | null {
    try {
        const [meta, ...rows] = encoded.split('::');
        const [bpmStr, beatsStr, subsStr] = meta.split(',');

        const bpm = parseInt(bpmStr, 10);
        const numBeats = parseInt(beatsStr, 10);
        const subdivisions = parseInt(subsStr, 10);
        const cols = numBeats * subdivisions;

        if (!bpm || !numBeats || !subdivisions || rows.some((r) => r.length !== cols)) return null;

        const grid = rows.map((row) => [...row].map((char) => char === '1'));

        return { bpm, numBeats, subdivisions, grid };
    } catch {
        return null;
    }
}
