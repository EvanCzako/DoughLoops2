import crypto from 'crypto';
import { getDB } from './db.js';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function createSession(userId) {
    const db = await getDB();
    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = Date.now() + SESSION_TTL_MS;

    await db.run('INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)', [
        token,
        userId,
        expiresAt,
    ]);

    return { token, expiresAt };
}

export async function destroySession(token) {
    const db = await getDB();
    await db.run('DELETE FROM sessions WHERE token = ?', [token]);
}

function bearerToken(req) {
    const header = req.get('authorization') || '';
    const [scheme, value] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && value ? value : null;
}

/*
 * Every route below this middleware gets its user identity from the session
 * table. Nothing reads a userId supplied by the caller -- doing so previously
 * meant any integer could read, overwrite or delete any account's loops.
 */
export async function requireAuth(req, res, next) {
    try {
        const token = bearerToken(req);
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        const db = await getDB();
        const session = await db.get('SELECT userId, expiresAt FROM sessions WHERE token = ?', [
            token,
        ]);

        if (!session) return res.status(401).json({ error: 'Not authenticated' });

        if (session.expiresAt < Date.now()) {
            await destroySession(token);
            return res.status(401).json({ error: 'Session expired' });
        }

        req.userId = session.userId;
        req.sessionToken = token;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/*
 * Fixed-window limiter, in memory. Enough to blunt credential stuffing against
 * a single-instance deployment; swap for a shared store if this ever scales out.
 */
export function rateLimit({ windowMs, max }) {
    const hits = new Map();

    return (req, res, next) => {
        const now = Date.now();
        const key = req.ip;
        const entry = hits.get(key);

        if (!entry || entry.resetAt <= now) {
            hits.set(key, { count: 1, resetAt: now + windowMs });
        } else if (entry.count >= max) {
            res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
            return res.status(429).json({ error: 'Too many attempts. Try again shortly.' });
        } else {
            entry.count += 1;
        }

        if (hits.size > 5000) {
            for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
        }

        next();
    };
}
