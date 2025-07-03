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

    const selectedSamples = useStore((s) => s.selectedSamples);

    useEffect(() => {
        const instrumentKeys = ['kick', 'clap', 'snare', 'hat', 'rim', 'tom', 'cymbal', 'triangle'];

        const loadedPlayers = instrumentKeys.reduce(
            (acc, inst, i) => {
                const file = `${base}samples/${selectedSamples[i]}.mp3`;
                acc[inst] = new Tone.Player(file).toDestination();
                return acc;
            },
            {} as Record<string, Tone.Player>
        );

        playersRef.current = loadedPlayers;

        Promise.all(Object.values(loadedPlayers).map((p) => p.loaded)).then(() => {
            setSamplesLoaded(true);
            console.log('Samples loaded 🎉');
        });
    }, [selectedSamples]);

    const gridRef = useRef(grid);

    useEffect(() => {
        gridRef.current = grid;
    }, [grid]);

    useEffect(() => {
        if (!samplesLoaded) return;

        // Always cancel existing scheduled events before creating new ones
        Tone.Transport.stop();
        Tone.Transport.cancel();

        stepRef.current = 0;

        const repeat = (time: number) => {
            const step = stepRef.current;
            const numSteps = gridRef.current[0]?.length || 16;

            if (gridRef.current[0][step]) playersRef.current.kick.start(time);
            if (gridRef.current[1][step]) playersRef.current.clap.start(time);
            if (gridRef.current[2][step]) playersRef.current.snare.start(time);
            if (gridRef.current[3][step]) playersRef.current.hat.start(time);
            if (gridRef.current[4][step]) playersRef.current.rim.start(time);
            if (gridRef.current[5][step]) playersRef.current.tom.start(time);
            if (gridRef.current[6][step]) playersRef.current.cymbal.start(time);
            if (gridRef.current[7][step]) playersRef.current.triangle.start(time);


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
            Tone.Transport.clear(repeatId); // just clears this one repeat
            Tone.Transport.stop(); // stops the clock
        };
    }, [isPlaying, bpm, numSubdivisions, samplesLoaded, selectedLoop]);

    return null; // No UI needed here
}
