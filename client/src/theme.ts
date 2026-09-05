/*
 * TEMPORARY -- theme preview scaffolding.
 *
 * This exists so themes can be compared in the running app. Once a look is
 * chosen, fold that theme's seeds into the :root seed block of
 * `styles/variables.module.css` and then remove:
 *
 *   - this file, `components/ThemeSwitcher.tsx`, `styles/ThemeSwitcher.module.css`
 *   - the <ThemeSwitcher /> line and its import in `components/TitleBox.tsx`
 *   - the applyTheme call and import in `main.tsx`
 *   - the [data-theme] blocks in variables.module.css
 *
 * The default (midnight) deliberately writes no DOM attribute, so nothing is
 * left behind once the scaffolding is gone.
 */

export const THEMES = [
    { id: 'midnight', label: 'Midnight', tone: 'dark' },
    { id: 'plum', label: 'Plum', tone: 'dark' },
    { id: 'neon', label: 'Neon', tone: 'dark' },
    { id: 'ocean', label: 'Ocean', tone: 'dark' },
    { id: 'forest', label: 'Forest', tone: 'dark' },
    { id: 'terminal', label: 'Terminal', tone: 'dark' },
    { id: 'bakery', label: 'Bakery', tone: 'dark' },
    { id: 'sunset', label: 'Sunset', tone: 'dark' },
    { id: 'rose', label: 'Rose', tone: 'dark' },
    { id: 'mono', label: 'Mono', tone: 'dark' },
    { id: 'daylight', label: 'Daylight', tone: 'light' },
    { id: 'arctic', label: 'Arctic', tone: 'light' },
    { id: 'candy', label: 'Candy', tone: 'light' },
    { id: 'sand', label: 'Sand', tone: 'light' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

const THEME_KEY = 'doughloops.theme';

function read<T extends string>(key: string, allowed: readonly { id: T }[], fallback: T): T {
    try {
        const stored = localStorage.getItem(key);
        return allowed.some((o) => o.id === stored) ? (stored as T) : fallback;
    } catch {
        return fallback;
    }
}

export function readStoredTheme(): ThemeId {
    return read(THEME_KEY, THEMES, 'midnight');
}

/* The default theme is the bare :root values, so no attribute is written for
 * it -- that keeps the DOM clean once the scaffolding is removed. */
export function applyTheme(theme: ThemeId): void {
    const root = document.documentElement;
    if (theme === 'midnight') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        /* Preview preference only; not worth surfacing a failure. */
    }
}

export function nextIn<T extends string>(list: readonly { id: T }[], current: T): T {
    const i = list.findIndex((o) => o.id === current);
    return list[(i + 1) % list.length].id;
}
