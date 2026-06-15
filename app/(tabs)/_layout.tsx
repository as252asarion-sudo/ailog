import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme_store';

function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, accent } = useTheme();

  const tabs = [
    { name: 'index', label: 'ホーム', iconActive: 'home', iconInactive: 'home-outline' },
    { name: 'search', label: '検索', iconActive: 'search', iconInactive: 'search-outline' },
    { name: 'new', label: '新規保存', iconActive: 'add', iconInactive: 'add' },
    { name: 'notes', label: 'ノート', iconActive: 'book', iconInactive: 'book-outline' },
    { name: 'settings', label: '設定', iconActive: 'settings', iconInactive: 'settings-outline' },
  ];

  return (
    <View style={[styles.container, { height: 56 + insets.bottom, paddingBottom: insets.bottom, backgroundColor: colors.canvas, borderTopColor: colors.hairline }]}>
      {state.routes.map((route: any, index: number) => {
        const tab = tabs[index];
        const isFocused = state.index === index;
        const isCenter = tab.name === 'new';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCenter) {
          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={[styles.centerBtn, { backgroundColor: accent, shadowColor: accent }]} activeOpacity={0.85}>
              <Ionicons name="add" size={28} color={colors.canvas} />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.7}>
            <Ionicons
              name={(isFocused ? tab.iconActive : tab.iconInactive) as any}
              size={22}
              color={isFocused ? accent : colors.steel}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 56,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  centerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="new" />
      <Tabs.Screen name="notes" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
