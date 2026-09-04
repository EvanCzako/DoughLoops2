import { RefObject } from 'react';
import { useStore } from '../store';
import ThemeSwitcher from './ThemeSwitcher';
import styles from '../styles/TitleBox.module.css';
import DoughLoopsLogo from '../assets/DoughLoops2-downSaturated.png';

interface TitleBoxProps {
    demoDropdownAnchorRef: RefObject<HTMLButtonElement | null>;
}

export default function TitleBox({ demoDropdownAnchorRef }: TitleBoxProps) {
    const demoDropdownOpen = useStore((s) => s.demoDropdownOpen);
    const setDemoDropdownOpen = useStore((s) => s.setDemoDropdownOpen);

    return (
        <header className={styles.titleBox}>
            <img className={styles.logoImage} src={DoughLoopsLogo} alt="DoughLoops" />
            <a href="https://evanczako.com" rel="noopener noreferrer" className={styles.backLink}>
                <span className={styles.backLinkLandscape}>Back to Bakery</span>
                <span className={styles.backLinkPortrait}>Dough&rsquo;s Lab</span>
            </a>
            <div className={styles.spacer} />
            {/* An Account button belongs here when the account feature is
                reconnected -- see the note at the top of App.tsx. */}
            <button
                ref={demoDropdownAnchorRef}
                className={styles.titleBoxButton}
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                aria-expanded={demoDropdownOpen}
                aria-haspopup="menu"
            >
                Demos
                <span aria-hidden="true">{demoDropdownOpen ? '▼' : '▶'}</span>
            </button>
            {/* TEMPORARY preview control -- see src/theme.ts */}
            <ThemeSwitcher />
        </header>
    );
}
