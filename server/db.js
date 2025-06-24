import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function getDB() {
    const isRender = process.env.RENDER === 'true'; // Render sets this automatically
    const dbPath = isRender
        ? '/data/data.db' // <-- mounted persistent disk on Render
        : path.resolve('./data.db'); // <-- local dev

    return open({
        filename: dbPath,
        driver: sqlite3.Database,
    });
}
