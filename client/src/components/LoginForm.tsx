import { useState, FormEvent } from 'react';
import { useStore } from '../store';
import { apiFetch, ApiError } from '../api';
import styles from '../styles/LoginForm.module.css';

interface LoginResponse {
    token: string;
    userId: number;
    username: string;
}

export default function LoginForm() {
    const setSession = useStore((s) => s.setSession);
    const setUserDropdownOpen = useStore((s) => s.setUserDropdownOpen);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await apiFetch<LoginResponse>('/login', {
                method: 'POST',
                body: { username, password },
                token: null,
            });

            setSession({ id: data.userId, username: data.username }, data.token);
            setUserDropdownOpen(false);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className={styles.loginForm} onSubmit={handleSubmit}>
            <h2>Login</h2>

            <input
                type="text"
                placeholder="Username"
                aria-label="Username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className={styles.loginFormInput}
            />

            <input
                type="password"
                placeholder="Password"
                aria-label="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className={styles.loginFormInput}
            />

            <button type="submit" disabled={loading} className={styles.loginButton}>
                {loading ? 'Waiting…' : 'Login'}
            </button>

            {loading && (
                <p className={styles.formHint}>
                    The API sleeps when idle — the first request can take a minute.
                </p>
            )}
            {error && (
                <p className={styles.formError} role="alert">
                    {error}
                </p>
            )}
        </form>
    );
}
