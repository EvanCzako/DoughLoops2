import { RefObject } from 'react';
import { useStore } from '../store';
import styles from '../styles/TitleBox.module.css';
import DoughLoopsLogo from '../assets/DoughLoops2-downSaturated.png';

export default function TitleBox({
    demoDropdownAnchorRef,
}: {
    demoDropdownAnchorRef: RefObject<HTMLButtonElement | null>;
}) {
    const demoDropdownOpen = useStore((s) => s.demoDropdownOpen);
    const setDemoDropdownOpen = useStore((s) => s.setDemoDropdownOpen);

    const demoDropdownClickedHandler = () => {
        setDemoDropdownOpen(!demoDropdownOpen);
    };

    return (
        <div className={styles.titleBox}>
            <img className={styles.logoImage} src={DoughLoopsLogo} alt="DoughLoops" />
            <a
                href="https://evanczako.github.io/DoughLab2/"
                rel="noopener noreferrer"
                className={styles.backLink}
            >
                Back to Dough's Lab
            </a>
            <div className={styles.spacer} />
            <button
                ref={demoDropdownAnchorRef}
                className={styles.demoButton}
                onClick={demoDropdownClickedHandler}
            >
                Demos {demoDropdownOpen ? '▼' : '▶'}
            </button>
        </div>
    );
}
