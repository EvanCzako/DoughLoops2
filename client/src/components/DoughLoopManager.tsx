import React from 'react';
import { useStore } from '../store';
import NewDoughLoopForm from './NewDoughLoopForm';
import DoughLoopList from './DoughLoopList';
import LogoutButton from './LogoutButton';

export default function DoughLoopManager() {
    const user = useStore((s) => s.user);

    if (!user) return null;

    return (
        <div style={{ padding: 24, maxWidth: 600, margin: 'auto' }}>
            <h2>Welcome, {user.username} 👋</h2>
			<LogoutButton/>
            <NewDoughLoopForm />
            <hr style={{ margin: '20px 0' }} />
            <DoughLoopList />
        </div>
    );
}
