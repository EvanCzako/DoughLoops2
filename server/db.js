import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

/*
 * One connection for the process lifetime.
 *
 * getDB() used to call open() on every request and never close the handle,
 * which leaked a file descriptor per request.
 */
let dbPromise = null;

export function getDB() {
    if (!dbPromise) {
        const isRender = process.env.RENDER === 'true';
        const filename = isRender ? '/data/data.db' : path.resolve('./data.db');

        dbPromise = open({ filename, driver: sqlite3.Database }).then(async (db) => {
            await db.exec('PRAGMA journal_mode = WAL');
            await db.exec('PRAGMA foreign_keys = ON');
            return db;
        });

        dbPromise.catch(() => {
            dbPromise = null;
        });
    }

    return dbPromise;
}

export async function closeDB() {
    if (!dbPromise) return;
    const db = await dbPromise;
    dbPromise = null;
    await db.close();
}
