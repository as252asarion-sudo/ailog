import type { Category } from './dummy';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://www.furipare.com';

export type AiResult = {
  title: string;
  summary: string;
  category: Category;
};

export async function analyzeText(body: string): Promise<AiResult> {
  const res = await fetch(`${BASE_URL}/api/ailog/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(`AI解析失敗: ${res.status}`);
  return res.json();
}

export type GeminiConversation = { question: string; answer: string };

export async function fetchFromUrl(url: string): Promise<GeminiConversation[]> {
  const res = await fetch(`${BASE_URL}/api/ailog/fetch-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  if (data.type === 'unsupported') throw new Error(data.message);
  if (data.type === 'gemini') return data.conversations as GeminiConversation[];
  throw new Error('対応していないURLです');
}

export type SelectLogsResult = {
  logIds: string[];
  title?: string;
};

export async function selectLogsByPrompt(
  prompt: string,
  logs: Array<{ id: string; title: string; summary: string; category: string }>,
): Promise<SelectLogsResult> {
  const res = await fetch(`${BASE_URL}/api/ailog/select-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, logs }),
  });
  if (!res.ok) throw new Error(`ログ選択失敗: ${res.status}`);
  return res.json();
}

export type SynthesizeResult = {
  title: string;
  body: string;
};

export async function synthesizeLogs(
  logs: Array<{ title: string; summary: string; body: string }>,
  category: string,
): Promise<SynthesizeResult> {
  const res = await fetch(`${BASE_URL}/api/ailog/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logs, category }),
  });
  if (!res.ok) throw new Error(`合成失敗: ${res.status}`);
  return res.json();
}
