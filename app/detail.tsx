import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES } from '../lib/dummy';
import { useLogs } from '../lib/store';
import { C } from '../lib/colors';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logs, removeLog, editLog } = useLogs();
  const log = logs.find((l) => l.id === id);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editCategory, setEditCategory] = useState<(typeof CATEGORIES)[number]>('その他');
  const [saving, setSaving] = useState(false);

  if (!log) return null;

  const color = CATEGORY_COLORS[log.category];

  const handleStartEdit = () => {
    setEditTitle(log.title);
    setEditBody(log.body);
    setEditCategory(log.category);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!editTitle.trim() && !editBody.trim()) {
      Alert.alert('タイトルまたは本文を入力してください');
      return;
    }
    setSaving(true);
    try {
      await editLog(id!, editTitle.trim() || '無題', editBody, editCategory);
      setEditing(false);
    } catch {
      Alert.alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('削除しますか？', undefined, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => { await removeLog(id!); router.back(); } },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => editing ? handleCancelEdit() : router.back()} style={styles.headerBtn}>
          <Ionicons name={editing ? 'close' : 'arrow-back'} size={22} color={C.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AIログ</Text>
        {editing ? (
          <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={saving}>
            <Ionicons name="checkmark" size={24} color={saving ? C.stone : C.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleStartEdit} style={styles.headerBtn}>
              <Ionicons name="pencil-outline" size={20} color={C.charcoal} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
              <Ionicons name="trash-outline" size={20} color={C.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {editing ? (
          <>
            <TextInput
              style={styles.editTitle}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="タイトル"
              placeholderTextColor={C.stone}
            />
            <Text style={styles.sectionLabel}>カテゴリ</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => {
                const catColor = CATEGORY_COLORS[cat];
                const active = editCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, active && { backgroundColor: catColor }]}
                    onPress={() => setEditCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={CATEGORY_ICONS[cat] as any} size={12} color={active ? C.canvas : catColor} />
                    <Text style={[styles.catChipText, { color: active ? C.canvas : catColor }]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>本文</Text>
            <TextInput
              style={styles.editBody}
              value={editBody}
              onChangeText={setEditBody}
              placeholder="本文を入力..."
              placeholderTextColor={C.stone}
              multiline
              textAlignVertical="top"
            />
          </>
        ) : (
          <>
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
                {log.summary || 'まだ要約がありません'}
              </Text>
            </View>
            <Text style={styles.sectionLabel}>本文</Text>
            <Text style={styles.bodyText}>{log.body}</Text>
          </>
        )}
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
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: C.charcoal },
  headerActions: { flexDirection: 'row', gap: 4 },
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
  editTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.charcoal,
    borderWidth: 1,
    borderColor: C.hairlineStrong,
    borderRadius: 8,
    padding: 12,
    backgroundColor: C.canvas,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.hairlineStrong,
  },
  catChipText: { fontSize: 12, fontWeight: '600' },
  editBody: {
    fontSize: 14,
    color: C.charcoal,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: C.hairlineStrong,
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
    backgroundColor: C.canvas,
    marginTop: 8,
  },
});
