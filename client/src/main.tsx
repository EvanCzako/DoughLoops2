import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
// TEMPORARY (see src/theme.ts): apply before first paint so there is no flash
// of the default theme on reload.
import { applyTheme, readStoredTheme } from './theme';

applyTheme(readStoredTheme());

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
    <StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </StrictMode>
);
