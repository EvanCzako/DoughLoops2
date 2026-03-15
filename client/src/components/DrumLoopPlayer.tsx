import { useEffect, useRef, useState, RefObject } from 'react';
import { useStore } from '../store';
import * as Tone from 'tone';

interface DrumLoopPlayerProps {
    grid: boolean[][];
    isPlaying: boolean;
    bpm?: number;
    stepRef: RefObject<number>;
}

export default function DrumLoopPlayer({
    grid,
    isPlaying,
    bpm = 85,
    stepRef,
}: DrumLoopPlayerProps) {
    const base = import.meta.env.BASE_URL;

    const playersRef = useRef<Record<string, Record<string, Tone.Player>>>({});

    const [samplesLoaded, setSamplesLoaded] = useState(false);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const volumes = useStore((s) => s.volumes);
    const selectedSamples = useStore((s) => s.selectedSamples);

    const setCurrentStep = useStore((s) => s.setCurrentStep);

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

        const allLoadPromises = instrumentKeys.flatMap((inst) =>
            variations.map((num) => allPlayers[inst][`${inst}${num}`].loaded)
        );

        Promise.all(allLoadPromises).then(() => {
            setSamplesLoaded(true);
        });

        return () => {
            Object.values(playersRef.current).forEach((variants) =>
                Object.values(variants).forEach((player) => player.dispose())
            );
            playersRef.current = {};
        };
    }, []);

    const gridRef = useRef(grid);
    const volumesRef = useRef(volumes);

    useEffect(() => {
        gridRef.current = grid;
    }, [grid]);

    useEffect(() => {
        volumesRef.current = volumes;
    }, [volumes]);

    useEffect(() => {
        if (!samplesLoaded) return;

        const transport = Tone.getTransport();
        transport.stop();
        transport.cancel();

        const repeat = (time: number) => {
            const step = stepRef.current;
            const numSteps = gridRef.current[0]?.length || 16;

            const instKeys = ['kick', 'clap', 'snare', 'hat', 'rim', 'tom', 'cymbal', 'triangle'];

            instKeys.forEach((inst, i) => {
                const stepActive = gridRef.current[i]?.[step];
                if (!stepActive) return;

                const sampleName = selectedSamplesRef.current[i];
                const player = playersRef.current[inst][sampleName];

                player.volume.value = Tone.gainToDb(volumesRef.current[i]);
                player.start(time);
            });

            setCurrentStep(step);
            stepRef.current = (step + 1) % numSteps;
        };

        const secondsPerBeat = 60 / bpm;
        const stepDuration = secondsPerBeat / numSubdivisions;

        transport.bpm.value = bpm;
        const repeatId = transport.scheduleRepeat(repeat, stepDuration);

        if (isPlaying) {
            Tone.start().then(() => {
                transport.start();
            });
        }

        return () => {
            transport.clear(repeatId);
            transport.stop();
        };
    }, [isPlaying, bpm, numSubdivisions, samplesLoaded]);

    return null;
}
