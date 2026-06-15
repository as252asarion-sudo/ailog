import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS } from '../lib/dummy';
import { useNotes } from '../lib/notes_store';
import { useTheme } from '../lib/theme_store';

// **text** を bold spans に変換
function InlineText({ text, style }: { text: string; style: any }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return <Text style={style}>{text}</Text>;
  return (
    <Text style={style}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <Text key={i} style={{ fontWeight: '700' }}>{p.slice(2, -2)}</Text>
          : p
      )}
    </Text>
  );
}

function NoteBody({ body }: { body: string }) {
  const { colors, accent } = useTheme();
  return (
    <View style={styles.bodyWrap}>
      {body.split('\n').map((line, i) => {
        if (line.startsWith('### ')) {
          return <Text key={i} style={[styles.subheading, { color: colors.charcoal }]}>{line.slice(4)}</Text>;
        }
        if (line.startsWith('## ')) {
          return <Text key={i} style={[styles.heading, { color: colors.charcoal, borderLeftColor: accent }]}>{line.slice(3)}</Text>;
        }
        // 行全体が **...** → 小見出し扱い
        if (/^\*\*.+\*\*$/.test(line.trim())) {
          return <Text key={i} style={[styles.subheading, { color: colors.charcoal }]}>{line.trim().slice(2, -2)}</Text>;
        }
        if (line.startsWith('- ')) {
          return (
            <View key={i} style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: colors.slate }]}>•</Text>
              <InlineText text={line.slice(2)} style={[styles.bulletText, { color: colors.slate }]} />
            </View>
          );
        }
        if (line.trim() === '') {
          return <View key={i} style={styles.spacer} />;
        }
        return <InlineText key={i} text={line} style={[styles.bodyText, { color: colors.charcoal }]} />;
      })}
    </View>
  );
}

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notes, synthesizeFromLogs, removeNote } = useNotes();
  const { colors, accent } = useTheme();
  const note = notes.find((n) => n.id === id);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!note) return;
    if (!note.logIds.length) {
      Alert.alert('再構成できません', 'このノートには元のログ情報が保存されていません');
      return;
    }
    setUpdating(true);
    try {
      await synthesizeFromLogs(note.logIds, { title: note.title, existingNoteId: note.id });
    } catch (e: any) {
      Alert.alert('エラー', e?.message ?? '更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('削除しますか？', undefined, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => { await removeNote(id!); router.back(); } },
    ]);
  };

  if (!note) return null;

  const color = CATEGORY_COLORS[note.category as keyof typeof CATEGORY_COLORS] ?? colors.steel;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.canvas }]}>
      <View style={[styles.header, { borderBottomColor: colors.hairline }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.charcoal }]}>ノート</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.charcoal }]}>{note.title}</Text>
        <View style={styles.meta}>
          <View style={[styles.tag, { backgroundColor: color + '18' }]}>
            <Text style={[styles.tagText, { color }]}>{note.category}</Text>
          </View>
          <Text style={[styles.date, { color: colors.stone }]}>更新 {note.updatedAt}</Text>
        </View>

        <NoteBody body={note.body} />

        <TouchableOpacity
          style={[styles.updateBtn, { backgroundColor: accent }, updating && { opacity: 0.6 }]}
          onPress={handleUpdate}
          disabled={updating}
          activeOpacity={0.85}
        >
          {updating
            ? <ActivityIndicator color={colors.canvas} size="small" />
            : <>
                <Ionicons name="refresh" size={16} color={colors.canvas} />
                <Text style={[styles.updateBtnText, { color: colors.canvas }]}>最新ログで再構成する</Text>
              </>
          }
        </TouchableOpacity>
        <Text style={[styles.updateHint, { color: colors.stone }]}>新しいログを追加した後に押すと、ノートが更新されます</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
  tagText: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13 },
  bodyWrap: { gap: 4, marginTop: 8 },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
    borderLeftWidth: 3,
    paddingLeft: 10,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 2,
    paddingLeft: 10,
  },
  bulletRow: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  bullet: { fontSize: 14, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 22 },
  spacer: { height: 6 },
  bodyText: { fontSize: 14, lineHeight: 22 },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    height: 48,
    marginTop: 24,
  },
  updateBtnText: { fontSize: 15, fontWeight: '600' },
  updateHint: { fontSize: 12, textAlign: 'center' },
});
