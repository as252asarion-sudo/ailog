import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useLogs } from '../../lib/store';
import { C } from '../../lib/colors';

type Mode = 'text' | 'url';

export default function NewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addLog, addLogsFromUrl } = useLogs();
  const { sharedText } = useLocalSearchParams<{ sharedText?: string }>();
  const [mode, setMode] = useState<Mode>('text');

  // テキストモード
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [clipboardLoaded, setClipboardLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // URLモード
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (sharedText) {
      setMode('text');
      setBody(sharedText);
      setClipboardLoaded(false);
    }
  }, [sharedText]);

  useFocusEffect(
    useCallback(() => {
      if (mode !== 'text' || sharedText) return;
      setClipboardLoaded(false);
      Clipboard.getStringAsync().then((text) => {
        if (text && text.trim().length > 0) {
          setBody(text.trim());
          setClipboardLoaded(true);
        }
      });
    }, [mode, hasShareIntent])
  );

  const handleSave = async () => {
    if (!body.trim()) {
      Alert.alert('テキストを入力してください');
      return;
    }
    setSaving(true);
    try {
      await addLog(title, body);
      setTitle('');
      setBody('');
      router.navigate('/(tabs)/');
    } catch {
      Alert.alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async () => {
    if (!url.trim()) {
      Alert.alert('URLを入力してください');
      return;
    }
    setImporting(true);
    try {
      const count = await addLogsFromUrl(url.trim());
      setUrl('');
      Alert.alert('取り込み完了', `${count}件のログを保存しました`, [
        { text: 'OK', onPress: () => router.navigate('/(tabs)/') },
      ]);
    } catch (e: any) {
      Alert.alert('取り込み失敗', e?.message ?? 'エラーが発生しました');
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AIログ</Text>
      </View>

      <View style={styles.modeSwitch}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'text' && styles.modeBtnActive]}
          onPress={() => setMode('text')}
          activeOpacity={0.7}
        >
          <Ionicons name="clipboard-outline" size={14} color={mode === 'text' ? C.canvas : C.slate} />
          <Text style={[styles.modeBtnText, mode === 'text' && styles.modeBtnTextActive]}>テキスト貼り付け</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'url' && styles.modeBtnActive]}
          onPress={() => setMode('url')}
          activeOpacity={0.7}
        >
          <Ionicons name="link-outline" size={14} color={mode === 'url' ? C.canvas : C.slate} />
          <Text style={[styles.modeBtnText, mode === 'url' && styles.modeBtnTextActive]}>Gemini共有URL</Text>
        </TouchableOpacity>
      </View>

      {mode === 'text' ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {clipboardLoaded && (
            <View style={styles.clipboardBanner}>
              <Ionicons name="clipboard-outline" size={14} color={C.slate} />
              <Text style={styles.clipboardText}>クリップボードから読み込みました</Text>
            </View>
          )}
          <Text style={styles.label}>タイトル</Text>
          <TextInput
            style={styles.input}
            placeholder="タイトルを入力してください"
            placeholderTextColor={C.stone}
            value={title}
            onChangeText={setTitle}
          />
          <Text style={[styles.label, { marginTop: 20 }]}>テキストを貼り付け</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="ここにテキストを貼り付けてください..."
            placeholderTextColor={C.stone}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.aiNotice}>
            <Ionicons name="sparkles" size={14} color={C.primary} />
            <Text style={styles.aiNoticeText}>AIが内容を解析し、最適なカテゴリを自動で設定します。</Text>
          </View>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
            {saving ? <ActivityIndicator color={C.canvas} /> : <Text style={styles.saveBtnText}>保存する</Text>}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.geminiInfo}>
            <Ionicons name="information-circle-outline" size={16} color={C.primary} />
            <Text style={styles.geminiInfoText}>Geminiの会話を共有リンクからまとめて取り込めます。会話内の全ターンを自動でログに保存します。</Text>
          </View>
          <Text style={styles.label}>Gemini共有リンク</Text>
          <TextInput
            style={styles.input}
            placeholder="https://gemini.google.com/share/..."
            placeholderTextColor={C.stone}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <TouchableOpacity style={[styles.saveBtn, importing && { opacity: 0.6 }]} onPress={handleImport} activeOpacity={0.85} disabled={importing}>
            {importing
              ? <><ActivityIndicator color={C.canvas} /><Text style={[styles.saveBtnText, { marginLeft: 8 }]}>取り込み中...</Text></>
              : <Text style={styles.saveBtnText}>取り込む</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvas },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.hairline,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: C.charcoal },
  modeSwitch: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeBtnActive: { backgroundColor: C.primary },
  modeBtnText: { fontSize: 12, fontWeight: '500', color: C.slate },
  modeBtnTextActive: { color: C.canvas },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 8 },
  label: { fontSize: 14, fontWeight: '500', color: C.charcoal },
  input: {
    borderWidth: 1,
    borderColor: C.hairlineStrong,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: C.charcoal,
    backgroundColor: C.canvas,
    marginTop: 8,
  },
  textarea: { height: 200, paddingTop: 12 },
  aiNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eeeaf8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  aiNoticeText: { fontSize: 13, color: C.primary, flex: 1, lineHeight: 18 },
  clipboardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  clipboardText: { fontSize: 12, color: C.slate },
  saveBtn: {
    backgroundColor: C.primary,
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveBtnText: { color: C.canvas, fontSize: 15, fontWeight: '600' },
  geminiInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#eeeaf8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  geminiInfoText: { flex: 1, fontSize: 13, color: C.primary, lineHeight: 18 },
});
