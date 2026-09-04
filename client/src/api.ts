const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOKEN_KEY = 'doughloops.token';

// The free Render instance spins down when idle; a cold start can take the
// better part of a minute, so the timeout has to be generous.
const REQUEST_TIMEOUT_MS = 60_000;

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export function readStoredToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function storeToken(token: string | null): void {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {
        /* Private browsing or blocked storage: session lasts the tab, no more. */
    }
}

interface RequestOptions {
    method?: string;
    body?: unknown;
    token?: string | null;
    signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, token = readStoredToken(), signal } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    signal?.addEventListener('abort', () => controller.abort(), { once: true });

    let res: Response;
    try {
        res = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: {
                ...(body ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
    } catch (err) {
        if (signal?.aborted) throw err;
        throw new ApiError(
            controller.signal.aborted
                ? 'The server took too long to respond. It may be waking up — try again.'
                : 'Could not reach the server.',
            0
        );
    } finally {
        clearTimeout(timeoutId);
    }

    if (res.status === 204) return undefined as T;

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
        throw new ApiError(payload?.error || `Request failed (${res.status})`, res.status);
    }

    return payload as T;
}
