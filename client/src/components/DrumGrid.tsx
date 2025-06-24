import React from 'react';
import { useStore } from '../store';
import styles from '../styles/DrumGrid.module.css';

interface DrumGridProps {
  grid: boolean[][];
  setGrid: (g: boolean[][]) => void;
  currentStep?: number;
}

export default function DrumGrid({ grid, setGrid, currentStep }: DrumGridProps) {
  const setEditingLoopId = useStore((s) => s.setEditingLoopId);
  const numSubdivisions = useStore((s) => s.numSubdivisions);
  const instruments = ['kick', 'snare', 'hat', 'clap'];

  const toggle = (row: number, col: number) => {
    const updated = grid.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === col ? !c : c)) : r
    );
    setGrid(updated);
    setEditingLoopId(null);
  };

  const numCols = grid[0]?.length || 0;
  const numRows = grid.length;
  const cellWidth = 28;
  const gridWidthPx = numCols * cellWidth + 50 + 16;

  // Calculate beat width in px for each beat group
  const beatWidth = numSubdivisions * cellWidth;

  return (
    <div className={styles.drumGridOuter}>
      <div className={styles.scrollContainer} style={{ width: '100%', overflowX: 'auto' }}>
        <div
          className={styles.innerGridContainer}
          style={{ width: gridWidthPx }}
        >
          {/* Ghost Row */}
          <div className={styles.ghostRow}>
            <span className={styles.label} /> {/* label spacer */}
            {Array.from({ length: numCols }).map((_, colIndex) => (
              <div
                key={`ghost-${colIndex}`}
                className={`${styles.ghostCell} ${
                  currentStep === colIndex ? styles.active : ''
                }`}
              />
            ))}
          </div>

          {/* Drum grid container (position: relative) */}
          <div className={styles.gridContainer}>
            {/* Beat background stripes */}
            <div className={styles.beatBackground}>
              {Array.from({ length: numCols / numSubdivisions }).map((_, beatIndex) => (
				<div
					key={`beat-bg-${beatIndex}`}
					className={`${styles.beatStripe} ${
						beatIndex % 2 === 0 ? styles.evenBeatHue : styles.oddBeatHue
					}`}
					style={{ width: beatWidth }}
				/>
              ))}
            </div>

            {/* Drum Grid Rows */}
            <div className={styles.drumGrid}>
              {grid.map((row, rowIndex) => (
                <div className={styles.gridRow} key={`row-${rowIndex}`}>
                  <span className={styles.label}>{instruments[rowIndex]}</span>
                  {row.map((checked, colIndex) => (
                    <div
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={`${styles.cell} ${currentStep === colIndex ? styles.playing : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(rowIndex, colIndex)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
