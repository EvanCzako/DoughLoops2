import express from 'express';
import cors from 'cors';
import { getDB } from './db.js';
import { initDB } from './schema.js';
import bcrypt from 'bcrypt';

const app = express();
app.use(
    cors({
        origin: ['http://localhost:5173', 'https://evanczako.github.io'],
        credentials: true,
    })
);

app.use(express.json());

// 👇 Initialize tables on startup
initDB()
    .then(() => {
        console.log('✅ Database initialized');
    })
    .catch((err) => {
        console.error('❌ Failed to initialize DB:', err);
    });

// Register route
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = await getDB();

        // Check if username exists
        const existingUser = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        await db.run(`INSERT INTO users (username, hashedPassword) VALUES (?, ?)`, [
            username,
            hashedPassword,
        ]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = await getDB();

        // Find user by username
        const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare password with hashed password
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Successful login — in real apps you’d generate a session or token here
        res.json({ message: 'Login successful', userId: user.id, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// server/index.js or routes/doughloops.js
app.post('/doughloops', async (req, res) => {
    const { userId, name, beatRep } = req.body;

    if (!userId || !name || !beatRep) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        const db = await getDB();
        const existing = await db.get('SELECT id FROM doughloops WHERE userId = ? AND name = ?', [
            userId,
            name,
        ]);

        if (existing) {
            await db.run('UPDATE doughloops SET beatRep = ? WHERE id = ?', [beatRep, existing.id]);
            const updated = await db.get('SELECT * FROM doughloops WHERE id = ?', [existing.id]);
            return res.status(200).json(updated);
        } else {
            const result = await db.run(
                'INSERT INTO doughloops (userId, name, beatRep) VALUES (?, ?, ?)',
                [userId, name, beatRep]
            );
            return res.status(201).json({
                id: result.lastID,
                userId,
                name,
                beatRep,
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Save failed' });
    }
});

app.get('/doughloops', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const db = await getDB();
        const loops = await db.all('SELECT * FROM doughloops WHERE userId = ?', [userId]);
        res.json(loops);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch loops' });
    }
});

// Delete DoughLoop by ID, verifying userId
app.delete('/doughloops/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query; // assumes userId is passed as a query param

    if (!id || !userId) {
        return res.status(400).json({ error: 'Missing loop ID or userId' });
    }

    try {
        const db = await getDB();
        const loop = await db.get('SELECT * FROM doughloops WHERE id = ?', [id]);

        if (!loop) {
            return res.status(404).json({ error: 'Loop not found' });
        }

        if (loop.userId !== parseInt(userId)) {
            return res.status(403).json({ error: 'Unauthorized: userId does not match' });
        }

        await db.run('DELETE FROM doughloops WHERE id = ?', [id]);
        res.status(200).json({ message: 'Loop deleted successfully', id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete loop' });
    }
});








const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));

