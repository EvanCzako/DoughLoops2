import { useEffect } from 'react';
import { useStore, DoughLoop } from '../store';
import { apiFetch, ApiError } from '../api';
import styles from '../styles/UserLoopsWrapper.module.css';

export default function DoughLoopList() {
    const user = useStore((s) => s.user);
    const doughLoops = useStore((s) => s.doughLoops);
    const selectedLoop = useStore((s) => s.selectedLoop);
    const setSelectedLoop = useStore((s) => s.setSelectedLoop);
    const setDoughLoops = useStore((s) => s.setDoughLoops);
    const setLoading = useStore((s) => s.setLoading);
    const setError = useStore((s) => s.setError);
    const logout = useStore((s) => s.logout);
    const error = useStore((s) => s.error);

    useEffect(() => {
        if (!user) return;

        const controller = new AbortController();

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await apiFetch<DoughLoop[]>('/doughloops', {
                    signal: controller.signal,
                });
                setDoughLoops(data);
            } catch (err) {
                if (controller.signal.aborted) return;
                if (err instanceof ApiError && err.status === 401) logout();
                else setError('Failed to load DoughLoops');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [user, setDoughLoops, setLoading, setError, logout]);

    async function deleteLoop(loopId: number) {
        setLoading(true);
        setError(null);
        try {
            await apiFetch(`/doughloops/${loopId}`, { method: 'DELETE' });
            setDoughLoops(doughLoops.filter((l) => l.id !== loopId));
            if (selectedLoop?.id === loopId) setSelectedLoop(null);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) logout();
            else setError('Failed to delete loop');
        } finally {
            setLoading(false);
        }
    }

    if (error) {
        return (
            <p className={styles.emptyNote} role="alert">
                {error}
            </p>
        );
    }

    if (doughLoops.length === 0) {
        return <p className={styles.emptyNote}>No DoughLoops yet. Start by adding one above!</p>;
    }

    return (
        <div>
            <h3 className={styles.listHeading}>Your DoughLoops</h3>
            <ul className={styles.loopList}>
                {doughLoops.map((loop) => {
                    const isSelected = selectedLoop?.id === loop.id;
                    return (
                        <li className={styles.userLoopWrapper} key={loop.id}>
                            <button
                                type="button"
                                className={styles.userLoop}
                                aria-current={isSelected}
                                onClick={() => setSelectedLoop(loop)}
                            >
                                {loop.name}
                            </button>
                            {isSelected && (
                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    onClick={() => deleteLoop(loop.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
