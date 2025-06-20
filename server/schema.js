import { getDB } from './db.js';

export async function initDB() {
  const db = await getDB();

  // Create `users` table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      hashedPassword TEXT NOT NULL
    );
  `);

  // Create `doughLoops` table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS doughLoops (
      id INTEGER PRIMARY KEY,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      beatRep TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
}
