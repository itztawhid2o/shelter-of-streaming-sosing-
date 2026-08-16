import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Glass } from './Glass';
import { BrandLockup } from './Logo';
import { colors, fonts } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import type { RootStackParamList } from '../lib/types';

const links: { label: string; action: (nav: NativeStackNavigationProp<RootStackParamList>) => void; match: string[] }[] = [
  { label: 'Home', action: (n) => n.navigate('MainTabs', { screen: 'Home' }), match: ['Home'] },
  { label: 'Movies', action: (n) => n.navigate('MoviesBrowse', undefined), match: ['MoviesBrowse'] },
  { label: 'TV Shows', action: (n) => n.navigate('TVBrowse', undefined), match: ['TVBrowse'] },
  { label: 'Categories', action: (n) => n.navigate('Categories'), match: ['Categories', 'Category'] },
  { label: 'My List', action: (n) => n.navigate('MainTabs', { screen: 'MyList' }), match: ['MyList'] },
];

export function TopBar({ current }: { current?: string }) {
  const { isDesktop, contentPad } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const name = current || route.name;

  if (!isDesktop) return null;

  return (
    <View style={[styles.wrap, { paddingHorizontal: contentPad }]} pointerEvents="box-none">
      <Glass heavy radius={18} style={styles.bar}>
        <Pressable onPress={() => nav.navigate('MainTabs', { screen: 'Home' })}>
          <BrandLockup size={32} />
        </Pressable>
        <View style={styles.nav}>
          {links.map((l) => {
            const active = l.match.includes(name);
            return (
              <Pressable key={l.label} onPress={() => l.action(nav)} style={styles.link}>
                <Text style={[styles.linkTxt, active && styles.linkOn]}>{l.label}</Text>
                {active ? <View style={styles.under} /> : null}
              </Pressable>
            );
          })}
        </View>
        <View style={styles.right}>
          <Pressable onPress={() => nav.navigate('MainTabs', { screen: 'Search' })} style={styles.icon}>
            <Ionicons name="search" size={18} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => nav.navigate('MainTabs', { screen: 'Profile' })} style={styles.icon}>
            <Ionicons name="person-circle-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 16, left: 0, right: 0, zIndex: 20 },
  bar: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  link: { paddingVertical: 8 },
  linkTxt: { color: colors.textMuted, fontFamily: fonts.uiMedium, fontSize: 13.5 },
  linkOn: { color: colors.text },
  under: { height: 1.5, backgroundColor: colors.gold, marginTop: 4, borderRadius: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
