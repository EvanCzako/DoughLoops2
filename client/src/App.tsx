import { JSX, useEffect, useRef } from 'react';
import { useStore } from './store';
import DoughLoopManager from './components/DoughLoopManager';
import TitleBox from './components/TitleBox';
import AuthPage from './components/AuthPage';
import DropdownWrapper from './components/DropdownWrapper';
import UserLoopsWrapper from './components/UserLoopsWrapper';
import styles from './App.module.css';
import Footer from './components/Footer';
import ControlsContainer from './components/ControlsContainer';
import BeatSubdivControls from './components/BeatSubdivControls';
import DrumLoopPlayer from './components/DrumLoopPlayer';

export default function App(): JSX.Element {
    const grid = useStore((s) => s.grid);
    const setGrid = useStore((s) => s.setGrid);
    const isPlaying = useStore((s) => s.isPlaying);
    const bpm = useStore((s) => s.bpm);
    const showDropdown = useStore((s) => s.userDropdownOpen);
    const showDemoDropdown = useStore((s) => s.demoDropdownOpen);
    const orientation = useStore((s) => s.orientation);

    const setDemoDropdownOpen = useStore((s) => s.setDemoDropdownOpen);

    const dropdownAnchorRef = useRef<HTMLButtonElement>(null);
    const demoDropdownAnchorRef = useRef<HTMLButtonElement>(null);
    const stepRef = useRef(0);

    useEffect(() => {
        const update = () => useStore.getState().updateFontSize();

        update();
        const timeoutId = setTimeout(update, 100);

        window.addEventListener('resize', update);
        window.addEventListener('orientationchange', update);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', update);
            window.removeEventListener('orientationchange', update);
        };
    }, []);

    return (
        <div className={styles.App}>
            <DrumLoopPlayer grid={grid} isPlaying={isPlaying} bpm={bpm} stepRef={stepRef} />
            <TitleBox demoDropdownAnchorRef={demoDropdownAnchorRef} />
            <div className={styles.mainContent}>
                {showDropdown && (
                    <DropdownWrapper anchorRef={dropdownAnchorRef}>
                        <AuthPage />
                    </DropdownWrapper>
                )}
                {showDemoDropdown && (
                    <DropdownWrapper
                        anchorRef={demoDropdownAnchorRef}
                        compact={true}
                        onClose={() => setDemoDropdownOpen(false)}
                    >
                        <UserLoopsWrapper isDemoLoops={true} />
                    </DropdownWrapper>
                )}
                <div className={styles.gridAndLoopsWrapper}>
                    <DoughLoopManager stepRef={stepRef} />
                    {orientation === 'landscape' && (
                        <div className={styles.sideControlsPanel}>
                            <BeatSubdivControls />
                            <ControlsContainer grid={grid} setGrid={setGrid} stepRef={stepRef} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
