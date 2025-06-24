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
    const [currentStep, setCurrentStep] = useState<number | undefined>(undefined);
    const bpm = useStore((s) => s.bpm);
    const setBpm = useStore((s) => s.setBpm);

    const numBeats = useStore((s) => s.numBeats);
    const setNumBeats = useStore((s) => s.setNumBeats);
    const numSubdivisions = useStore((s) => s.numSubdivisions);
    const setNumSubdivisions = useStore((s) => s.setNumSubdivisions);




    const numSteps = numBeats * 4;

    const emptyGrid = Array(4)
        .fill(null)
        .map(() => Array(numSteps).fill(false));
    const [grid, setGrid] = useState<boolean[][]>(emptyGrid);

    const [name, setName] = useState('');

    const handlePlayToggle = async () => {
        await Tone.start(); // <-- resumes AudioContext
        setIsPlaying((prev) => !prev);
    };

    // When numBeats changes, reset grid to correct length
    useEffect(() => {
        setGrid((prev) =>
            prev.map((row) => {
                const newRow = [...row];
                newRow.length = numBeats * numSubdivisions;
                return newRow.fill(false, row.length);
            })
        );

			console.log("=======================");
		
		console.log("BASE_URL:", import.meta.env.BASE_URL);
		console.log("Kick path:", `${import.meta.env.BASE_URL}samples/kick1.mp3`);
    }, [numBeats, numSubdivisions]);

    // Reset selected loop on logout
    useEffect(() => {
        if (!user && selectedLoop) {
            setSelectedLoop(undefined);
        }
    }, [user]);

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
            <DrumLoopPlayer grid={grid} isPlaying={isPlaying} onStep={setCurrentStep} bpm={bpm} />
            <div style={{ marginBottom: 16 }}>
                <label>
                    Beats: {numBeats}
                    <input
                        type="range"
                        min={1}
                        max={8}
                        value={numBeats}
                        onChange={(e) => setNumBeats(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>
            <div style={{ margin: '10px 0' }}>
                <label htmlFor="subdivisions">Subdivisions per Beat: {numSubdivisions}</label>
                <input
                    id="subdivisions"
                    type="range"
                    min={1}
                    max={8}
                    value={numSubdivisions}
                    onChange={(e) => setNumSubdivisions(Number(e.target.value))}
                />
            </div>
            <div style={{ margin: '20px 0' }}>
                <label>
                    BPM: {bpm}
                    <input
                        type="range"
                        min="60"
                        max="180"
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </label>
            </div>

            <button onClick={handlePlayToggle}>{isPlaying ? 'Stop' : 'Play'}</button>

            {user && (
                <>
                    <hr style={{ margin: '20px 0' }} />
                    <DoughLoopList selectedLoop={selectedLoop} onSelectLoop={setSelectedLoop} />
                </>
            )}
        </div>
    );
}
