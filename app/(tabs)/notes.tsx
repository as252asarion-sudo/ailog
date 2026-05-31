import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../../lib/dummy';
import { useNotes } from '../../lib/notes_store';
import { C } from '../../lib/colors';
import type { Note } from '../../lib/notes_db';

function NoteCard({ item }: { item: Note }) {
  const router = useRouter();
  const color = CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] ?? C.steel;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/note-detail', params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name="book-outline" size={20} color={color} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.tag, { backgroundColor: color + '18' }]}>
            <Text style={[styles.tagText, { color }]}>{item.category}</Text>
          </View>
          <Text style={styles.cardDate}>更新 {item.updatedAt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const { notes, synthesize } = useNotes();
  const [modalVisible, setModalVisible] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);

  const handleCreate = async (category: string) => {
    setModalVisible(false);
    setSynthesizing(true);
    try {
      await synthesize(category);
    } catch (e: any) {
      Alert.alert('エラー', e?.message ?? '作成に失敗しました');
    } finally {
      setSynthesizing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ノート</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.createBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color={C.canvas} />
          <Text style={styles.createBtnText}>作る</Text>
        </TouchableOpacity>
      </View>

      {synthesizing && (
        <View style={styles.synthBanner}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={styles.synthText}>AIがノートを再構成中...</Text>
        </View>
      )}

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteCard item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="book-outline" size={40} color={C.muted} />
            <Text style={styles.empty}>ノートがまだありません{'\n'}「作る」からカテゴリを選んで{'\n'}ノートを生成してみましょう</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>カテゴリを選択</Text>
            <Text style={styles.sheetSub}>そのカテゴリの全ログをまとめてノートを作ります</Text>
            {CATEGORIES.map((cat) => {
              const color = CATEGORY_COLORS[cat];
              const icon = CATEGORY_ICONS[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={styles.catRow}
                  onPress={() => handleCreate(cat)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.catIcon, { backgroundColor: color + '18' }]}>
                    <Ionicons name={icon as any} size={18} color={color} />
                  </View>
                  <Text style={styles.catLabel}>{cat}</Text>
                  <Ionicons name="chevron-forward" size={16} color={C.stone} />
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.canvas },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.hairline,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: C.charcoal },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  createBtnText: { color: C.canvas, fontSize: 13, fontWeight: '600' },
  synthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#eeeaf8',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  synthText: { fontSize: 13, color: C.primary },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: C.charcoal },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 11, fontWeight: '600' },
  cardDate: { fontSize: 11, color: C.stone },
  separator: { height: 16 },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 12 },
  empty: { textAlign: 'center', color: C.stone, fontSize: 14, lineHeight: 22 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.canvas,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 4,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: C.charcoal, marginBottom: 4 },
  sheetSub: { fontSize: 13, color: C.slate, marginBottom: 16 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.hairline,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: { flex: 1, fontSize: 15, color: C.charcoal, fontWeight: '500' },
});
