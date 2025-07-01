import { JSX, useEffect, useState } from 'react';
import { useStore } from './store';
import React from 'react';
import AuthPage from './components/AuthPage';
import DoughLoopManager from './components/DoughLoopManager';
import TitleBox from './components/TitleBox';

export default function App(): JSX.Element {


	const numBeats = useStore((s) => s.numBeats);

	const numSteps = numBeats * 4;

	const emptyGrid = Array(4)
        .fill(null)
        .map(() => Array(numSteps).fill(false));
	const [grid, setGrid] = useState<boolean[][]>(emptyGrid);
	const [name, setName] = useState('');


    return (
        <div>
            <TitleBox />
            <DoughLoopManager grid={grid} setGrid={setGrid} name={name} setName={setName}/>
            <AuthPage grid={grid} setGrid={setGrid} name={name} setName={setName}/>
        </div>
    );
}
