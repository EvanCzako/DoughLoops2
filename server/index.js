import express from 'express';
import cors from 'cors';
import { getDB } from './db.js';
import { initDB } from './schema.js';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
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
    const result = await db.run(
      'INSERT INTO doughloops (userId, name, beatRep) VALUES (?, ?, ?)',
      [userId, name, beatRep]
    );
    const newLoop = {
      id: result.lastID,
      userId,
      name,
      beatRep,
    };
    res.status(201).json(newLoop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});


app.get('/doughloops', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
	const db = await getDB();
    const loops = await db.all(
      'SELECT * FROM doughloops WHERE userId = ?',
      [userId]
    );
    res.json(loops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch loops' });
  }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
