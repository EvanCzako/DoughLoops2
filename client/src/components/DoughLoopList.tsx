import React, { useEffect } from 'react';
import { useStore } from '../store';

export default function DoughLoopList() {
    const user = useStore((s) => s.user);
    const doughLoops = useStore((s) => s.doughLoops);
    const setDoughLoops = useStore((s) => s.setDoughLoops);
    const setError = useStore((s) => s.setError);
    const setLoading = useStore((s) => s.setLoading);

    useEffect(() => {
        const fetchLoops = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/doughloops?userId=${user.id}`);
                const data = await res.json();
                setDoughLoops(data);
            } catch {
                setError('Failed to load DoughLoops');
            } finally {
                setLoading(false);
            }
        };

        fetchLoops();
    }, [user, setDoughLoops, setLoading, setError]);

    if (doughLoops.length === 0) {
        return <p>No DoughLoops yet. Start by adding one above!</p>;
    }

    return (
        <div>
            <h3>Your DoughLoops</h3>
            <ul>
                {doughLoops.map((loop) => (
                    <li key={loop.id}>
                        <strong>{loop.name}</strong>: {loop.beatRep}
                    </li>
                ))}
            </ul>
        </div>
    );
}
