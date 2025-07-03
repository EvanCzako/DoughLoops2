// client/src/components/RegisterForm.tsx
import React, { useState } from 'react';

import styles from '../styles/LoginForm.module.css';

export default function RegisterForm() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    function validateInput() {
        if (!username.trim() || !password.trim()) {
            setError('Username and password cannot be empty');
            return false;
        }
        // Add more client-side checks if you want (length, chars, etc)
        return true;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateInput()) return;

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Registration failed');
            }

            setSuccess('Registered successfully! You can now log in.');
            setUsername('');
            setPassword('');
        } catch (err: any) {
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
            <h2>Register</h2>

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
                {loading ? 'Registering...' : 'Register'}
            </button>

            {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: 8 }}>{success}</p>}
        </form>
    );
}
