import { getDB } from './db.js';

export async function initDB() {
    const db = await getDB();

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      hashedPassword TEXT NOT NULL
    );
  `);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS doughloops (
      id INTEGER PRIMARY KEY,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      beatRep TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      expiresAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

    await db.exec(`CREATE INDEX IF NOT EXISTS idx_doughloops_userId ON doughloops(userId);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_doughloops_owner_name
                   ON doughloops(userId, name);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);`);

    await db.run('DELETE FROM sessions WHERE expiresAt < ?', [Date.now()]);
}
