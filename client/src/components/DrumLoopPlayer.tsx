import React, { useEffect, useRef, useState } from 'react';
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
        if (!samplesLoaded) return;
        if (grid.length < 4) return;

        stepRef.current = 0;

        // Cancel any old scheduled repeats and clear all Transport events
        Tone.Transport.cancel();

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

        // Schedule the repeat and save the event ID
        const repeatId = Tone.Transport.scheduleRepeat(repeat, '16n');

        Tone.Transport.bpm.value = bpm;

        if (isPlaying) {
            Tone.start().then(() => {
                Tone.Transport.start();
            });
        } else {
            Tone.Transport.stop();
        }

        return () => {
            // Clear only this scheduled event, then stop Transport
            Tone.Transport.clear(repeatId);
            Tone.Transport.stop();
        };
    }, [isPlaying, bpm, samplesLoaded]);

    return null; // No UI needed here
}
