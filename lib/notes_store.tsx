import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllNotes, upsertNote, deleteNote as dbDeleteNote, type Note } from './notes_db';
import { getLogsByIds } from './db';
import { synthesizeLogs } from './ai';

type SynthesizeOpts = {
  title?: string;
  existingNoteId?: string;
};

type NotesContextType = {
  notes: Note[];
  synthesizeFromLogs: (logIds: string[], opts?: SynthesizeOpts) => Promise<Note>;
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

  const synthesizeFromLogs = async (logIds: string[], opts?: SynthesizeOpts): Promise<Note> => {
    const selectedLogs = await getLogsByIds(db, logIds);
    if (!selectedLogs.length) throw new Error('ログが見つかりません');

    // most common category among selected logs
    const counts = selectedLogs.reduce((acc, l) => {
      acc[l.category] = (acc[l.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const category = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

    const result = await synthesizeLogs(
      selectedLogs.map((l) => ({ title: l.title, summary: l.summary, body: l.body })),
      category,
    );

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const existingNote = opts?.existingNoteId ? notes.find((n) => n.id === opts.existingNoteId) : undefined;
    const note: Note = {
      id: existingNote?.id ?? Date.now().toString(),
      title: opts?.title?.trim() || result.title,
      body: result.body,
      category,
      logIds,
      createdAt: existingNote?.createdAt ?? timestamp,
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
    <NotesContext.Provider value={{ notes, synthesizeFromLogs, removeNote, refresh }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('NotesProvider missing');
  return ctx;
}
