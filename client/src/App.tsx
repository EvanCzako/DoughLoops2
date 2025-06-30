import { JSX, useEffect, useState } from 'react';
import { useStore } from './store';
import React from 'react';
import AuthPage from './components/AuthPage';
import DoughLoopManager from './components/DoughLoopManager';
import DrumLoopEditor from './components/DrumLoopEditor';

export default function App(): JSX.Element {
    const user = useStore((s) => s.user);

    return (
        <div>
            <h1>DoughLoops</h1>
            <AuthPage/>
            <DoughLoopManager />
        </div>
    );
}
