import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import * as Tone from 'tone';

interface DrumLoopPlayerProps {
    grid: boolean[][];
    isPlaying: boolean;
    bpm?: number;
    onStep?: (step: number) => void; // <-- new prop
}

export default function DrumLoopPlayer({
    grid,
    isPlaying,
    bpm = 120,
    onStep,
}: DrumLoopPlayerProps) {

    const base = import.meta.env.BASE_URL;

    const stepRef = useRef(0);
    const playersRef = useRef<Record<string, Tone.Player>>({});
    const [samplesLoaded, setSamplesLoaded] = useState(false);
	const numSubdivisions = useStore((s) => s.numSubdivisions);
	const selectedLoop = useStore((s) => s.selectedLoop);

    // Load samples once
    useEffect(() => {
        const kick = new Tone.Player(`${base}samples/kick1.mp3`).toDestination();
        const snare = new Tone.Player(`${base}samples/snare1.mp3`).toDestination();
        const hat = new Tone.Player(`${base}samples/hat1.mp3`).toDestination();
        const clap = new Tone.Player(`${base}samples/clap1.mp3`).toDestination();

        playersRef.current = { kick, snare, hat, clap };

        // Wait for all samples to load
        Promise.all([kick.loaded, snare.loaded, hat.loaded, clap.loaded]).then(() => {
            setSamplesLoaded(true);
            console.log('All samples loaded 🎉');
        });
    }, []);
    const gridRef = useRef(grid);

    useEffect(() => {
        gridRef.current = grid;
    }, [grid]);


useEffect(() => {
    if (!samplesLoaded || grid.length < 4) return;

    // Always cancel existing scheduled events before creating new ones
    Tone.Transport.stop();
    Tone.Transport.cancel();

    stepRef.current = 0;

    const repeat = (time: number) => {
        const step = stepRef.current;
        const numSteps = gridRef.current[0]?.length || 16;

        if (gridRef.current[0][step]) playersRef.current.kick.start(time);
        if (gridRef.current[1][step]) playersRef.current.snare.start(time);
        if (gridRef.current[2][step]) playersRef.current.hat.start(time);
        if (gridRef.current[3][step]) playersRef.current.clap.start(time);

        onStep?.(step);
        stepRef.current = (step + 1) % numSteps;
    };

    const secondsPerBeat = 60 / bpm;
    const stepDuration = secondsPerBeat / numSubdivisions;

    Tone.Transport.bpm.value = bpm;
    const repeatId = Tone.Transport.scheduleRepeat(repeat, stepDuration);

    if (isPlaying) {
        Tone.start().then(() => {
            Tone.Transport.start();
        });
    }

    return () => {
        Tone.Transport.clear(repeatId);  // just clears this one repeat
        Tone.Transport.stop();           // stops the clock
    };
}, [isPlaying, bpm, numSubdivisions, grid, samplesLoaded, selectedLoop]);


    return null; // No UI needed here
}
