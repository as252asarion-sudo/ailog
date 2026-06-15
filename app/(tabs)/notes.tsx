import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS } from '../../lib/dummy';
import { useNotes } from '../../lib/notes_store';
import { useTheme } from '../../lib/theme_store';
import type { Note } from '../../lib/notes_db';

function NoteCard({ item }: { item: Note }) {
  const router = useRouter();
  const { colors } = useTheme();
  const color = CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] ?? colors.steel;

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
        <Text style={[styles.cardTitle, { color: colors.charcoal }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.tag, { backgroundColor: color + '18' }]}>
            <Text style={[styles.tagText, { color }]}>{item.category}</Text>
          </View>
          <Text style={[styles.cardDate, { color: colors.stone }]}>更新 {item.updatedAt}</Text>
        </View>
        {item.logIds.length > 0 && (
          <Text style={[styles.logCount, { color: colors.stone }]}>{item.logIds.length}件のログから生成</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes } = useNotes();
  const { colors, accent } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.hairline }]}>
        <Text style={[styles.headerTitle, { color: colors.charcoal }]}>ノート</Text>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteCard item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="book-outline" size={40} color={colors.muted} />
            <Text style={[styles.empty, { color: colors.stone }]}>ノートがまだありません{'\n'}「作る」からログを選んで{'\n'}ノートを生成してみましょう</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: accent, shadowColor: accent }]}
        onPress={() => router.push('/log-select')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>作る</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 11, fontWeight: '600' },
  cardDate: { fontSize: 11 },
  logCount: { fontSize: 11 },
  separator: { height: 16 },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 12 },
  empty: { textAlign: 'center', fontSize: 14, lineHeight: 22 },
});
