import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    THEMES,
    SHAPES,
    ThemeId,
    ShapeId,
    applyTheme,
    applyShape,
    readStoredTheme,
    readStoredShape,
} from '../theme';
import styles from '../styles/ThemeSwitcher.module.css';

/*
 * TEMPORARY -- see the header of `src/theme.ts` for how to remove this once a
 * look is settled on.
 *
 * It lives in the header rather than floating over the app: in portrait the
 * bottom of the screen belongs to the transport and beat/split controls, and a
 * floating pill sat on top of them.
 *
 * The panel is portalled and fixed-positioned because .App and .mainContent
 * both clip overflow, so an absolutely positioned popover would be cut off.
 */
export default function ThemeSwitcher() {
    const [theme, setTheme] = useState<ThemeId>(readStoredTheme);
    const [shape, setShape] = useState<ShapeId>(readStoredShape);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, right: 0 });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => applyTheme(theme), [theme]);
    useEffect(() => applyShape(shape), [shape]);

    useLayoutEffect(() => {
        if (!open) return;

        const place = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) {
                setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
            }
        };

        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
                setOpen(false);
            }
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
    const groups = [
        { tone: 'dark' as const, label: 'Dark' },
        { tone: 'light' as const, label: 'Light' },
    ];

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className={styles.trigger}
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={`Theme preview: ${current?.label ?? theme}`}
                title="Theme preview"
            >
                <span className={styles.swatches} aria-hidden="true">
                    <i style={{ background: 'var(--seed-accent)' }} />
                    <i style={{ background: 'var(--seed-active)' }} />
                    <i style={{ background: 'var(--seed-playhead)' }} />
                </span>
                <span className={styles.triggerLabel}>{current?.label ?? theme}</span>
            </button>

            {open &&
                createPortal(
                    <div
                        ref={panelRef}
                        className={styles.panel}
                        style={{ top: `${pos.top}px`, right: `${pos.right}px` }}
                        role="dialog"
                        aria-label="Theme preview"
                    >
                        <div className={styles.panelHead}>
                            <span className={styles.tag}>preview</span>
                            <div className={styles.shapeRow} role="group" aria-label="Cell shape">
                                {SHAPES.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        className={`${styles.shapeButton} ${s.id === shape ? styles.shapeActive : ''}`}
                                        aria-pressed={s.id === shape}
                                        onClick={() => setShape(s.id)}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

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
                    </div>,
                    document.body
                )}
        </>
    );
}
