import { useState, useRef } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useStore } from '../store';
import styles from '../styles/AuthPage.module.css';
import LogoutButton from './LogoutButton';

/*
 * Part of the account feature, which is currently not mounted anywhere --
 * see the note at the top of App.tsx.
 */
export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const formContainerRef = useRef<HTMLDivElement | null>(null);

    const user = useStore((s) => s.user);

    const handleToggle = (toLogin: boolean) => {
        setIsLogin(toLogin);
        setTimeout(() => {
            formContainerRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
        }, 0);
    };

    const loggedOutDisp = (
        <div className={styles.authPanel} ref={formContainerRef}>
            <div className={styles.authToggle}>
                <button
                    type="button"
                    className={styles.loginRegisterButton}
                    onClick={() => handleToggle(true)}
                    disabled={isLogin}
                >
                    Login
                </button>
                <button
                    type="button"
                    className={styles.loginRegisterButton}
                    onClick={() => handleToggle(false)}
                    disabled={!isLogin}
                >
                    Register
                </button>
            </div>

            {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
    );

    const loggedInDisp = (
        <div className={styles.authPanel}>
            <h2 className={styles.welcome}>Welcome, {user?.username}!</h2>
            <LogoutButton />
        </div>
    );

    return <div className={styles.userAuthSection}>{user ? loggedInDisp : loggedOutDisp}</div>;
}
