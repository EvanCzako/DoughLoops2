import React from 'react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import DoughLoopList from './DoughLoopList';
import LogoutButton from './LogoutButton';
import DrumLoopEditor from './DrumLoopEditor';
import type { DoughLoop } from '../store';
import DrumLoopPlayer from './DrumLoopPlayer';
import * as Tone from 'tone';

export default function DoughLoopManager() {
  const user = useStore((s) => s.user);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLoop, setSelectedLoop] = useState<DoughLoop | undefined>(undefined);
	const [currentStep, setCurrentStep] = useState<number | null>(null);

  // 🆙 LIFT grid + name state
  const [grid, setGrid] = useState<boolean[][]>(
    () => Array(4).fill(null).map(() => Array(16).fill(false))
  );
  const [name, setName] = useState('');

  const handlePlayToggle = async () => {
	await Tone.start(); // <-- resumes AudioContext
	setIsPlaying((prev) => !prev);
};

  // Optional: reset selected loop on logout
  useEffect(() => {
    if (!user && selectedLoop) {
      setSelectedLoop(undefined);
    }
  }, [user]);

  console.log('Current step:', currentStep);

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: 'auto' }}>
      {user ? (
        <>
          <h2>Welcome, {user.username} 👋</h2>
          <LogoutButton />
        </>
      ) : null}

      <DrumLoopEditor
        selectedLoop={selectedLoop}
        grid={grid}
        setGrid={setGrid}
        name={name}
        setName={setName}
		currentStep={currentStep}
      />
	<DrumLoopPlayer
		grid={grid}
		isPlaying={isPlaying}
		onStep={setCurrentStep}
	/>
	<button onClick={handlePlayToggle}>
		{isPlaying ? 'Stop' : 'Play'}
	</button>
	  

      {user && (
        <>
          <hr style={{ margin: '20px 0' }} />
          <DoughLoopList
            selectedLoop={selectedLoop}
            onSelectLoop={setSelectedLoop}
          />
        </>
      )}
    </div>
  );
}
