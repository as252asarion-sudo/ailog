import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { initDb } from '../lib/db';
import { LogsProvider } from '../lib/store';
import { NotesProvider } from '../lib/notes_store';
import { C } from '../lib/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="ailog.db" onInit={initDb}>
        <LogsProvider>
          <NotesProvider>
            <Stack screenOptions={{ contentStyle: { backgroundColor: C.canvas } }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="detail" options={{ headerShown: false, presentation: 'card' }} />
              <Stack.Screen name="note-detail" options={{ headerShown: false, presentation: 'card' }} />
            </Stack>
          </NotesProvider>
        </LogsProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
