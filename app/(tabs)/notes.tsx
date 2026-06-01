import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS } from '../../lib/dummy';
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
        {item.logIds.length > 0 && (
          <Text style={styles.logCount}>{item.logIds.length}件のログから生成</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes } = useNotes();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ノート</Text>
        <TouchableOpacity
          onPress={() => router.push('/log-select')}
          style={styles.createBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={C.canvas} />
          <Text style={styles.createBtnText}>作る</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteCard item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="book-outline" size={40} color={C.muted} />
            <Text style={styles.empty}>ノートがまだありません{'\n'}「作る」からログを選んで{'\n'}ノートを生成してみましょう</Text>
          </View>
        }
      />
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
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: C.charcoal },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 11, fontWeight: '600' },
  cardDate: { fontSize: 11, color: C.stone },
  logCount: { fontSize: 11, color: C.stone },
  separator: { height: 16 },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 12 },
  empty: { textAlign: 'center', color: C.stone, fontSize: 14, lineHeight: 22 },
});
