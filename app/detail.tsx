import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES } from '../lib/dummy';
import { useLogs } from '../lib/store';
import { useTheme } from '../lib/theme_store';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logs, removeLog, editLog } = useLogs();
  const log = logs.find((l) => l.id === id);
  const { colors, accent } = useTheme();

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
    <View style={[styles.container, { backgroundColor: colors.canvas, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.hairline }]}>
        <TouchableOpacity onPress={() => editing ? setEditing(false) : router.back()} style={styles.headerBtn}>
          <Ionicons name={editing ? 'close' : 'arrow-back'} size={22} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.charcoal }]}>AIログ</Text>
        {editing ? (
          <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={saving}>
            <Ionicons name="checkmark" size={24} color={saving ? colors.stone : accent} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleStartEdit} style={styles.headerBtn}>
              <Ionicons name="pencil-outline" size={20} color={colors.charcoal} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {editing ? (
          <>
            <TextInput
              style={[styles.editTitle, { color: colors.charcoal, borderColor: colors.hairlineStrong, backgroundColor: colors.canvas }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="タイトル"
              placeholderTextColor={colors.stone}
            />
            <Text style={[styles.sectionLabel, { color: colors.charcoal }]}>カテゴリ</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => {
                const catColor = CATEGORY_COLORS[cat];
                const active = editCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, { borderColor: colors.hairlineStrong }, active && { backgroundColor: catColor, borderColor: catColor }]}
                    onPress={() => setEditCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={CATEGORY_ICONS[cat] as any} size={12} color={active ? '#fff' : catColor} />
                    <Text style={[styles.catChipText, { color: active ? '#fff' : catColor }]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.sectionLabel, { color: colors.charcoal, marginTop: 16 }]}>本文</Text>
            <TextInput
              style={[styles.editBody, { color: colors.charcoal, borderColor: colors.hairlineStrong, backgroundColor: colors.canvas }]}
              value={editBody}
              onChangeText={setEditBody}
              placeholder="本文を入力..."
              placeholderTextColor={colors.stone}
              multiline
              textAlignVertical="top"
            />
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.charcoal }]}>{log.title}</Text>
            <View style={styles.meta}>
              <View style={[styles.tag, { backgroundColor: color + '18' }]}>
                <Text style={[styles.tagText, { color }]}>{log.category}</Text>
              </View>
              <Text style={[styles.date, { color: colors.stone }]}>{log.createdAt}</Text>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: accent + '18' }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="sparkles" size={14} color={accent} />
                <Text style={[styles.summaryLabel, { color: accent }]}>AI要約</Text>
              </View>
              <Text style={[styles.summaryText, { color: colors.slate }, !log.summary && { color: colors.stone, fontStyle: 'italic' }]}>
                {log.summary || 'まだ要約がありません'}
              </Text>
            </View>
            <Text style={[styles.sectionLabel, { color: colors.charcoal }]}>本文</Text>
            <Text style={[styles.bodyText, { color: colors.charcoal }]}>{log.body}</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 4 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
  tagText: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13 },
  summaryBox: { borderRadius: 10, padding: 16, gap: 8, marginTop: 4 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryLabel: { fontSize: 13, fontWeight: '600' },
  summaryText: { fontSize: 14, lineHeight: 22 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  bodyText: { fontSize: 14, lineHeight: 22 },
  editTitle: { fontSize: 20, fontWeight: '700', borderWidth: 1, borderRadius: 8, padding: 12 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontSize: 12, fontWeight: '600' },
  editBody: { fontSize: 14, lineHeight: 22, borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 200, marginTop: 8 },
});
