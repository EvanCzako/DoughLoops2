import React, { useEffect } from 'react';
import { useStore } from '../store';
import { DoughLoop } from '../store';
import styles from '../styles/UserLoopsWrapper.module.css';


export default function DoughLoopList() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const user = useStore((s) => s.user);
    const setLoading = useStore((s) => s.setLoading);
    const setDoughLoops = useStore((s) => s.setDoughLoops);
    const setError = useStore((s) => s.setError);
    const doughLoops = useStore((s) => s.doughLoops);
	const selectedLoop = useStore((s) => s.selectedLoop);
	const setSelectedLoop = useStore((s) => s.setSelectedLoop);

    useEffect(() => {
        const fetchLoops = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/doughloops?userId=${user.id}`);
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
						className={styles.userLoop}
                        key={loop.id}
                        style={{
                            cursor: 'pointer',
                            fontWeight: selectedLoop?.id === loop.id ? 'bold' : 'normal',
							color: selectedLoop?.id === loop.id ? 'orange' : 'white',
                        }}
                        onClick={() => {
                            setSelectedLoop({ ...loop });
                        }}
                    >
                        {loop.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
