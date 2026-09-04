import { FormEvent, useState } from 'react';
import { useStore, DoughLoop } from '../store';
import { apiFetch, ApiError } from '../api';
import { encodeDrumGrid } from '../utils';
import styles from '../styles/NewDoughLoopForm.module.css';

export default function NewDoughLoopForm() {
    const user = useStore((s) => s.user);
    const bpm = useStore((s) => s.bpm);
    const numBeats = useStore((s) => s.numBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const grid = useStore((s) => s.grid);
    const name = useStore((s) => s.name);
    const setName = useStore((s) => s.setName);
    const selectedSamples = useStore((s) => s.selectedSamples);
    const volumes = useStore((s) => s.volumes);
    const upsertDoughLoop = useStore((s) => s.upsertDoughLoop);
    const logout = useStore((s) => s.logout);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) return;

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const saved = await apiFetch<DoughLoop>('/doughloops', {
                method: 'POST',
                body: {
                    name: name.trim(),
                    beatRep: encodeDrumGrid({
                        bpm,
                        numBeats,
                        subdivisions: numSubdivisions,
                        grid,
                        samples: selectedSamples,
                        volumes,
                    }),
                },
            });

            upsertDoughLoop(saved);
            setMessage(`Saved “${saved.name}”`);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) logout();
            else setError(err instanceof ApiError ? err.message : 'Error saving loop');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave}>
            <h3 className={styles.formHeading}>Save Loop</h3>
            <input
                type="text"
                placeholder="Loop name"
                aria-label="Loop name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.loopNameEntry}
                maxLength={64}
            />
            <button type="submit" className={styles.saveButton} disabled={saving || !name.trim()}>
                {saving ? 'Saving…' : 'Save'}
            </button>
            {message && (
                <p className={styles.saveStatus} role="status">
                    {message}
                </p>
            )}
            {error && (
                <p className={styles.saveError} role="alert">
                    {error}
                </p>
            )}
        </form>
    );
}
