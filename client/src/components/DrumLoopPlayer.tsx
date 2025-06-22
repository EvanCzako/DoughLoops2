import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

interface DrumLoopPlayerProps {
  grid: boolean[][]; // 4 rows: kick, snare, hihat, clap
  isPlaying: boolean;
  bpm?: number;
}

export default function DrumLoopPlayer({
  grid,
  isPlaying,
  bpm = 120,
}: DrumLoopPlayerProps) {
  const stepRef = useRef(0);
  const playersRef = useRef<Record<string, Tone.Player>>({});
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  // Load samples once
  useEffect(() => {
    const kick = new Tone.Player('/samples/kick1.mp3').toDestination();
    const snare = new Tone.Player('/samples/snare1.mp3').toDestination();
    const hihat = new Tone.Player('/samples/hat1.mp3').toDestination();
    const clap = new Tone.Player('/samples/clap1.mp3').toDestination();

    playersRef.current = { kick, snare, hihat, clap };

    // Wait for all samples to load
    Promise.all([
      kick.loaded,
      snare.loaded,
      hihat.loaded,
      clap.loaded,
    ]).then(() => {
      setSamplesLoaded(true);
      console.log('All samples loaded 🎉');
    });
  }, []);

  // Schedule playback and handle play/stop
  useEffect(() => {
    if (!samplesLoaded) return; // Wait until loaded
    if (grid.length < 4) return; // Guard for grid shape

    const repeat = (time: number) => {
      const step = stepRef.current;
      const numSteps = grid[0]?.length || 16;

      if (grid[0][step]) playersRef.current.kick.start(time);
      if (grid[1][step]) playersRef.current.snare.start(time);
      if (grid[2][step]) playersRef.current.hihat.start(time);
      if (grid[3][step]) playersRef.current.clap.start(time);

      stepRef.current = (step + 1) % numSteps;
    };

    Tone.Transport.bpm.value = bpm;

    // Clear previous events to avoid duplicates
    Tone.Transport.cancel();
    Tone.Transport.scheduleRepeat(repeat, '16n');

    if (isPlaying) {
      Tone.start().then(() => {
        stepRef.current = 0;
        Tone.Transport.start();
      });
    } else {
      Tone.Transport.stop();
    }

    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [isPlaying, grid, bpm, samplesLoaded]);

  return null; // No UI needed here
}
