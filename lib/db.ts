import type { SQLiteDatabase } from 'expo-sqlite';
import type { LogEntry, Category } from './dummy';

type RawRow = {
  id: string;
  title: string;
  body: string;
  summary: string;
  category: string;
  created_at: string;
};

function toEntry(r: RawRow): LogEntry {
  return { id: r.id, title: r.title, body: r.body, summary: r.summary, category: r.category as Category, createdAt: r.created_at };
}

export async function initDb(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'その他',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  await db.execAsync(`ALTER TABLE notes ADD COLUMN log_ids TEXT NOT NULL DEFAULT ''`).catch(() => {});
}

export async function getSetting(db: SQLiteDatabase, key: string, fallback: string): Promise<string> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? fallback;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

export async function getAllLogs(db: SQLiteDatabase): Promise<LogEntry[]> {
  const rows = await db.getAllAsync<RawRow>('SELECT * FROM logs ORDER BY created_at DESC');
  return rows.map(toEntry);
}

export async function insertLog(db: SQLiteDatabase, entry: LogEntry): Promise<void> {
  await db.runAsync(
    'INSERT INTO logs (id, title, body, summary, category, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    entry.id, entry.title, entry.body, entry.summary, entry.category, entry.createdAt,
  );
}

export async function deleteLog(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM logs WHERE id = ?', id);
}

export async function updateLog(db: SQLiteDatabase, id: string, title: string, body: string, category: Category): Promise<void> {
  await db.runAsync(
    'UPDATE logs SET title = ?, body = ?, category = ? WHERE id = ?',
    title, body, category, id,
  );
}

export async function getLogsByIds(db: SQLiteDatabase, ids: string[]): Promise<LogEntry[]> {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(', ');
  const rows = await db.getAllAsync<RawRow>(
    `SELECT * FROM logs WHERE id IN (${placeholders}) ORDER BY created_at DESC`,
    ids,
  );
  return rows.map(toEntry);
}

export async function searchLogs(db: SQLiteDatabase, query: string, category: string | null): Promise<LogEntry[]> {
  if (!query && !category) return getAllLogs(db);
  let sql = 'SELECT * FROM logs WHERE 1=1';
  const params: string[] = [];
  if (query) {
    sql += ' AND (title LIKE ? OR body LIKE ? OR summary LIKE ?)';
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  sql += ' ORDER BY created_at DESC';
  const rows = await db.getAllAsync<RawRow>(sql, params);
  return rows.map(toEntry);
}
