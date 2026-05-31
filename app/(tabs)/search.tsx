import { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, LogEntry, Category } from '../../lib/dummy';
import { useLogs } from '../../lib/store';
import { C } from '../../lib/colors';

function LogRow({ item }: { item: LogEntry }) {
  const router = useRouter();
  const color = CATEGORY_COLORS[item.category];
  const iconName = CATEGORY_ICONS[item.category];

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={iconName as any} size={18} color={color} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowPreview} numberOfLines={1}>{item.summary}</Text>
        <View style={[styles.tag, { backgroundColor: color + '18' }]}>
          <Text style={[styles.tagText, { color }]}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { logs } = useLogs();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Category | null>(null);

  const filtered = useMemo(() => logs.filter((log) => {
    const matchCat = selected ? log.category === selected : true;
    const matchQ = query ? log.title.includes(query) || log.body.includes(query) || log.summary.includes(query) : true;
    return matchCat && matchQ;
  }), [logs, query, selected]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AIログ</Text>
      </View>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={C.stone} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="キーワードで検索"
          placeholderTextColor={C.stone}
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={styles.chipsInner}>
        <TouchableOpacity
          style={[styles.chip, !selected && styles.chipActive]}
          onPress={() => setSelected(null)}
        >
          <Text style={[styles.chipText, !selected && styles.chipTextActive]}>すべて</Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selected === cat && styles.chipActive]}
            onPress={() => setSelected(selected === cat ? null : cat)}
          >
            <Text style={[styles.chipText, selected === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogRow item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>該当するログがありません</Text>}
      />
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: C.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.hairline,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: C.charcoal },
  chips: { maxHeight: 44 },
  chipsInner: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  chipActive: { backgroundColor: C.charcoal, borderColor: C.charcoal },
  chipText: { fontSize: 13, color: C.steel, fontWeight: '500' },
  chipTextActive: { color: C.canvas },
  list: { padding: 16 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: C.charcoal },
  rowPreview: { fontSize: 13, color: C.slate },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  tagText: { fontSize: 11, fontWeight: '600' },
  separator: { height: 16 },
  empty: { textAlign: 'center', color: C.stone, marginTop: 40, fontSize: 14 },
});
