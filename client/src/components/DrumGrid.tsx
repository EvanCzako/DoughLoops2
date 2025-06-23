import React from 'react';
import '../styles/DrumGrid.css';

interface DrumGridProps {
  grid: boolean[][];
  setGrid: (g: boolean[][]) => void;
  currentStep?: number; // add this to highlight active column
}

export default function DrumGrid({ grid, setGrid, currentStep }: DrumGridProps) {
  const instruments = ['kick', 'snare', 'hihat', 'clap'];

  const toggle = (row: number, col: number) => {
    const updated = grid.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === col ? !c : c)) : r
    );
    setGrid(updated);
  };

  const numCols = grid[0]?.length || 0;

  return (
    <div className="drum-grid">
      {/* Ghost row for current step highlight */}
      <div className="ghost-row">
        {Array.from({ length: numCols }).map((_, colIndex) => (
          <div
            key={`ghost-${colIndex}`}
            className={`ghost-cell ${currentStep === colIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Instrument rows */}
      {grid.map((row, rowIndex) => (
        <div className="grid-row" key={`row-${rowIndex}`}>
          <span className="label">{instruments[rowIndex]}</span>
          {row.map((checked, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="cell">
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
  );
}
