import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../lib/colors';

const APP_VERSION = '1.0.0';
const CONTACT_EMAIL = 'as252asarion@gmail.com';

function SettingRow({ icon, label, value, onPress }: { icon: string; label: string; value?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Ionicons name={icon as any} size={20} color={C.slate} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color={C.stone} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AIログ</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アプリ情報</Text>
        <View style={styles.card}>
          <SettingRow icon="information-circle-outline" label="バージョン" value={APP_VERSION} />
          <View style={styles.divider} />
          <SettingRow
            icon="mail-outline"
            label="お問い合わせ"
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surface },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.canvas,
    borderBottomWidth: 1,
    borderBottomColor: C.hairline,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: C.charcoal },
  section: { padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: C.stone, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  card: {
    backgroundColor: C.canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.hairline,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15, color: C.charcoal },
  rowValue: { fontSize: 15, color: C.stone, marginRight: 8 },
  divider: { height: 1, backgroundColor: C.hairline, marginLeft: 48 },
});
