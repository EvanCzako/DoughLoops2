// client/src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useStore, User } from '../store';
import styles from '../styles/LoginForm.module.css';

export default function LoginForm() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const setUser = useStore((state) => state.setUser);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
	const setUserDropdownOpen = useStore((s) => s.setUserDropdownOpen);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const res = await fetch(`${API_BASE_URL}/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || 'Login failed');
			}

			const data: { userId: number; username: string } = await res.json();

			const loggedInUser: User = { id: data.userId, username: data.username };
			setUser(loggedInUser);
			setSuccess('Login successful!');
			setUserDropdownOpen(false); // ✅ Only close dropdown here
		} catch (err: any) {
			console.error(err.message);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}


    return (
        <form
            className={styles.loginForm}
            onSubmit={handleSubmit}
            style={{ maxWidth: 320, margin: 'auto' }}
        >
            <h2>Login</h2>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className={styles.loginFormInput}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className={styles.loginFormInput}
            />

            <button type="submit" disabled={loading} className={styles.loginButton}>
                {loading ? 'Waiting...' : 'Login'}
            </button>

            {error && <p style={{ color: 'var(--color-off-red-1)', marginTop: 8 }}>{error}</p>}
            {success && <p style={{ color: 'var(--color-off-green-1)', marginTop: 8 }}>{success}</p>}
        </form>
    );
}
