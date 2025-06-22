import React from 'react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import NewDoughLoopForm from './NewDoughLoopForm';
import DoughLoopList from './DoughLoopList';
import LogoutButton from './LogoutButton';
import DrumLoopEditor from './DrumLoopEditor';
import type { DoughLoop } from '../store';

export default function DoughLoopManager() {
  const user = useStore((s) => s.user);
  const [selectedLoop, setSelectedLoop] = useState<DoughLoop | undefined>(undefined);

  // 🆙 LIFT grid + name state
  const [grid, setGrid] = useState<boolean[][]>(
    () => Array(4).fill(null).map(() => Array(16).fill(false))
  );
  const [name, setName] = useState('');

  // Optional: reset selected loop on logout
  useEffect(() => {
    if (!user && selectedLoop) {
      setSelectedLoop(undefined);
    }
  }, [user]);

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: 'auto' }}>
      {user ? (
        <>
          <h2>Welcome, {user.username} 👋</h2>
          <LogoutButton />
        </>
      ) : null}

      <DrumLoopEditor
        selectedLoop={selectedLoop}
        grid={grid}
        setGrid={setGrid}
        name={name}
        setName={setName}
      />

      {user && (
        <>
          <hr style={{ margin: '20px 0' }} />
          <DoughLoopList
            selectedLoop={selectedLoop}
            onSelectLoop={setSelectedLoop}
          />
        </>
      )}
    </div>
  );
}
