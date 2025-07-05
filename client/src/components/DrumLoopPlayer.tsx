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
    const playersRef = useRef<Record<string, Record<string, Tone.Player>>>({});

    const [samplesLoaded, setSamplesLoaded] = useState(false);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const selectedLoop = useStore((s) => s.selectedLoop);
	const volumes = useStore((s) => s.volumes);
    const selectedSamples = useStore((s) => s.selectedSamples);

	const selectedSamplesRef = useRef<string[]>(selectedSamples);

	useEffect(() => {
		selectedSamplesRef.current = selectedSamples;
	}, [selectedSamples]);

	useEffect(() => {
		const instrumentKeys = ['kick', 'clap', 'snare', 'hat', 'rim', 'tom', 'cymbal', 'triangle'];
		const variations = ['1', '2', '3'];

		const allPlayers: Record<string, Record<string, Tone.Player>> = {};

		instrumentKeys.forEach((inst) => {
			allPlayers[inst] = {};

			variations.forEach((num) => {
				const sampleName = `${inst}${num}`;
				const file = `${base}samples/${sampleName}.mp3`;
				allPlayers[inst][sampleName] = new Tone.Player(file).toDestination();
			});
		});

		playersRef.current = allPlayers;

		// Wait for all players to load
		const allLoadPromises = instrumentKeys.flatMap((inst) =>
			variations.map((num) => allPlayers[inst][`${inst}${num}`].loaded)
		);

		Promise.all(allLoadPromises).then(() => {
			setSamplesLoaded(true);
			console.log('All samples loaded 🎉');
		});
	}, []);


    const gridRef = useRef(grid);
 	const volumesRef = useRef(volumes);
	// const

    useEffect(() => {
        gridRef.current = grid;
    }, [grid]);

	useEffect(() => {
        volumesRef.current = volumes;
    }, [volumes]);

    useEffect(() => {
        if (!samplesLoaded) return;

        // Always cancel existing scheduled events before creating new ones
        Tone.Transport.stop();
        Tone.Transport.cancel();

        stepRef.current = 0;

        const repeat = (time: number) => {
            const step = stepRef.current;
            const numSteps = gridRef.current[0]?.length || 16;


			const instKeys = ['kick', 'clap', 'snare', 'hat', 'rim', 'tom', 'cymbal', 'triangle'];

			instKeys.forEach((inst, i) => {
				const stepActive = gridRef.current[i]?.[step];
				if (!stepActive) return;

				const sampleName = selectedSamplesRef.current[i]; // now reads current value!
				const player = playersRef.current[inst][sampleName];

				player.volume.value = Tone.gainToDb(volumesRef.current[i]);
				player.start(time);
			});



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
