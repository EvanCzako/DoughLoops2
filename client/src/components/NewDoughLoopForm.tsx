import React, { useEffect } from 'react';
import { useStore } from '../store';
import { DoughLoop } from '../store';

interface Props {
	onSelectLoop: (loop: DoughLoop) => void;
	selectedLoop: DoughLoop | null;
}

export default function NewDoughLoopForm(opts: {
	grid: any,
	setGrid: any,
	name: any,
	setName: any,
}) {

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
	const user = useStore((s) => s.user);
	const bpm = useStore((s) => s.bpm);

	const numBeats = useStore((s) => s.numBeats);
	const numSubdivisions = useStore((s) => s.numSubdivisions);


	const addDoughLoop = useStore((s) => s.addDoughLoop);
	const replaceDoughLoop = useStore((s) => s.replaceDoughLoop);
	const setError = useStore((s) => s.setError);



    const handleSave = async () => {
        if (!user) return null;

        const beatRep = encodeDrumGrid(opts.grid, bpm, numBeats, numSubdivisions); // use the new encoding function

        try {
            const res = await fetch(`${API_BASE_URL}/doughloops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, name: opts.name, beatRep }),
            });

            if (!res.ok) throw new Error('Failed to save');

            const newLoop = await res.json();

            if (res.status === 201) {
                addDoughLoop(newLoop);
            } else if (res.status === 200) {
                replaceDoughLoop(newLoop);
            }

            opts.setName('');
        } catch (err) {
            setError('Error saving loop');
        }
    };



	return (
		<div>
			<h3>New Loop</h3>
			<div>
				<input
					type="text"
					placeholder="Loop name"
					value={opts.name}
					onChange={(e) => opts.setName(e.target.value)}
				/>
				<button onClick={handleSave}>Save</button>
			</div>
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

function encodeDrumGrid(
    grid: boolean[][],
    bpm: number,
    numBeats: number,
    subdivisions: number
): string {
    const rows = grid.map((row) => row.map((cell) => (cell ? '1' : '0')).join(''));
    return `${bpm},${numBeats},${subdivisions}::${rows.join('::')}`;
}
