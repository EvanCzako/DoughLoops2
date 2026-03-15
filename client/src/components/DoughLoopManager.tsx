import { useEffect, RefObject } from 'react';
import { useStore } from '../store';

import DrumLoopEditor from './DrumLoopEditor';
import styles from '../styles/DoughLoopManager.module.css';
import ControlsContainer from './ControlsContainer';
import BeatSubdivControls from './BeatSubdivControls';

export default function DoughLoopManager({ stepRef }: { stepRef: RefObject<number> }) {
    const user = useStore((s) => s.user);
    const selectedLoop = useStore((s) => s.selectedLoop);
    const setSelectedLoop = useStore((s) => s.setSelectedLoop);
    const grid = useStore((s) => s.grid);
    const setGrid = useStore((s) => s.setGrid);
    const name = useStore((s) => s.name);
    const setName = useStore((s) => s.setName);
    const orientation = useStore((s) => s.orientation);

    useEffect(() => {
        if (!user && selectedLoop) {
            setSelectedLoop(null);
        }
    }, [user, setSelectedLoop]);

    return (
        <div className={styles.doughLoopManager}>
            <DrumLoopEditor
                selectedLoop={selectedLoop}
                grid={grid}
                setGrid={setGrid}
                name={name}
                setName={setName}
            />
            {orientation === 'portrait' && (
                <div className={styles.bottomControlsRow}>
                    <ControlsContainer grid={grid} setGrid={setGrid} stepRef={stepRef} />
                    <BeatSubdivControls />
                </div>
            )}
        </div>
    );
}
