import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllLogs, insertLog, deleteLog as dbDeleteLog, updateLog as dbUpdateLog } from './db';
import type { LogEntry } from './dummy';
import { analyzeText, fetchFromUrl } from './ai';

type LogsContextType = {
  logs: LogEntry[];
  addLog: (title: string, body: string) => Promise<void>;
  addLogsFromUrl: (url: string) => Promise<number>;
  removeLog: (id: string) => Promise<void>;
  editLog: (id: string, title: string, body: string, category: LogEntry['category']) => Promise<void>;
  refresh: () => Promise<void>;
};

const LogsContext = createContext<LogsContextType | null>(null);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const refresh = useCallback(async () => {
    setLogs(await getAllLogs(db));
  }, [db]);

  useEffect(() => { refresh(); }, [refresh]);

  const addLog = async (userTitle: string, body: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const createdAt = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    let summary = '';
    let category: LogEntry['category'] = 'その他';
    let aiTitle = '';

    try {
      const result = await analyzeText(body);
      summary = result.summary;
      category = result.category;
      aiTitle = result.title;
    } catch {
      // AI失敗時はsummary空・category'その他'のまま保存
    }

    const title = userTitle.trim() || aiTitle.trim() || body.trim().split('\n')[0].slice(0, 30) || '無題';

    const entry: LogEntry = {
      id: Date.now().toString(),
      title,
      body,
      summary,
      category,
      createdAt,
    };
    await insertLog(db, entry);
    await refresh();
  };

  const addLogsFromUrl = async (url: string): Promise<number> => {
    const conversations = await fetchFromUrl(url);
    for (const conv of conversations) {
      await addLog('', `Q: ${conv.question}\n\nA: ${conv.answer}`);
    }
    return conversations.length;
  };

  const removeLog = async (id: string) => {
    await dbDeleteLog(db, id);
    await refresh();
  };

  const editLog = async (id: string, title: string, body: string, category: LogEntry['category']) => {
    await dbUpdateLog(db, id, title, body, category);
    await refresh();
  };

  return (
    <LogsContext.Provider value={{ logs, addLog, addLogsFromUrl, removeLog, editLog, refresh }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error('LogsProvider missing');
  return ctx;
}
