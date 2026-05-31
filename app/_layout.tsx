import { useEffect } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { initDb } from '../lib/db';
import { LogsProvider } from '../lib/store';
import { NotesProvider } from '../lib/notes_store';
import { C } from '../lib/colors';

function ShareIntentNavigator() {
  const { hasShareIntent } = useShareIntentContext();
  const router = useRouter();
  const navState = useRootNavigationState();
  useEffect(() => {
    if (!navState?.key) return;
    if (hasShareIntent) router.push('/(tabs)/new');
  }, [hasShareIntent, navState?.key]);
  return null;
}

export default function RootLayout() {
  return (
    <ShareIntentProvider>
      <SafeAreaProvider>
        <SQLiteProvider databaseName="ailog.db" onInit={initDb}>
          <LogsProvider>
            <NotesProvider>
              <ShareIntentNavigator />
              <Stack screenOptions={{ contentStyle: { backgroundColor: C.canvas } }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="detail" options={{ headerShown: false, presentation: 'card' }} />
                <Stack.Screen name="note-detail" options={{ headerShown: false, presentation: 'card' }} />
              </Stack>
            </NotesProvider>
          </LogsProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </ShareIntentProvider>
  );
}
