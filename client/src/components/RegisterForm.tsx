// client/src/components/RegisterForm.tsx
import React, { useState } from 'react';

export default function RegisterForm() {
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
            const res = await fetch('http://localhost:3000/register', {
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
        <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: 'auto' }}>
            <h2>Register</h2>

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
                {loading ? 'Registering...' : 'Register'}
            </button>

            {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: 8 }}>{success}</p>}
        </form>
    );
}
