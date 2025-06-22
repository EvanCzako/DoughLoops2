import React from 'react';

interface DrumGridProps {
  grid: boolean[][];
  setGrid: (g: boolean[][]) => void;
  currentStep: number | null;
}

export default function DrumGrid({ grid, setGrid, currentStep }: DrumGridProps) {
  const instruments = ['kick', 'snare', 'hihat', 'clap'];

  const toggle = (row: number, col: number) => {
    const updated = grid.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === col ? !c : c)) : r
    );
    setGrid(updated);
  };

  return (
    <div className="drum-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          <span className="label">{instruments[rowIndex]}</span>
          {row.map((checked, colIndex) => {
            const isActive = colIndex === currentStep;
            return (
              <input
                key={colIndex}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(rowIndex, colIndex)}
                className={isActive ? 'active-step' : ''}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
