import type { SQLiteDatabase } from 'expo-sqlite';

export type Note = {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

type RawNote = {
  id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  updated_at: string;
};

function toNote(r: RawNote): Note {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    category: r.category,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getAllNotes(db: SQLiteDatabase): Promise<Note[]> {
  const rows = await db.getAllAsync<RawNote>('SELECT * FROM notes ORDER BY updated_at DESC');
  return rows.map(toNote);
}

export async function upsertNote(db: SQLiteDatabase, note: Note): Promise<void> {
  await db.runAsync(
    `INSERT INTO notes (id, title, body, category, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       body = excluded.body,
       updated_at = excluded.updated_at`,
    note.id, note.title, note.body, note.category, note.createdAt, note.updatedAt,
  );
}

export async function deleteNote(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM notes WHERE id = ?', id);
}
