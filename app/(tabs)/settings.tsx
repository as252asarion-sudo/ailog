import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ACCENT_COLORS, type ColorScheme } from '../../lib/theme_store';

const APP_VERSION = '1.0.2';
const CONTACT_EMAIL = 'as252asarion@gmail.com';

const SCHEME_OPTIONS: { label: string; value: ColorScheme; icon: string }[] = [
  { label: 'システム', value: 'system', icon: 'phone-portrait-outline' },
  { label: 'ライト',   value: 'light',  icon: 'sunny-outline' },
  { label: 'ダーク',   value: 'dark',   icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, accent, setAccent, colorScheme, setColorScheme } = useTheme();
  const [colorOpen, setColorOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: colors.canvas, borderBottomColor: colors.hairline }]}>
        <Text style={[styles.headerTitle, { color: colors.charcoal }]}>設定</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.stone }]}>外観</Text>
        <View style={[styles.card, { backgroundColor: colors.canvas, borderColor: colors.hairline }]}>

          {/* テーマ */}
          <TouchableOpacity style={styles.row} onPress={() => setThemeOpen(v => !v)} activeOpacity={0.7}>
            <Ionicons name="contrast-outline" size={20} color={colors.slate} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.charcoal }]}>テーマ</Text>
            <Text style={[styles.rowValue, { color: colors.stone }]}>{SCHEME_OPTIONS.find(o => o.value === colorScheme)?.label}</Text>
            <Ionicons name={themeOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.stone} />
          </TouchableOpacity>
          {themeOpen && (
            <View style={[styles.schemeRow, { backgroundColor: colors.surface, borderTopColor: colors.hairline }]}>
              {SCHEME_OPTIONS.map((opt) => {
                const active = colorScheme === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.schemeBtn, active && { backgroundColor: accent }]}
                    onPress={() => { setColorScheme(opt.value); setThemeOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={opt.icon as any} size={16} color={active ? '#fff' : colors.slate} />
                    <Text style={[styles.schemeBtnText, { color: active ? '#fff' : colors.slate }]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.hairline }]} />

          {/* アクセントカラー */}
          <TouchableOpacity style={styles.row} onPress={() => setColorOpen(v => !v)} activeOpacity={0.7}>
            <Ionicons name="color-palette-outline" size={20} color={colors.slate} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.charcoal }]}>アクセントカラー</Text>
            <View style={[styles.accentPreview, { backgroundColor: accent }]} />
            <Ionicons name={colorOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.stone} />
          </TouchableOpacity>
          {colorOpen && (
            <View style={[styles.swatches, { borderTopWidth: 1, borderTopColor: colors.hairline }]}>
              {ACCENT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.swatch, { backgroundColor: c.value }, accent === c.value && styles.swatchActive]}
                  onPress={() => setAccent(c.value)}
                  activeOpacity={0.8}
                >
                  {accent === c.value && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.stone }]}>アプリ情報</Text>
        <View style={[styles.card, { backgroundColor: colors.canvas, borderColor: colors.hairline }]}>
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={20} color={colors.slate} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.charcoal }]}>バージョン</Text>
            <Text style={[styles.rowValue, { color: colors.stone }]}>{APP_VERSION}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.hairline, marginLeft: 48 }]} />
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} activeOpacity={0.7}>
            <Ionicons name="mail-outline" size={20} color={colors.slate} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.charcoal }]}>お問い合わせ</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.stone} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowIcon: { marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15 },
  rowValue: { fontSize: 15, marginRight: 8 },
  divider: { height: 1 },
  schemeRow: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1 },
  schemeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8 },
  schemeBtnText: { fontSize: 13, fontWeight: '500' },
  accentPreview: { width: 20, height: 20, borderRadius: 10, marginRight: 8 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  swatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  swatchActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
});
