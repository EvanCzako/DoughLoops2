import React from 'react';
import { useStore } from '../store';
import styles from '../styles/LoginForm.module.css';

export default function LogoutButton() {
    const logout = useStore((s) => s.logout);
    const user = useStore((s) => s.user);
    const setUserDropdownOpen = useStore((s) => s.setUserDropdownOpen);

    if (!user) return null;

    const handleLogout = () => {
        logout();
		setUserDropdownOpen(false);
        // Optionally: redirect or clear other stuff here
    };

    return (
        <button onClick={handleLogout} className={styles.loginButton}>
            Logout
        </button>
    );
}
