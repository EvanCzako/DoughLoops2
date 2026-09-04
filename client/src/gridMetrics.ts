/*
 * Grid cell sizing.
 *
 * This is measured from the sequencer's own box rather than the viewport,
 * because the panel the grid sits in is not the window: it shares the row with
 * the side controls in landscape and sits under the header in portrait.
 *
 * The important rule here is the aspect bound. Letting cells fill the panel on
 * both axes means a long pattern in a short, wide panel produces slivers -- at
 * 64 steps a cell ended up roughly four times taller than it was wide, which
 * reads as a bar chart rather than a step. Past the bound the cells keep a
 * usable shape and the grid scrolls instead of compressing further.
 */

/** Must match the `gap` on .grid / .controlsTrack in DrumGrid.module.css. */
export const GRID_GAP = 6;

/** Gap between an instrument button and its volume button. */
const KIT_GAP = 4;

/** Thickness of the volume button across the kit track. */
const VOL_THICKNESS = 22;

/** The beat ruler's own track: a row in landscape, a column in portrait. */
const RULER = 16;

const MIN_CELL = 22;

/*
 * Only portrait needs an upper bound. There the eight instrument lanes always
 * divide the full width, so a wide portrait viewport (a tablet) would otherwise
 * produce ~100px steps. In landscape the cell height is bounded by the panel
 * and the width by MAX_WIDE, so neither can run away.
 */
const MAX_CELL_PORTRAIT = 72;

/** A cell may be at most this many times taller than it is wide... */
const MAX_TALL = 2;

/** ...and at most this many times wider than it is tall. */
const MAX_WIDE = 1.5;

const NUM_KIT_LANES = 8;

/*
 * Classic scrollbars take space from the cross axis when the grid overflows,
 * which would clip the last row (landscape hides overflow-y). Reserving it
 * unconditionally costs under a pixel per row and avoids a feedback loop where
 * the scrollbar appearing changes the size that decides whether it appears.
 * Overlay scrollbars measure 0, so nothing is reserved on those platforms.
 */
let scrollbarCache: number | null = null;

export function scrollbarSize(): number {
    if (scrollbarCache !== null) return scrollbarCache;
    if (typeof document === 'undefined') return 0;

    const probe = document.createElement('div');
    probe.style.cssText =
        'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;visibility:hidden';
    document.body.appendChild(probe);
    scrollbarCache = probe.offsetHeight - probe.clientHeight;
    probe.remove();
    return scrollbarCache;
}

export interface GridMetrics {
    cellW: number;
    cellH: number;
    /** Side of the square instrument button. */
    kitMain: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/*
 * Each orientation resolves one axis from the panel and derives the other, so
 * there is no circular dependency between the kit track's size and the space
 * left for the grid.
 */
export function computeGridMetrics(
    width: number,
    height: number,
    numCols: number,
    numRows: number,
    isPortrait: boolean
): GridMetrics {
    if (numCols < 1 || numRows < 1 || width <= 0 || height <= 0) {
        return { cellW: 40, cellH: 40, kitMain: 40 };
    }

    const bar = scrollbarSize();

    if (isPortrait) {
        // Instruments run across the width; steps run down and scroll.
        const lanes = Math.min(numRows, NUM_KIT_LANES);
        // lanes + the ruler column = lanes + 1 tracks, so `lanes` gaps.
        const natural = (width - bar - RULER - GRID_GAP * lanes) / lanes;
        const cellW = clamp(natural, MIN_CELL, MAX_CELL_PORTRAIT);
        const cellH = clamp(cellW / 1.25, Math.max(MIN_CELL, cellW / MAX_WIDE), cellW * MAX_TALL);
        return { cellW, cellH, kitMain: cellW };
    }

    // Landscape: instrument rows divide the panel height, so cell height is
    // settled first and everything else follows from it.
    const usableH = height - RULER - bar - GRID_GAP * numRows - 1;
    const cellH = Math.max(MIN_CELL, usableH / numRows);
    const kitMain = cellH;

    const kitTrack = kitMain + KIT_GAP + VOL_THICKNESS;
    const usableW = width - kitTrack - GRID_GAP - GRID_GAP * (numCols - 1);
    const naturalW = usableW / numCols;

    const cellW = Math.max(MIN_CELL, clamp(naturalW, cellH / MAX_TALL, cellH * MAX_WIDE));

    return { cellW, cellH, kitMain };
}
