import React, { useEffect } from 'react';
import { useStore } from '../store';
import { DoughLoop } from '../store';

interface Props {
    onSelectLoop: (loop: DoughLoop) => void;
    selectedLoop?: DoughLoop;
}

export default function DoughLoopList({ onSelectLoop, selectedLoop }: Props) {

	const editingLoopId = useStore((s) => s.editingLoopId);
	const user = useStore((s) => s.user);
	const setLoading = useStore((s) => s.setLoading);
	const setDoughLoops = useStore((s) => s.setDoughLoops);
	const setError = useStore((s) => s.setError);
	const doughLoops = useStore((s) => s.doughLoops);

	const handleSelectLoop = (loop: DoughLoop) => {
		// If the user is editing this loop, and it's now dirty, reset it
		if (editingLoopId !== loop.id) {
			onSelectLoop({...loop}); // trigger the loading logic again
		}
	};

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
                    <li
                        key={loop.id}
                        style={{
                            cursor: 'pointer',
                            fontWeight: selectedLoop?.id === loop.id ? 'bold' : 'normal',
                        }}
                        onClick={() => onSelectLoop({...loop})}
                    >
                        {loop.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
