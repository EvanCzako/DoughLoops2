interface DrumGridProps {
    grid: boolean[][];
    setGrid: (g: boolean[][]) => void;
}

export default function DrumGrid({ grid, setGrid }: DrumGridProps) {
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
                    {row.map((checked, colIndex) => (
                        <input
                            key={colIndex}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(rowIndex, colIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
