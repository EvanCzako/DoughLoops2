function encodeDrumGrid({
    bpm,
    numBeats,
    subdivisions,
    grid,
    samples,
    volumes,
}: {
    bpm: number;
    numBeats: number;
    subdivisions: number;
    grid: boolean[][];
    samples: string[];
    volumes: number[];
}): string {
    const meta = `${bpm},${numBeats},${subdivisions}`;
    const config = samples.map((s, i) => `${s}:${volumes[i]}`).join('|');
    const gridRows = grid.map((row) => row.map((cell) => (cell ? '1' : '0')).join(''));
	console.log(`${meta}::${config}::${gridRows.join('::')}`);
    return `${meta}::${config}::${gridRows.join('::')}`;
}

function decodeDrumGrid(encoded: string): {
    bpm: number;
    numBeats: number;
    subdivisions: number;
    grid: boolean[][];
    samples: string[];
    volumes: number[];
} | null {
    try {
        const [meta, config, ...rows] = encoded.split('::');
        const [bpmStr, beatsStr, subsStr] = meta.split(',');

        const bpm = parseInt(bpmStr, 10);
        const numBeats = parseInt(beatsStr, 10);
        const subdivisions = parseInt(subsStr, 10);
        const cols = numBeats * subdivisions;

        const sampleData = config.split('|');
        const samples = sampleData.map((s) => s.split(':')[0]);
        const volumes = sampleData.map((s) => parseFloat(s.split(':')[1]));

        if (!bpm || !numBeats || !subdivisions || rows.some((r) => r.length !== cols)) return null;

        const grid = rows.map((row) => [...row].map((char) => char === '1'));

        return { bpm, numBeats, subdivisions, grid, samples, volumes };
    } catch {
        return null;
    }
}

export {
	encodeDrumGrid,
	decodeDrumGrid
}