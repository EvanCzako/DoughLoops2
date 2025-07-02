import { JSX, useEffect, useState } from 'react';
import { useStore } from './store';
import React from 'react';
import AuthPage from './components/AuthPage';
import DoughLoopManager from './components/DoughLoopManager';
import TitleBox from './components/TitleBox';

export default function App(): JSX.Element {

	const grid = useStore((s) => s.grid);
	
	const setGrid = useStore((s) => s.setGrid);
	const name = useStore((s) => s.name);
	const setName = useStore((s) => s.setName);

	console.log("++++++++");
	console.log(grid);


    return (
        <div>
            <TitleBox />
            <DoughLoopManager grid={grid} setGrid={setGrid} name={name} setName={setName}/>
            <AuthPage grid={grid} setGrid={setGrid} name={name} setName={setName}/>
        </div>
    );
}
