import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS } from '../lib/dummy';
import { useNotes } from '../lib/notes_store';
import { C } from '../lib/colors';

function NoteBody({ body }: { body: string }) {
  return (
    <View style={styles.bodyWrap}>
      {body.split('\n').map((line, i) => {
        if (line.startsWith('### ')) {
          return <Text key={i} style={styles.subheading}>{line.slice(4)}</Text>;
        }
        if (line.startsWith('## ')) {
          return <Text key={i} style={styles.heading}>{line.slice(3)}</Text>;
        }
        if (line.startsWith('- ')) {
          return (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{line.slice(2)}</Text>
            </View>
          );
        }
        if (line.trim() === '') {
          return <View key={i} style={styles.spacer} />;
        }
        return <Text key={i} style={styles.bodyText}>{line}</Text>;
      })}
    </View>
  );
}

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notes, synthesize, removeNote } = useNotes();
  const note = notes.find((n) => n.id === id);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!note) return;
    setUpdating(true);
    try {
      await synthesize(note.category);
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

  const color = CATEGORY_COLORS[note.category as keyof typeof CATEGORY_COLORS] ?? C.steel;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={C.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ノート</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={20} color={C.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{note.title}</Text>
        <View style={styles.meta}>
          <View style={[styles.tag, { backgroundColor: color + '18' }]}>
            <Text style={[styles.tagText, { color }]}>{note.category}</Text>
          </View>
          <Text style={styles.date}>更新 {note.updatedAt}</Text>
        </View>

        <NoteBody body={note.body} />

        <TouchableOpacity
          style={[styles.updateBtn, updating && { opacity: 0.6 }]}
          onPress={handleUpdate}
          disabled={updating}
          activeOpacity={0.85}
        >
          {updating
            ? <ActivityIndicator color={C.canvas} size="small" />
            : <>
                <Ionicons name="refresh" size={16} color={C.canvas} />
                <Text style={styles.updateBtnText}>最新ログで再構成する</Text>
              </>
          }
        </TouchableOpacity>
        <Text style={styles.updateHint}>新しいログを追加した後に押すと、ノートが更新されます</Text>
      </ScrollView>
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
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: C.charcoal, lineHeight: 30 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
  tagText: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13, color: C.stone },
  bodyWrap: { gap: 4, marginTop: 8 },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: C.charcoal,
    marginTop: 16,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    paddingLeft: 10,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    color: C.charcoal,
    marginTop: 10,
    marginBottom: 2,
    paddingLeft: 10,
  },
  bulletRow: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  bullet: { fontSize: 14, color: C.slate, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 14, color: C.slate, lineHeight: 22 },
  spacer: { height: 6 },
  bodyText: { fontSize: 14, color: C.charcoal, lineHeight: 22 },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 10,
    height: 48,
    marginTop: 24,
  },
  updateBtnText: { color: C.canvas, fontSize: 15, fontWeight: '600' },
  updateHint: { fontSize: 12, color: C.stone, textAlign: 'center' },
});
