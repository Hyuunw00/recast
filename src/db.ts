import * as SQLite from 'expo-sqlite';

import type { ParsedItem } from './parse';
import {
  afterAgain,
  afterDone,
  DEFAULT_SCHEDULE,
  DEFAULT_TIME,
  dueFor,
  parseSchedule,
  remapStage,
  toYmd,
} from './schedule';

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
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

export type Settings = { time: string; schedule: number[] };
export type SavedItem = ParsedItem & { id: number; stage: number; due: string; savedOn: string };
export type SavedSession = { id: number; date: string; items: SavedItem[] };

const ITEMS = `
  SELECT items.id, items.session_id, q, me, native, pattern, stage, due, sessions.date AS savedOn
  FROM items JOIN sessions ON sessions.id = items.session_id
`;

export function getSettings(): Settings {
  const rows = db.getAllSync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    time: stored.time ?? DEFAULT_TIME,
    schedule: parseSchedule(stored.schedule ?? '') ?? DEFAULT_SCHEDULE,
  };
}

export function saveSettings({ time, schedule }: Settings) {
  const previous = getSettings().schedule;
  db.withTransactionSync(() => {
    db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'time', time);
    db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'schedule', schedule.join(','));
    if (schedule.join(',') === previous.join(',')) return;
    for (const item of db.getAllSync<SavedItem>(ITEMS)) {
      const stage = remapStage(item.stage, previous, schedule);
      const due = previous[item.stage] === schedule[stage] ? item.due : dueFor(item.savedOn, stage, schedule);
      db.runSync('UPDATE items SET stage = ?, due = ? WHERE id = ?', stage, due, item.id);
    }
  });
}

export function saveSession(items: ParsedItem[]) {
  const today = toYmd(new Date());
  const due = dueFor(today, 0, getSettings().schedule);

  db.withTransactionSync(() => {
    const { lastInsertRowId } = db.runSync('INSERT INTO sessions (date) VALUES (?)', today);
    for (const item of items) {
      db.runSync(
        'INSERT INTO items (session_id, q, me, native, pattern, due) VALUES (?, ?, ?, ?, ?, ?)',
        lastInsertRowId,
        item.q,
        item.me,
        item.native,
        item.pattern,
        due,
      );
    }
  });
}

export function getSessions(): SavedSession[] {
  const sessions = db.getAllSync<{ id: number; date: string }>('SELECT id, date FROM sessions ORDER BY id DESC');
  const items = db.getAllSync<SavedItem & { session_id: number }>(`${ITEMS} ORDER BY items.id`);
  return sessions.map((session) => ({
    ...session,
    items: items.filter((item) => item.session_id === session.id),
  }));
}

export function getDueItems() {
  return db.getAllSync<SavedItem>(
    `${ITEMS} WHERE due != '' AND due <= ? ORDER BY due, items.id`,
    toYmd(new Date()),
  );
}

export function getPendingDues() {
  return db.getAllSync<{ due: string }>("SELECT due FROM items WHERE due != ''").map((row) => row.due);
}

export function markDone(item: SavedItem) {
  const { stage, due } = afterDone(item.savedOn, item.stage, getSettings().schedule, toYmd(new Date()));
  db.runSync('UPDATE items SET stage = ?, due = ? WHERE id = ?', stage, due, item.id);
}

export function markAgain(item: SavedItem) {
  db.runSync('UPDATE items SET due = ? WHERE id = ?', afterAgain(toYmd(new Date())), item.id);
}
