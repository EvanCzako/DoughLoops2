import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

/*
 * Without this, any render-time throw left a blank page and no way back --
 * including one caused by a corrupt pattern restored from localStorage, which
 * would then throw again on every reload.
 */
export default class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('DoughLoops crashed:', error, info.componentStack);
    }

    handleReset = () => {
        try {
            localStorage.removeItem('doughloops.workingLoop');
        } catch {
            /* Nothing more to clear. */
        }
        window.location.reload();
    };

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <div role="alert" className="crashScreen">
                <h1>DoughLoops hit a snag.</h1>
                <p>{this.state.error.message}</p>
                <button type="button" onClick={this.handleReset}>
                    Reset and reload
                </button>
            </div>
        );
    }
}
