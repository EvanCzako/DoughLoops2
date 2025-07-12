import React from 'react';
import { useStore } from '../store';
import { DoughLoop } from '../store';
import styles from '../styles/NewDoughLoopForm.module.css';
import { encodeDrumGrid } from './utils';

interface Props {
    onSelectLoop: (loop: DoughLoop) => void;
    selectedLoop: DoughLoop | null;
}

export default function NewDoughLoopForm() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const user = useStore((s) => s.user);
    const bpm = useStore((s) => s.bpm);
    const numBeats = useStore((s) => s.numBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
	const grid = useStore((s) => s.grid);
	const setGrid = useStore((s) => s.setGrid);
	const name = useStore((s) => s.name);
	const setName = useStore((s) => s.setName);

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
            grid: grid,
            samples: selectedSamples,
            volumes,
        });

        try {
            const res = await fetch(`${API_BASE_URL}/doughloops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, name: name, beatRep }),
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
        <div>
            <h3>New Loop</h3>
            <div>
                <input
                    type="text"
                    placeholder="Loop name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
					className={styles.loopNameEntry}
                />
                <button onClick={handleSave} className={styles.saveButton}>Save</button>
            </div>
        </div>
    );
}