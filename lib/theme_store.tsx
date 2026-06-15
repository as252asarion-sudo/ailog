import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getSetting, setSetting } from './db';
import { LIGHT, DARK, type Colors } from './colors';

export const ACCENT_COLORS = [
  { label: 'インディゴ', value: '#5645d4' },
  { label: 'パープル',   value: '#7b3ff2' },
  { label: 'ブルー',     value: '#0075de' },
  { label: 'ティール',   value: '#1a7fa8' },
  { label: 'グリーン',   value: '#1aae39' },
  { label: 'オレンジ',   value: '#dd5b00' },
  { label: 'レッド',     value: '#e03131' },
  { label: 'ピンク',     value: '#c2185b' },
];

export type ColorScheme = 'system' | 'light' | 'dark';

const DEFAULT_ACCENT = '#5645d4';
const DEFAULT_SCHEME: ColorScheme = 'system';

type ThemeCtx = {
  accent: string;
  setAccent: (color: string) => Promise<void>;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  colors: Colors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeCtx>({
  accent: DEFAULT_ACCENT,
  setAccent: async () => {},
  colorScheme: DEFAULT_SCHEME,
  setColorScheme: async () => {},
  colors: LIGHT,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const systemScheme = useColorScheme();
  const [accent, setAccentState] = useState(DEFAULT_ACCENT);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(DEFAULT_SCHEME);

  useEffect(() => {
    Promise.all([
      getSetting(db, 'accent_color', DEFAULT_ACCENT),
      getSetting(db, 'color_scheme', DEFAULT_SCHEME),
    ]).then(([a, s]) => {
      setAccentState(a);
      setColorSchemeState(s as ColorScheme);
    });
  }, []);

  const setAccent = async (color: string) => {
    setAccentState(color);
    await setSetting(db, 'accent_color', color);
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    await setSetting(db, 'color_scheme', scheme);
  };

  const isDark =
    colorScheme === 'dark' ||
    (colorScheme === 'system' && systemScheme === 'dark');

  const colors: Colors = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ accent, setAccent, colorScheme, setColorScheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
