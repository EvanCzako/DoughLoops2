import { useStore } from '../store';
import { apiFetch } from '../api';
import styles from '../styles/LoginForm.module.css';

export default function LogoutButton() {
    const logout = useStore((s) => s.logout);
    const user = useStore((s) => s.user);
    const setUserDropdownOpen = useStore((s) => s.setUserDropdownOpen);

    if (!user) return null;

    const handleLogout = () => {
        // Fire-and-forget: the local session is dropped either way, so a failed
        // revoke shouldn't strand the user in a logged-in UI.
        apiFetch('/logout', { method: 'POST' }).catch(() => {});
        logout();
        setUserDropdownOpen(false);
    };

    return (
        <button onClick={handleLogout} className={styles.loginButton}>
            Logout
        </button>
    );
}
