import React, { useState } from 'react';
import { useStore } from '../store';

export default function NewDoughLoopForm() {
    const user = useStore((s) => s.user);
    const addDoughLoop = useStore((s) => s.addDoughLoop);
    const [name, setName] = useState('');
    const [beatRep, setBeatRep] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !beatRep.trim()) {
            setError('Both fields are required.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:3000/doughloops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user!.id, name, beatRep }),
            });

            if (!res.ok) throw new Error('Failed to create DoughLoop');

            const newLoop = await res.json();
            addDoughLoop(newLoop);
            setName('');
            setBeatRep('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Create a new DoughLoop</h3>
            <input
                type="text"
                placeholder="Loop name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />
            <input
                type="text"
                placeholder="Beat representation"
                value={beatRep}
                onChange={(e) => setBeatRep(e.target.value)}
                style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />
            <button type="submit" disabled={loading} style={{ padding: 8, width: '100%' }}>
                {loading ? 'Creating...' : 'Add DoughLoop'}
            </button>
            {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
        </form>
    );
}
