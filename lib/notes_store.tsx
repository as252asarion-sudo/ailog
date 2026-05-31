import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllNotes, upsertNote, deleteNote as dbDeleteNote, type Note } from './notes_db';
import { searchLogs } from './db';
import { synthesizeLogs } from './ai';

type NotesContextType = {
  notes: Note[];
  synthesize: (category: string) => Promise<Note>;
  removeNote: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState<Note[]>([]);

  const refresh = useCallback(async () => {
    setNotes(await getAllNotes(db));
  }, [db]);

  useEffect(() => { refresh(); }, [refresh]);

  const synthesize = async (category: string): Promise<Note> => {
    const logs = await searchLogs(db, '', category);
    if (!logs.length) throw new Error('このカテゴリにログがありません');

    const result = await synthesizeLogs(
      logs.map((l) => ({ title: l.title, summary: l.summary, body: l.body })),
      category,
    );

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const existing = notes.find((n) => n.category === category);
    const note: Note = {
      id: existing?.id ?? Date.now().toString(),
      title: result.title,
      body: result.body,
      category,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    await upsertNote(db, note);
    await refresh();
    return note;
  };

  const removeNote = async (id: string) => {
    await dbDeleteNote(db, id);
    await refresh();
  };

  return (
    <NotesContext.Provider value={{ notes, synthesize, removeNote, refresh }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('NotesProvider missing');
  return ctx;
}
