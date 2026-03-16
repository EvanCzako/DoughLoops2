import { useEffect } from 'react';
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
    const fontSize = useStore((s) => s.fontSize);
    const computedFontSize = Math.max(10, fontSize * 2);
    const computedFontSize2 = Math.max(10, fontSize * 2.5);

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
    }, [user]);

    async function deleteLoop(userId?: number, loopId?: number): Promise<void> {
        if (!userId || !loopId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/doughloops/${loopId}?userId=${userId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                const loopsRes = await fetch(`${API_BASE_URL}/doughloops?userId=${userId}`);
                const data = await loopsRes.json();
                setDoughLoops(data);
            } else {
                setError('Failed to delete loop');
            }
        } catch {
            setError('Failed to delete loop');
        } finally {
            setLoading(false);
        }
    }

    if (doughLoops.length === 0) {
        return (
            <p style={{ fontSize: computedFontSize }}>
                No DoughLoops yet. Start by adding one above!
            </p>
        );
    }

    return (
        <div>
            <h3 style={{ textDecoration: 'underline', fontSize: computedFontSize2 }}>
                Your DoughLoops
            </h3>
            <ul>
                {doughLoops.map((loop) => (
                    <div className={styles.userLoopWrapper} key={loop.id}>
                        <li
                            className={styles.userLoop}
                            style={{
                                cursor: 'pointer',
                                fontWeight: selectedLoop?.id === loop.id ? 900 : 600,
                                color:
                                    selectedLoop?.id === loop.id
                                        ? 'orange'
                                        : 'var(--ui-text-primary)',
                            }}
                            onClick={() => setSelectedLoop(loop)}
                        >
                            {loop.name}
                        </li>
                        {selectedLoop?.id === loop.id && (
                            <button
                                className={styles.deleteButton}
                                onClick={() => deleteLoop(user?.id, loop?.id)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
            </ul>
        </div>
    );
}
