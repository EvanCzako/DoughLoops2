import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import DrumGrid from './DrumGrid';
import type { DoughLoop } from '../store';

interface DrumLoopEditorProps {
  selectedLoop?: DoughLoop;
  currentStep: number | null;
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
  currentStep
}: DrumLoopEditorProps) {

    const user = useStore((s) => s.user);
    const addDoughLoop = useStore((s) => s.addDoughLoop);
    const replaceDoughLoop = useStore((s) => s.replaceDoughLoop);
    const setError = useStore((s) => s.setError);

    // Load the selected loop into the grid
    useEffect(() => {
        if (selectedLoop) {
            const decoded = decodeBeatRep(selectedLoop.beatRep);
            if (decoded) {
                setGrid(decoded);
                setName(selectedLoop.name);
            } else {
                setError('Invalid beatRep string');
            }
        }
    }, [selectedLoop]);

    const handleSave = async () => {
        if (!user) return null;

        const beatRep = grid.map((row) => row.map((b) => (b ? '1' : '0')).join('')).join('|');

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

			<DrumGrid
				grid={grid}
				setGrid={setGrid}
				currentStep={currentStep}
			/>

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

export function decodeBeatRep(beatRep: string): boolean[][] | null {
    const rows = beatRep.split('|');

    // Validation: ensure each row is the same length and only 1s and 0s
    const isValid = rows.every((row) => /^[01]+$/.test(row) && row.length === rows[0].length);

    if (!isValid) return null;

    return rows.map((row) => row.split('').map((c) => c === '1'));
}
