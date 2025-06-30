import { JSX, useEffect, useState } from 'react';
import { useStore } from './store';
import React from 'react';
import AuthPage from './components/AuthPage';
import DoughLoopManager from './components/DoughLoopManager';
import TitleBox from './components/TitleBox';

export default function App(): JSX.Element {
    const user = useStore((s) => s.user);

    return (
        <div>
			<TitleBox/>
            <DoughLoopManager />
            <AuthPage/>
        </div>
    );
}
