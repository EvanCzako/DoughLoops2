import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 16 }}>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <button
                    onClick={() => setIsLogin(true)}
                    disabled={isLogin}
                    style={{ marginRight: 8, padding: '8px 16px' }}
                >
                    Login
                </button>
                <button
                    onClick={() => setIsLogin(false)}
                    disabled={!isLogin}
                    style={{ padding: '8px 16px' }}
                >
                    Register
                </button>
            </div>

            {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
    );
}
