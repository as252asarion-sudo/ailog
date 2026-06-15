import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS, CATEGORY_ICONS, type LogEntry } from '../lib/dummy';
import { useLogs } from '../lib/store';
import { useNotes } from '../lib/notes_store';
import { useTheme } from '../lib/theme_store';
import { selectLogsByPrompt } from '../lib/ai';

type Mode = 'manual' | 'ai';

function LogRow({ item, selected, onToggle }: { item: LogEntry; selected: boolean; onToggle: () => void }) {
  const { colors, accent } = useTheme();
  const color = CATEGORY_COLORS[item.category];
  return (
    <TouchableOpacity style={styles.row} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.check, { borderColor: colors.hairlineStrong }, selected && { backgroundColor: accent, borderColor: accent }]}>
        {selected && <Ionicons name="checkmark" size={14} color={colors.canvas} />}
      </View>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={CATEGORY_ICONS[item.category] as any} size={18} color={color} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: colors.charcoal }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.rowMeta}>
          <Text style={[styles.rowCat, { color }]}>{item.category}</Text>
          <Text style={[styles.rowDate, { color: colors.stone }]}>{item.createdAt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LogSelectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logs } = useLogs();
  const { synthesizeFromLogs } = useNotes();
  const { colors, accent } = useTheme();

  const [mode, setMode] = useState<Mode>('manual');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [noteTitle, setNoteTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // AIモード
  const [aiPrompt, setAiPrompt] = useState('');
  const [searching, setSearching] = useState(false);
  const [aiSearched, setAiSearched] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) return;
    setSearching(true);
    setAiSearched(false);
    try {
      const result = await selectLogsByPrompt(
        aiPrompt,
        logs.map(l => ({ id: l.id, title: l.title, summary: l.summary, category: l.category })),
      );
      setSelected(new Set(result.logIds));
      if (result.title) setNoteTitle(result.title);
      setAiSearched(true);
    } catch (e: any) {
      Alert.alert('エラー', e?.message ?? 'ログの選択に失敗しました');
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async () => {
    if (!selected.size) return;
    setCreating(true);
    try {
      const note = await synthesizeFromLogs([...selected], { title: noteTitle });
      router.replace({ pathname: '/note-detail', params: { id: note.id } });
    } catch (e: any) {
      Alert.alert('エラー', e?.message ?? 'ノートの作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  const filteredLogs = mode === 'ai' && aiSearched
    ? logs.filter(l => selected.has(l.id))
    : logs;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.canvas }]}>
      <View style={[styles.header, { borderBottomColor: colors.hairline }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} disabled={creating}>
          <Ionicons name="arrow-back" size={22} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.charcoal }]}>ノートを作る</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* モード切り替え */}
      <View style={[styles.modeSwitch, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'manual' && { backgroundColor: accent }]}
          onPress={() => { setMode('manual'); setAiSearched(false); }}
          activeOpacity={0.7}
        >
          <Ionicons name="list-outline" size={14} color={mode === 'manual' ? '#fff' : colors.slate} />
          <Text style={[styles.modeBtnText, { color: mode === 'manual' ? '#fff' : colors.slate }]}>手動で選ぶ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'ai' && { backgroundColor: accent }]}
          onPress={() => setMode('ai')}
          activeOpacity={0.7}
        >
          <Ionicons name="sparkles-outline" size={14} color={mode === 'ai' ? '#fff' : colors.slate} />
          <Text style={[styles.modeBtnText, { color: mode === 'ai' ? '#fff' : colors.slate }]}>AIにおまかせ</Text>
        </TouchableOpacity>
      </View>

      {/* AIプロンプト入力 */}
      {mode === 'ai' && (
        <View style={[styles.aiWrap, { borderBottomColor: colors.hairline }]}>
          <View style={[styles.aiInputRow, { borderColor: colors.hairlineStrong, backgroundColor: colors.canvas }]}>
            <TextInput
              style={[styles.aiInput, { color: colors.charcoal }]}
              placeholder="例：筋トレ系のノートを作って"
              placeholderTextColor={colors.stone}
              value={aiPrompt}
              onChangeText={setAiPrompt}
              onSubmitEditing={handleAiSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={handleAiSearch}
              disabled={searching || !aiPrompt.trim()}
              style={[styles.aiSearchBtn, { backgroundColor: accent }, (!aiPrompt.trim() || searching) && { opacity: 0.5 }]}
              activeOpacity={0.8}
            >
              {searching
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="search" size={18} color="#fff" />
              }
            </TouchableOpacity>
          </View>
          {aiSearched && (
            <Text style={[styles.aiResult, { color: colors.slate }]}>
              {selected.size}件のログを選択しました。確認・調整できます。
            </Text>
          )}
        </View>
      )}

      {/* タイトル入力 */}
      {(mode === 'manual' || aiSearched) && (
        <View style={[styles.titleWrap, { borderBottomColor: colors.hairline }]}>
          <TextInput
            style={[styles.titleInput, { borderColor: colors.hairlineStrong, color: colors.charcoal, backgroundColor: colors.canvas }]}
            placeholder="ノートのタイトル（省略可・AIが自動生成）"
            placeholderTextColor={colors.stone}
            value={noteTitle}
            onChangeText={setNoteTitle}
          />
        </View>
      )}

      {/* ログ一覧 */}
      {(mode === 'manual' || aiSearched) && (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LogRow item={item} selected={selected.has(item.id)} onToggle={() => toggle(item.id)} />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text style={[styles.empty, { color: colors.stone }]}>ログがありません</Text>}
        />
      )}

      {/* フッター */}
      {(mode === 'manual' || aiSearched) && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12, borderTopColor: colors.hairline, backgroundColor: colors.canvas }]}>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: accent }, (!selected.size || creating) && { backgroundColor: colors.muted }]}
            onPress={handleCreate}
            disabled={!selected.size || creating}
            activeOpacity={0.85}
          >
            {creating ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.createBtnText}>AIが作成中...</Text>
              </>
            ) : (
              <Text style={styles.createBtnText}>
                {selected.size > 0 ? `${selected.size}件のログでノートを作成` : 'ログを選択してください'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  modeSwitch: { flexDirection: 'row', margin: 16, borderRadius: 10, padding: 3, gap: 3 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 8 },
  modeBtnText: { fontSize: 13, fontWeight: '500' },
  aiWrap: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  aiInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  aiInput: { flex: 1, padding: 12, fontSize: 14 },
  aiSearchBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  aiResult: { fontSize: 12, marginTop: 8 },
  titleWrap: { padding: 16, borderBottomWidth: 1 },
  titleInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14 },
  list: { padding: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 2 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconWrap: { width: 38, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowCat: { fontSize: 11, fontWeight: '600' },
  rowDate: { fontSize: 11 },
  separator: { height: 14 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 14 },
  footer: { padding: 16, borderTopWidth: 1 },
  createBtn: { borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  createBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
