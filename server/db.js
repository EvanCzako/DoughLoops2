import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function getDB() {
    const isRender = process.env.RENDER === 'true';
    const dbPath = isRender ? '/data/data.db' : path.resolve('./data.db');

    return open({
        filename: dbPath,
        driver: sqlite3.Database,
    });
}
