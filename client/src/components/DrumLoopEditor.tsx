import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import DrumGrid from './DrumGrid';
import type { DoughLoop } from '../store';

interface DrumLoopEditorProps {
    selectedLoop?: DoughLoop;
    currentStep?: number;
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
    name: string;
    setName: (s: string) => void;
	setNumBeats: (n: number) => void;
	numBeats: number;
}

export default function DrumLoopEditor({
    selectedLoop,
    grid,
    setGrid,
    name,
    setName,
    currentStep,
	setNumBeats,
	numBeats
}: DrumLoopEditorProps) {
    const user = useStore((s) => s.user);
    const addDoughLoop = useStore((s) => s.addDoughLoop);
    const replaceDoughLoop = useStore((s) => s.replaceDoughLoop);
    const setError = useStore((s) => s.setError);

    // Load the selected loop into the grid
	useEffect(() => {
		if (selectedLoop) {
			const decoded = decodeDrumGrid(selectedLoop.beatRep);
			if (decoded) {
				setNumBeats(decoded.numBeats);
				setGrid(decoded.grid);
			} else {
				console.error('Invalid loop data');
			}
		}
	}, [selectedLoop]);

	const handleSave = async () => {
		if (!user) return null;

		const beatRep = encodeDrumGrid(grid, numBeats); // use the new encoding function

		try {
			const res = await fetch('http://localhost:3000/doughloops', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: user.id, name, beatRep }),
			});

			if (!res.ok) throw new Error('Failed to save');

			const newLoop = await res.json();

			if (res.status === 201) {
				addDoughLoop(newLoop);
			} else if (res.status === 200) {
				replaceDoughLoop(newLoop);
			}

			setName('');
		} catch (err) {
			setError('Error saving loop');
		}
	};



    return (
        <div className="loop-editor">
            <h3>Create a new DoughLoop</h3>

            <DrumGrid grid={grid} setGrid={setGrid} currentStep={currentStep} />

            {user ? (
                <div>
                    <input
                        type="text"
                        placeholder="Loop name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button onClick={handleSave}>Save</button>
                </div>
            ) : null}
        </div>
    );
}

export function decodeDrumGrid(encoded: string): { grid: boolean[][]; numBeats: number } | null {
    try {
        const [beatStr, flatStr] = encoded.split('::');
        const numBeats = parseInt(beatStr, 10);
        if (isNaN(numBeats) || numBeats < 1 || numBeats > 8) return null;

        const numSteps = numBeats * 4;
        const rows = flatStr.split('|');
        if (rows.length !== 4) return null;

        const grid = rows.map((row) => {
            if (row.length !== numSteps) throw new Error('Bad length');
            return row.split('').map((c) => c === '1');
        });

        return { grid, numBeats };
    } catch {
        return null;
    }
}


export function encodeDrumGrid(grid: boolean[][], numBeats: number): string {
    const flat = grid
        .map((row) => row.map((b) => (b ? '1' : '0')).join(''))
        .join('|');
    return `${numBeats}::${flat}`;
}
