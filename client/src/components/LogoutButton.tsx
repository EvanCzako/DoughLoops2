import React from 'react';
import { useStore } from '../store';

export default function LogoutButton() {
    const logout = useStore((s) => s.logout);
    const user = useStore((s) => s.user);
	const selectedLoop = useStore((s) => s.selectedLoop);

    if (!user) return null;

    const handleLogout = () => {
		console.log(selectedLoop);
        logout();
		console.log(selectedLoop);
        // Optionally: redirect or clear other stuff here
    };

    return (
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Logout
        </button>
    );
}
