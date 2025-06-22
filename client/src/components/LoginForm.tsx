// client/src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useStore, User } from '../store';

export default function LoginForm() {
    const setUser = useStore((state) => state.setUser);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Login failed');
            }

            const data: { userId: number; username: string } = await res.json();

            // Update global user state
            const loggedInUser: User = { id: data.userId, username: data.username };
            setUser(loggedInUser);

            setSuccess('Login successful!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: 'auto' }}>
            <h2>Login</h2>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                style={{ width: '100%', marginBottom: 8, padding: 8 }}
            />

            <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
                {loading ? 'Logging in...' : 'Login'}
            </button>

            {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: 8 }}>{success}</p>}
        </form>
    );
}
