import { useEffect, useRef, RefObject } from 'react';
import * as Tone from 'tone';
import { useStore } from '../store';
import { INSTRUMENT_KEYS, SAMPLE_VARIANTS, resolveSampleName } from '../instruments';

interface DrumLoopPlayerProps {
    grid: boolean[][];
    isPlaying: boolean;
    bpm?: number;
    stepRef: RefObject<number>;
}

type PlayerMap = Record<string, Tone.Player>;

export default function DrumLoopPlayer({
    grid,
    isPlaying,
    bpm = 85,
    stepRef,
}: DrumLoopPlayerProps) {
    const base = import.meta.env.BASE_URL;

    const playersRef = useRef<PlayerMap>({});

    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const volumes = useStore((s) => s.volumes);
    const selectedSamples = useStore((s) => s.selectedSamples);

    const sampleStatus = useStore((s) => s.sampleStatus);
    const setSampleStatus = useStore((s) => s.setSampleStatus);
    const setCurrentStep = useStore((s) => s.setCurrentStep);
    const setIsPlaying = useStore((s) => s.setIsPlaying);

    const gridRef = useRef(grid);
    const volumesRef = useRef(volumes);
    const selectedSamplesRef = useRef(selectedSamples);

    gridRef.current = grid;
    volumesRef.current = volumes;
    selectedSamplesRef.current = selectedSamples;

    useEffect(() => {
        let cancelled = false;
        const players: PlayerMap = {};

        const loads = INSTRUMENT_KEYS.flatMap((inst) =>
            SAMPLE_VARIANTS.map((variant) => {
                const sampleName = `${inst}${variant}`;
                return new Promise<void>((resolve, reject) => {
                    players[sampleName] = new Tone.Player({
                        url: `${base}samples/${sampleName}.mp3`,
                        onload: () => resolve(),
                        onerror: () => reject(new Error(`Failed to load ${sampleName}.mp3`)),
                    }).toDestination();
                });
            })
        );

        playersRef.current = players;
        setSampleStatus('loading');

        Promise.all(loads)
            .then(() => {
                if (!cancelled) setSampleStatus('ready');
            })
            .catch((err: Error) => {
                if (cancelled) return;
                console.error(err);
                setSampleStatus('error');
            });

        return () => {
            cancelled = true;
            Object.values(players).forEach((player) => player.dispose());
            playersRef.current = {};
        };
    }, [base, setSampleStatus]);

    /*
     * The step interval is expressed in transport ticks, not seconds, so a
     * tempo change is a parameter ramp rather than a teardown -- see the bpm
     * effect below. Only a change to the grid's subdivision count needs the
     * repeat rescheduled.
     */
    useEffect(() => {
        if (sampleStatus !== 'ready') return;

        const transport = Tone.getTransport();
        const draw = Tone.getDraw();

        const repeat = (time: number) => {
            const step = stepRef.current;
            const numSteps = gridRef.current[0]?.length || 16;

            INSTRUMENT_KEYS.forEach((_, row) => {
                if (!gridRef.current[row]?.[step]) return;

                const sampleName = resolveSampleName(row, selectedSamplesRef.current[row]);
                const player = playersRef.current[sampleName];
                if (!player?.loaded) return;

                const gain = volumesRef.current[row];
                player.volume.value = Tone.gainToDb(Number.isFinite(gain) ? gain : 1);
                player.start(time);
            });

            // Repaint at audio time, not at schedule time. The transport runs a
            // lookahead ahead of the speakers, so calling setCurrentStep here
            // directly would light the playhead early by that lookahead.
            draw.schedule(() => setCurrentStep(step), time);

            stepRef.current = (step + 1) % numSteps;
        };

        const ticksPerStep = Math.max(1, Math.round(transport.PPQ / numSubdivisions));
        const repeatId = transport.scheduleRepeat(repeat, Tone.Ticks(ticksPerStep));

        return () => {
            transport.clear(repeatId);
        };
    }, [numSubdivisions, sampleStatus, setCurrentStep, stepRef]);

    useEffect(() => {
        const transport = Tone.getTransport();
        if (transport.state === 'started') transport.bpm.rampTo(bpm, 0.05);
        else transport.bpm.value = bpm;
    }, [bpm]);

    useEffect(() => {
        const transport = Tone.getTransport();

        if (!isPlaying) {
            transport.pause();
            return;
        }

        if (sampleStatus !== 'ready') {
            // Play was requested before the kit finished loading. Bail out of
            // the pressed state rather than leaving a dead transport running.
            if (sampleStatus === 'error') setIsPlaying(false);
            return;
        }

        transport.start();
        return () => {
            transport.pause();
        };
    }, [isPlaying, sampleStatus, setIsPlaying]);

    return null;
}
