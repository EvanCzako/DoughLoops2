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
}

export default function DrumLoopEditor({
    selectedLoop,
    grid,
    setGrid,
    name,
    setName,
    currentStep,
}: DrumLoopEditorProps) {

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


	const store = useStore((s) => s);
	const setBpm = useStore((s) => s.setBpm);
	const setNumBeats = useStore((s) => s.setNumBeats);
	const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);
	const setEditingLoopId = useStore((s) => s.setEditingLoopId);
	const addDoughLoop = useStore((s) => s.addDoughLoop);
	const replaceDoughLoop = useStore((s) => s.replaceDoughLoop);
	const setError = useStore((s) => s.setError);
	const user = useStore((s) => s.user);
	const bpm = useStore((s) => s.bpm);
	const numBeats = useStore((s) => s.numBeats);
	const numSubdivisions = useStore((s) => s.numSubdivisions);
	

	


    // Load the selected loop into the grid
	useEffect(() => {
		if (!selectedLoop) return;

		const decoded = decodeDrumGrid(selectedLoop.beatRep);
		if (!decoded) return;

		setGrid(decoded.grid);
		setBpm(decoded.bpm);
		setNumBeats(decoded.numBeats);
		setNumSubdivisions(decoded.subdivisions);
		setName(selectedLoop.name);

		setEditingLoopId(selectedLoop.id); // 👈 track which loop is being edited
	}, [selectedLoop]);


	const handleSave = async () => {
		if (!user) return null;

		const beatRep = encodeDrumGrid(grid, bpm, numBeats, numSubdivisions); // use the new encoding function

		try {
			const res = await fetch(`${API_BASE_URL}/doughloops`, {
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

// export function decodeDrumGrid(encoded: string): { grid: boolean[][]; numBeats: number } | null {
//     try {
//         const [beatStr, flatStr] = encoded.split('::');
//         const numBeats = parseInt(beatStr, 10);
//         if (isNaN(numBeats) || numBeats < 1 || numBeats > 8) return null;

//         const numSteps = numBeats * 4;
//         const rows = flatStr.split('|');
//         if (rows.length !== 4) return null;

//         const grid = rows.map((row) => {
//             if (row.length !== numSteps) throw new Error('Bad length');
//             return row.split('').map((c) => c === '1');
//         });

//         return { grid, numBeats };
//     } catch {
//         return null;
//     }
// }


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



// export function encodeDrumGrid(grid: boolean[][], numBeats: number): string {
//     const flat = grid
//         .map((row) => row.map((b) => (b ? '1' : '0')).join(''))
//         .join('|');
//     return `${numBeats}::${flat}`;
// }

function encodeDrumGrid(
  grid: boolean[][],
  bpm: number,
  numBeats: number,
  subdivisions: number
): string {
  const rows = grid.map((row) => row.map((cell) => (cell ? '1' : '0')).join(''));
  return `${bpm},${numBeats},${subdivisions}::${rows.join('::')}`;
}
