import React, { useState, useRef } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useStore } from '../store';
import styles from '../styles/AuthPage.module.css';
import LogoutButton from './LogoutButton';
import DoughLoopList from './DoughLoopList';
import NewDoughLoopForm from './NewDoughLoopForm';

export default function AuthPage(opts: { grid: any; setGrid: any; name: any; setName: any }) {
    const [isLogin, setIsLogin] = useState(true);
    const formContainerRef = useRef<HTMLDivElement | null>(null);

    const user = useStore((s) => s.user);
    const selectedLoop = useStore((s) => s.selectedLoop);
    const setSelectedLoop = useStore((s) => s.setSelectedLoop);

    const handleToggle = (toLogin: boolean) => {
        setIsLogin(toLogin);
        setTimeout(() => {
            formContainerRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
        }, 0); // defer until DOM updates
    };

    const loggedOutDisp = (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 16 }} ref={formContainerRef}>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
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
        <div>
            <div className={styles.logoutContainer}>
                {user ? (
                    <>
                        <h2>Welcome, {user.username}!</h2>
                        <LogoutButton />
                    </>
                ) : null}
            </div>

            <NewDoughLoopForm
                grid={opts.grid}
                setGrid={opts.setGrid}
                name={opts.name}
                setName={opts.setName}
            />
            <DoughLoopList selectedLoop={selectedLoop} onSelectLoop={setSelectedLoop} />
        </div>
    );

    return <div className={styles.userAuthSection}>{user ? loggedInDisp : loggedOutDisp}</div>;
}

