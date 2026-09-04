import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { getDB } from './db.js';
import { initDB } from './schema.js';
import { createSession, destroySession, requireAuth, rateLimit } from './auth.js';

const app = express();

app.set('trust proxy', 1);

/*
 * Production origins are fixed; any localhost port is allowed in development so
 * a dev server that picked a different port isn't silently blocked.
 */
const PROD_ORIGINS = ['https://evanczako.github.io'];
const isDev = process.env.NODE_ENV !== 'production';

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) return callback(null, true);
            if (PROD_ORIGINS.includes(origin)) return callback(null, true);
            if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '64kb' }));

const MAX_NAME_LENGTH = 64;
const MAX_BEATREP_LENGTH = 8192;
const MIN_PASSWORD_LENGTH = 8;

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

await initDB();
console.log('✅ Database initialized');

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/register', authLimiter, async (req, res) => {
    try {
        const username = String(req.body?.username ?? '').trim();
        const password = String(req.body?.password ?? '');

        if (!username || username.length > 32) {
            return res.status(400).json({ error: 'Username must be 1-32 characters' });
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            return res
                .status(400)
                .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        }

        const db = await getDB();
        const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run('INSERT INTO users (username, hashedPassword) VALUES (?, ?)', [
            username,
            hashedPassword,
        ]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', authLimiter, async (req, res) => {
    try {
        const username = String(req.body?.username ?? '').trim();
        const password = String(req.body?.password ?? '');

        const db = await getDB();
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        // Compare regardless of whether the user exists so a missing account and
        // a wrong password take the same amount of time.
        const hash =
            user?.hashedPassword ??
            '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
        const isValid = await bcrypt.compare(password, hash);

        if (!user || !isValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const { token, expiresAt } = await createSession(user.id);
        res.json({ token, expiresAt, userId: user.id, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/logout', requireAuth, async (req, res) => {
    try {
        await destroySession(req.sessionToken);
        res.json({ message: 'Logged out' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/me', requireAuth, async (req, res) => {
    try {
        const db = await getDB();
        const user = await db.get('SELECT id, username FROM users WHERE id = ?', [req.userId]);
        if (!user) return res.status(401).json({ error: 'Not authenticated' });
        res.json({ userId: user.id, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/doughloops', requireAuth, async (req, res) => {
    try {
        const db = await getDB();
        const loops = await db.all(
            'SELECT id, userId, name, beatRep FROM doughloops WHERE userId = ? ORDER BY name',
            [req.userId]
        );
        res.json(loops);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch loops' });
    }
});

app.post('/doughloops', requireAuth, async (req, res) => {
    try {
        const name = String(req.body?.name ?? '').trim();
        const beatRep = String(req.body?.beatRep ?? '');

        if (!name || name.length > MAX_NAME_LENGTH) {
            return res.status(400).json({ error: `Name must be 1-${MAX_NAME_LENGTH} characters` });
        }
        if (!beatRep || beatRep.length > MAX_BEATREP_LENGTH) {
            return res.status(400).json({ error: 'Invalid loop data' });
        }

        const db = await getDB();
        const existing = await db.get('SELECT id FROM doughloops WHERE userId = ? AND name = ?', [
            req.userId,
            name,
        ]);

        if (existing) {
            await db.run('UPDATE doughloops SET beatRep = ? WHERE id = ?', [beatRep, existing.id]);
            return res.status(200).json({ id: existing.id, userId: req.userId, name, beatRep });
        }

        const result = await db.run(
            'INSERT INTO doughloops (userId, name, beatRep) VALUES (?, ?, ?)',
            [req.userId, name, beatRep]
        );
        res.status(201).json({ id: result.lastID, userId: req.userId, name, beatRep });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Save failed' });
    }
});

app.delete('/doughloops/:id', requireAuth, async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid loop ID' });

        const db = await getDB();
        // Ownership is part of the WHERE clause, so a loop belonging to someone
        // else is indistinguishable from one that does not exist.
        const result = await db.run('DELETE FROM doughloops WHERE id = ? AND userId = ?', [
            id,
            req.userId,
        ]);

        if (result.changes === 0) return res.status(404).json({ error: 'Loop not found' });
        res.json({ message: 'Loop deleted successfully', id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete loop' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
