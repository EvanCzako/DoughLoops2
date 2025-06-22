import React from 'react';
import { useStore } from '../store';

export default function LogoutButton() {
  const logout = useStore((s) => s.logout);
  const user = useStore((s) => s.user);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    // Optionally: redirect or clear other stuff here
  };

  return (
    <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
      Logout
    </button>
  );
}
