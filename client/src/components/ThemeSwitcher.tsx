import { useEffect, useRef, useState } from 'react';
import {
    THEMES,
    SHAPES,
    ThemeId,
    ShapeId,
    applyTheme,
    applyShape,
    readStoredTheme,
    readStoredShape,
    nextIn,
} from '../theme';
import styles from '../styles/ThemeSwitcher.module.css';

/*
 * TEMPORARY -- see the header of `src/theme.ts` for how to remove this once a
 * look is settled on.
 *
 * A picker rather than a cycle button: at fourteen themes, clicking through to
 * compare two of them is worse than just showing them all.
 */
export default function ThemeSwitcher() {
    const [theme, setTheme] = useState<ThemeId>(readStoredTheme);
    const [shape, setShape] = useState<ShapeId>(readStoredShape);
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => applyTheme(theme), [theme]);
    useEffect(() => applyShape(shape), [shape]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const current = THEMES.find((t) => t.id === theme);
    const shapeLabel = SHAPES.find((s) => s.id === shape)?.label ?? shape;

    const groups = [
        { tone: 'dark' as const, label: 'Dark' },
        { tone: 'light' as const, label: 'Light' },
    ];

    return (
        <div className={styles.switcher} ref={rootRef}>
            {open && (
                <div className={styles.popover} role="dialog" aria-label="Theme preview">
                    {groups.map((group) => (
                        <div key={group.tone}>
                            <div className={styles.groupLabel}>{group.label}</div>
                            <div className={styles.swatchGrid}>
                                {THEMES.filter((t) => t.tone === group.tone).map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        data-theme={t.id === 'midnight' ? undefined : t.id}
                                        className={`${styles.swatch} ${t.id === theme ? styles.swatchActive : ''}`}
                                        aria-pressed={t.id === theme}
                                        onClick={() => setTheme(t.id)}
                                    >
                                        <span className={styles.swatchChip} aria-hidden="true">
                                            <i style={{ background: 'var(--seed-bg)' }} />
                                            <i style={{ background: 'var(--seed-accent)' }} />
                                            <i style={{ background: 'var(--seed-active)' }} />
                                            <i style={{ background: 'var(--seed-playhead)' }} />
                                        </span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <span className={styles.tag}>preview</span>
            <button
                type="button"
                className={styles.button}
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-haspopup="dialog"
            >
                <span className={styles.swatches} aria-hidden="true">
                    <i style={{ background: 'var(--seed-accent)' }} />
                    <i style={{ background: 'var(--seed-active)' }} />
                    <i style={{ background: 'var(--seed-playhead)' }} />
                </span>
                {current?.label ?? theme}
            </button>
            <button
                type="button"
                className={`${styles.button} ${styles.secondary}`}
                onClick={() => setShape(nextIn(SHAPES, shape))}
                aria-label={`Cell shape: ${shapeLabel}. Activate for the next shape.`}
            >
                {shapeLabel}
            </button>
        </div>
    );
}
