import { RefObject } from 'react';
import { useStore } from '../store';
import DrumGrid from './DrumGrid';
import ControlsContainer from './ControlsContainer';
import BeatSubdivControls from './BeatSubdivControls';
import styles from '../styles/DoughLoopManager.module.css';

export default function DoughLoopManager({ stepRef }: { stepRef: RefObject<number> }) {
    const grid = useStore((s) => s.grid);
    const setGrid = useStore((s) => s.setGrid);

    return (
        <div className={styles.doughLoopManager}>
            <div className={styles.drumLoopEditor}>
                <DrumGrid grid={grid} setGrid={setGrid} />
            </div>
            {/* Hidden by CSS in landscape, where App shows the same controls in
                the side panel instead. */}
            <div className={styles.bottomControlsRow}>
                <ControlsContainer stepRef={stepRef} />
                <BeatSubdivControls />
            </div>
        </div>
    );
}
