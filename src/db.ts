import * as SQLite from 'expo-sqlite';

import type { ParsedItem } from './parse';

const db = SQLite.openDatabaseSync('recast.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES sessions(id),
    q TEXT NOT NULL,
    me TEXT NOT NULL,
    native TEXT NOT NULL,
    pattern TEXT NOT NULL,
    stage INTEGER NOT NULL DEFAULT 0,
    due TEXT NOT NULL
  );
`);

function ymd(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function saveSession(items: ParsedItem[]) {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 1);

  db.withTransactionSync(() => {
    const { lastInsertRowId } = db.runSync('INSERT INTO sessions (date) VALUES (?)', ymd(today));
    for (const item of items) {
      db.runSync(
        'INSERT INTO items (session_id, q, me, native, pattern, due) VALUES (?, ?, ?, ?, ?, ?)',
        lastInsertRowId,
        item.q,
        item.me,
        item.native,
        item.pattern,
        ymd(due),
      );
    }
  });
}

export type SavedItem = ParsedItem & { id: number; due: string };
export type SavedSession = { id: number; date: string; items: SavedItem[] };

export function getSessions(): SavedSession[] {
  const sessions = db.getAllSync<{ id: number; date: string }>('SELECT id, date FROM sessions ORDER BY id DESC');
  const items = db.getAllSync<SavedItem & { session_id: number }>(
    'SELECT id, session_id, q, me, native, pattern, due FROM items ORDER BY id',
  );
  return sessions.map((session) => ({
    ...session,
    items: items.filter((item) => item.session_id === session.id),
  }));
}
