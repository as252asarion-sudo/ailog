import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_ICONS, CATEGORY_COLORS, LogEntry } from '../../lib/dummy';
import { useLogs } from '../../lib/store';
import { C } from '../../lib/colors';

function LogCard({ item }: { item: LogEntry }) {
  const router = useRouter();
  const iconName = CATEGORY_ICONS[item.category];
  const color = CATEGORY_COLORS[item.category];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={iconName as any} size={20} color={color} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardPreview} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.tag, { backgroundColor: color + '18' }]}>
            <Text style={[styles.tagText, { color }]}>{item.category}</Text>
          </View>
          <Text style={styles.cardDate}>{item.createdAt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { logs } = useLogs();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AIログ</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={22} color={C.charcoal} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogCard item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>まだログがありません{'\n'}テキストを貼り付けて保存してみましょう</Text>}
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
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
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
  cardPreview: { fontSize: 13, color: C.slate, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: { fontSize: 11, fontWeight: '600' },
  cardDate: { fontSize: 11, color: C.stone },
  separator: { height: 16 },
  empty: { textAlign: 'center', color: C.stone, marginTop: 60, fontSize: 14, lineHeight: 22 },
});
