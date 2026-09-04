import { useState, FormEvent } from 'react';
import { apiFetch, ApiError } from '../api';
import styles from '../styles/LoginForm.module.css';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!username.trim()) {
            setError('Username cannot be empty');
            return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }

        setLoading(true);
        try {
            await apiFetch('/register', {
                method: 'POST',
                body: { username, password },
                token: null,
            });
            setSuccess('Registered successfully! You can now log in.');
            setUsername('');
            setPassword('');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className={styles.loginForm} onSubmit={handleSubmit}>
            <h2>Register</h2>

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
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className={styles.loginFormInput}
            />

            <button type="submit" disabled={loading} className={styles.loginButton}>
                {loading ? 'Registering…' : 'Register'}
            </button>

            {error && (
                <p className={styles.formError} role="alert">
                    {error}
                </p>
            )}
            {success && (
                <p className={styles.formSuccess} role="status">
                    {success}
                </p>
            )}
        </form>
    );
}
