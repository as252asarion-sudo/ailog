import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useLogs } from '../../lib/store';
import { useTheme } from '../../lib/theme_store';

export default function NewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addLog } = useLogs();
  const { sharedText } = useLocalSearchParams<{ sharedText?: string }>();
  const { colors, accent } = useTheme();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [clipboardLoaded, setClipboardLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sharedText) {
      setBody(sharedText);
      setClipboardLoaded(false);
    }
  }, [sharedText]);

  useFocusEffect(
    useCallback(() => {
      if (sharedText) return;
      setClipboardLoaded(false);
      Clipboard.getStringAsync().then((text) => {
        if (text && text.trim().length > 0) {
          setBody(text.trim());
          setClipboardLoaded(true);
        }
      });
    }, [sharedText])
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

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.hairline }]}>
        <Text style={[styles.headerTitle, { color: colors.charcoal }]}>AIログ</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {clipboardLoaded && (
          <View style={[styles.clipboardBanner, { backgroundColor: colors.surface }]}>
            <Ionicons name="clipboard-outline" size={14} color={colors.slate} />
            <Text style={[styles.clipboardText, { color: colors.slate }]}>クリップボードから読み込みました</Text>
          </View>
        )}
        <Text style={[styles.label, { color: colors.charcoal }]}>タイトル</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.hairlineStrong, color: colors.charcoal, backgroundColor: colors.canvas }]}
          placeholder="タイトル（省略可・AIが自動生成）"
          placeholderTextColor={colors.stone}
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.appShortcuts}>
          {[
            { name: 'ChatGPT', pkg: 'com.openai.chatgpt', cls: 'com.openai.chatgpt.MainActivity', web: 'https://chat.openai.com', color: '#10A37F', label: 'GPT' },
            { name: 'Claude', pkg: 'com.anthropic.claude', cls: 'com.anthropic.claude.MainActivity', web: 'https://claude.ai', color: '#D4621E', label: 'Cl' },
            { name: 'Gemini', pkg: 'com.google.android.apps.bard', cls: 'com.google.android.apps.bard.shellapp.BardEntryPointActivity', web: 'https://gemini.google.com', color: '#4285F4', label: 'G' },
          ].map((app) => (
            <TouchableOpacity key={app.name} style={styles.appBtn} onPress={() => IntentLauncher.startActivityAsync('android.intent.action.MAIN', { packageName: app.pkg, className: app.cls, flags: 0x10000000 }).catch(() => Linking.openURL(app.web))} activeOpacity={0.7}>
              <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                <Text style={styles.appIconLabel}>{app.label}</Text>
              </View>
              <Text style={[styles.appName, { color: colors.slate }]}>{app.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.charcoal }]}>テキストを貼り付け</Text>
          {body.length > 0 && (
            <TouchableOpacity onPress={() => { setBody(''); setClipboardLoaded(false); }} hitSlop={8} style={[styles.clearBtn, { backgroundColor: colors.surface }]}>
              <Text style={[styles.clearBtnText, { color: colors.slate }]}>クリア</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={[styles.input, styles.textarea, { borderColor: colors.hairlineStrong, color: colors.charcoal, backgroundColor: colors.canvas }]}
          placeholder="ここにテキストを貼り付けてください..."
          placeholderTextColor={colors.stone}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />
        <View style={[styles.aiNotice, { backgroundColor: accent + '18' }]}>
          <Ionicons name="sparkles" size={14} color={accent} />
          <Text style={[styles.aiNoticeText, { color: accent }]}>AIが内容を解析し、最適なカテゴリを自動で設定します。</Text>
        </View>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accent }, saving && { opacity: 0.6 }]} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>保存する</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  clearBtnText: { fontSize: 12, fontWeight: '500' },
  label: { fontSize: 14, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15, marginTop: 8 },
  textarea: { height: 200, paddingTop: 12 },
  aiNotice: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, padding: 12, marginTop: 8 },
  aiNoticeText: { fontSize: 13, flex: 1, lineHeight: 18 },
  clipboardBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, padding: 10, marginBottom: 4 },
  clipboardText: { fontSize: 12 },
  saveBtn: { borderRadius: 8, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  appShortcuts: { flexDirection: 'row', gap: 16, marginTop: 16, marginBottom: 4 },
  appBtn: { alignItems: 'center', gap: 4 },
  appIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  appIconLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  appName: { fontSize: 11 },
});
