import React from 'react';
import { useStore } from '../store';
import { DoughLoop } from '../store';

interface Props {
    onSelectLoop: (loop: DoughLoop) => void;
    selectedLoop: DoughLoop | null;
}

export default function NewDoughLoopForm(opts: {
    grid: boolean[][];
    setGrid: (grid: boolean[][]) => void;
    name: string;
    setName: (name: string) => void;
}) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const user = useStore((s) => s.user);
    const bpm = useStore((s) => s.bpm);
    const numBeats = useStore((s) => s.numBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);

    const selectedSamples = useStore((s) => s.selectedSamples);
    const volumes = useStore((s) => s.volumes);

    const addDoughLoop = useStore((s) => s.addDoughLoop);
    const replaceDoughLoop = useStore((s) => s.replaceDoughLoop);
    const setError = useStore((s) => s.setError);

    const handleSave = async () => {
        if (!user) return null;

        const beatRep = encodeDrumGrid({
            bpm,
            numBeats,
            subdivisions: numSubdivisions,
            grid: opts.grid,
            samples: selectedSamples,
            volumes,
        });

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

function encodeDrumGrid({
    bpm,
    numBeats,
    subdivisions,
    grid,
    samples,
    volumes,
}: {
    bpm: number;
    numBeats: number;
    subdivisions: number;
    grid: boolean[][];
    samples: string[];
    volumes: number[];
}): string {
    const meta = `${bpm},${numBeats},${subdivisions}`;
    const config = samples.map((s, i) => `${s}:${volumes[i]}`).join('|');
    const gridRows = grid.map((row) => row.map((cell) => (cell ? '1' : '0')).join(''));
    return `${meta}::${config}::${gridRows.join('::')}`;
}
