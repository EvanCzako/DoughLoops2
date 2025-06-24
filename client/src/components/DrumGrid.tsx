import React from 'react';
import { useStore } from '../store';
import '../styles/DrumGrid.css';

interface DrumGridProps {
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
    currentStep?: number; // add this to highlight active column
}

export default function DrumGrid({ grid, setGrid, currentStep }: DrumGridProps) {
    const setEditingLoopId = useStore((s) => s.setEditingLoopId);

    const numSubdivisions = useStore((s) => s.numSubdivisions);

    const instruments = ['kick', 'snare', 'hihat', 'clap'];

    const toggle = (row: number, col: number) => {
        const updated = grid.map((r, ri) =>
            ri === row ? r.map((c, ci) => (ci === col ? !c : c)) : r
        );
        setGrid(updated);
        setEditingLoopId(null);
    };

    const numCols = grid[0]?.length || 0;

    return (
        <div className="drum-grid-outer">
            <div className="drum-grid-scroll">
                <div className="ghost-row">
                    <span className="label" /> {/* label spacer */}
                    {Array.from({ length: numCols }).map((_, colIndex) => (
                        <div
                            key={`ghost-${colIndex}`}
                            className={`ghost-cell ${currentStep === colIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>

                <div className="drum-grid">
                    {grid.map((row, rowIndex) => (
                        <div className="grid-row" key={`row-${rowIndex}`}>
                            <span className="label">{instruments[rowIndex]}</span>
                            {row.map((checked, colIndex) => {
                                const beatIndex = Math.floor(colIndex / numSubdivisions);
                                const isEvenBeat = beatIndex % 2 === 0;

                                return (
                                    <div
                                        key={`cell-${rowIndex}-${colIndex}`}
                                        className={`cell ${isEvenBeat ? 'even-beat' : 'odd-beat'} ${
                                            currentStep === colIndex ? 'playing' : ''
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggle(rowIndex, colIndex)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
