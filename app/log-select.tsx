import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS, CATEGORY_ICONS, type LogEntry } from '../lib/dummy';
import { useLogs } from '../lib/store';
import { useNotes } from '../lib/notes_store';
import { C } from '../lib/colors';

function LogRow({ item, selected, onToggle }: { item: LogEntry; selected: boolean; onToggle: () => void }) {
  const color = CATEGORY_COLORS[item.category];
  return (
    <TouchableOpacity style={styles.row} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.check, selected && styles.checkActive]}>
        {selected && <Ionicons name="checkmark" size={14} color={C.canvas} />}
      </View>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={CATEGORY_ICONS[item.category] as any} size={18} color={color} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.rowMeta}>
          <Text style={[styles.rowCat, { color }]}>{item.category}</Text>
          <Text style={styles.rowDate}>{item.createdAt}</Text>
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

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [noteTitle, setNoteTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} disabled={creating}>
          <Ionicons name="arrow-back" size={22} color={C.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ログを選択</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.titleWrap}>
        <TextInput
          style={styles.titleInput}
          placeholder="ノートのタイトル（省略可・AIが自動生成）"
          placeholderTextColor={C.stone}
          value={noteTitle}
          onChangeText={setNoteTitle}
        />
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LogRow item={item} selected={selected.has(item.id)} onToggle={() => toggle(item.id)} />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>ログがありません</Text>}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.createBtn, (!selected.size || creating) && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={!selected.size || creating}
          activeOpacity={0.85}
        >
          {creating ? (
            <>
              <ActivityIndicator color={C.canvas} size="small" />
              <Text style={styles.createBtnText}>AIが作成中...</Text>
            </>
          ) : (
            <Text style={styles.createBtnText}>
              {selected.size > 0 ? `${selected.size}件のログでノートを作成` : 'ログを選択してください'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.hairline,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: C.charcoal },
  titleWrap: { padding: 16, borderBottomWidth: 1, borderBottomColor: C.hairline },
  titleInput: {
    borderWidth: 1,
    borderColor: C.hairlineStrong,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: C.charcoal,
    backgroundColor: C.canvas,
  },
  list: { padding: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 2 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkActive: { backgroundColor: C.primary, borderColor: C.primary },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: C.charcoal },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowCat: { fontSize: 11, fontWeight: '600' },
  rowDate: { fontSize: 11, color: C.stone },
  separator: { height: 14 },
  empty: { textAlign: 'center', color: C.stone, marginTop: 60, fontSize: 14 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.hairline,
    backgroundColor: C.canvas,
  },
  createBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createBtnDisabled: { backgroundColor: C.muted },
  createBtnText: { color: C.canvas, fontSize: 15, fontWeight: '600' },
});
