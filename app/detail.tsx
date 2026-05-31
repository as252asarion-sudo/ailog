import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS } from '../lib/dummy';
import { useLogs } from '../lib/store';
import { C } from '../lib/colors';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logs, removeLog } = useLogs();
  const log = logs.find((l) => l.id === id);

  const handleDelete = () => {
    Alert.alert('削除しますか？', undefined, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => { await removeLog(id!); router.back(); } },
    ]);
  };

  if (!log) return null;

  const color = CATEGORY_COLORS[log.category];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AIログ</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.backBtn}>
          <Ionicons name="trash-outline" size={20} color={C.error} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{log.title}</Text>
        <View style={styles.meta}>
          <View style={[styles.tag, { backgroundColor: color + '18' }]}>
            <Text style={[styles.tagText, { color }]}>{log.category}</Text>
          </View>
          <Text style={styles.date}>{log.createdAt}</Text>
        </View>
        <View style={styles.summaryBox}>
          <View style={styles.summaryHeader}>
            <Ionicons name="sparkles" size={14} color={C.primary} />
            <Text style={styles.summaryLabel}>AI要約</Text>
          </View>
          <Text style={[styles.summaryText, !log.summary && { color: C.stone, fontStyle: 'italic' }]}>
            {log.summary || 'まだ要約がありません（近日実装予定）'}
          </Text>
        </View>
        <Text style={styles.sectionLabel}>本文</Text>
        <Text style={styles.bodyText}>{log.body}</Text>
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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: C.charcoal },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: C.charcoal, lineHeight: 30 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
  tagText: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13, color: C.stone },
  summaryBox: {
    backgroundColor: '#eeeaf8',
    borderRadius: 10,
    padding: 16,
    gap: 8,
    marginTop: 4,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryLabel: { fontSize: 13, fontWeight: '600', color: C.primary },
  summaryText: { fontSize: 14, color: C.slate, lineHeight: 22 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: C.charcoal, marginTop: 8 },
  bodyText: { fontSize: 14, color: C.charcoal, lineHeight: 22 },
});
