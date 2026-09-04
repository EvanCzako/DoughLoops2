import { JSX, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useStore } from './store';
import DoughLoopManager from './components/DoughLoopManager';
import TitleBox from './components/TitleBox';
import DropdownWrapper from './components/DropdownWrapper';
import DemoLoopList from './components/DemoLoopList';
import ControlsContainer from './components/ControlsContainer';
import BeatSubdivControls from './components/BeatSubdivControls';
import DrumLoopPlayer from './components/DrumLoopPlayer';
import ThemeSwitcher from './components/ThemeSwitcher';
import styles from './App.module.css';

/*
 * The account feature is intentionally not wired into the app.
 *
 * Everything it needs still exists and still builds -- AuthPage, LoginForm,
 * RegisterForm, LogoutButton, UserLoopsWrapper, NewDoughLoopForm,
 * DoughLoopList, api.ts, the user/token/doughLoops slice of the store, and the
 * whole server -- but nothing here mounts it, so it is unreachable and gets
 * tree-shaken out of the bundle.
 *
 * To reconnect it:
 *   1. Add an anchor ref + button in TitleBox that toggles `userDropdownOpen`.
 *   2. Render <AuthPage /> and <UserLoopsWrapper /> inside a DropdownWrapper
 *      anchored to it, next to the demo dropdown below.
 *   3. Restore the boot-time session restore: read the stored token, call
 *      GET /me, and setSession() on success or logout() on failure.
 */

export default function App(): JSX.Element {
    const grid = useStore((s) => s.grid);
    const isPlaying = useStore((s) => s.isPlaying);
    const bpm = useStore((s) => s.bpm);
    const showDemoDropdown = useStore((s) => s.demoDropdownOpen);
    const setDemoDropdownOpen = useStore((s) => s.setDemoDropdownOpen);

    const demoDropdownAnchorRef = useRef<HTMLButtonElement>(null);
    const stepRef = useRef(0);

    useEffect(() => {
        const update = () => useStore.getState().updateViewportMetrics();

        update();
        // iOS reports stale viewport dimensions immediately after a rotation.
        const timeoutId = setTimeout(update, 100);

        let frame = 0;
        const onResize = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(update);
        };

        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);
        window.visualViewport?.addEventListener('resize', onResize);

        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
            window.visualViewport?.removeEventListener('resize', onResize);
        };
    }, []);

    // Space toggles the transport, the way every sequencer does. Skipped while
    // a form control has focus so it can't hijack typing or a checkbox.
    useEffect(() => {
        const onKeyDown = async (event: KeyboardEvent) => {
            if (event.code !== 'Space' || event.metaKey || event.ctrlKey || event.altKey) return;

            const target = event.target as HTMLElement | null;
            if (target?.closest('input, textarea, select, button, [contenteditable]')) return;

            event.preventDefault();
            const { isPlaying: playing, sampleStatus, setIsPlaying } = useStore.getState();
            if (sampleStatus !== 'ready') return;
            if (!playing) await Tone.start();
            setIsPlaying(!playing);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <div className={styles.App}>
            <DrumLoopPlayer grid={grid} isPlaying={isPlaying} bpm={bpm} stepRef={stepRef} />
            <TitleBox demoDropdownAnchorRef={demoDropdownAnchorRef} />
            <div className={styles.mainContent}>
                {showDemoDropdown && (
                    <DropdownWrapper
                        anchorRef={demoDropdownAnchorRef}
                        compact
                        onClose={() => setDemoDropdownOpen(false)}
                    >
                        <DemoLoopList />
                    </DropdownWrapper>
                )}
                <div className={styles.gridAndLoopsWrapper}>
                    <DoughLoopManager stepRef={stepRef} />
                    {/* Hidden by CSS in portrait, where DoughLoopManager shows
                        the same controls along the bottom instead. */}
                    <div className={styles.sideControlsPanel}>
                        <BeatSubdivControls />
                        <ControlsContainer stepRef={stepRef} />
                    </div>
                </div>
            </div>
            {/* TEMPORARY preview control -- see src/theme.ts */}
            <ThemeSwitcher />
        </div>
    );
}
