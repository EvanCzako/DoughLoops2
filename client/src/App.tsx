import { JSX, useEffect, useState } from 'react';
import { useStore } from './store';
import React from 'react';
import AuthPage from './components/AuthPage';

export default function App(): JSX.Element {
  return (
    <div>
      <h1>Welcome to DoughLoops</h1>
      <AuthPage />
    </div>
  );
}