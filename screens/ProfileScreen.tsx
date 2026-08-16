import React, { useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import { setSEO } from '../lib/seo';
import { TopBar } from '../components/TopBar';
import { Glass } from '../components/Glass';
import { ShelterMark } from '../components/Logo';
import type { RootStackParamList } from '../lib/types';

export default function ProfileScreen() {
  const { list, history, prefs, setAutoNext, clearAll } = useApp();
  const { contentPad, isDesktop, isMobile } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    setSEO({ title: 'Profile', description: 'Your SHELTER OF STREAM profile and preferences.' });
  }, []);

  const confirmClear = () => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Clear My List and viewing history?')) clearAll();
      return;
    }
    Alert.alert('Clear data', 'Clear My List and viewing history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearAll() },
    ]);
  };

  return (
    <View style={styles.root}>
      <TopBar current="Profile" />
      <SafeAreaView edges={isDesktop ? [] : ['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: contentPad, paddingTop: isDesktop ? 96 : 12, paddingBottom: isMobile ? 120 : 48 }}>
          <View style={styles.hero}>
            <ShelterMark size={72} glow />
            <Text style={styles.name}>Guest</Text>
            <Text style={styles.tag}>Your shelter. Your stories.</Text>
          </View>

          <View style={styles.stats}>
            <Glass radius={radius.lg} style={styles.stat}>
              <Text style={styles.statN}>{list.length}</Text>
              <Text style={styles.statL}>Saved</Text>
            </Glass>
            <Glass radius={radius.lg} style={styles.stat}>
              <Text style={styles.statN}>{history.length}</Text>
              <Text style={styles.statL}>Watched</Text>
            </Glass>
            <Glass radius={radius.lg} style={styles.stat}>
              <Text style={styles.statN}>{history.filter((h) => h.type === 'tv').length}</Text>
              <Text style={styles.statL}>Series</Text>
            </Glass>
          </View>

          <Text style={styles.sec}>Preferences</Text>
          <Pressable onPress={() => setAutoNext(!prefs.autoNext)}>
            <Glass radius={radius.md} style={styles.row}>
              <Ionicons name="infinite" size={18} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rt}>Auto-next episode</Text>
                <Text style={styles.rs}>Advance when you tap next after finishing.</Text>
              </View>
              <View style={[styles.toggle, prefs.autoNext && styles.toggleOn]}>
                <View style={[styles.knob, prefs.autoNext && styles.knobOn]} />
              </View>
            </Glass>
          </Pressable>

          <Text style={styles.sec}>Navigate</Text>
          {[
            { icon: 'home-outline' as const, label: 'Home', go: () => nav.navigate('MainTabs', { screen: 'Home' }) },
            { icon: 'film-outline' as const, label: 'Movies', go: () => nav.navigate('MoviesBrowse', undefined) },
            { icon: 'tv-outline' as const, label: 'TV Shows', go: () => nav.navigate('TVBrowse', undefined) },
            { icon: 'grid-outline' as const, label: 'Categories', go: () => nav.navigate('Categories') },
            { icon: 'search-outline' as const, label: 'Search', go: () => nav.navigate('MainTabs', { screen: 'Search' }) },
          ].map((r) => (
            <Pressable key={r.label} onPress={r.go}>
              <Glass radius={radius.md} style={styles.row}>
                <Ionicons name={r.icon} size={18} color={colors.gold} />
                <Text style={[styles.rt, { flex: 1 }]}>{r.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
              </Glass>
            </Pressable>
          ))}

          <Text style={styles.sec}>Data</Text>
          <Pressable onPress={confirmClear}>
            <Glass radius={radius.md} style={styles.row}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={[styles.rt, { flex: 1, color: colors.danger }]}>Clear local data</Text>
            </Glass>
          </Pressable>

          <Text style={styles.foot}>SHELTER OF STREAM  ·  Data by TMDB  ·  Playback via VidSrc embeds</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingVertical: 16 },
  name: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 32, marginTop: 14 },
  tag: { color: colors.textMuted, fontFamily: fonts.ui, fontStyle: 'italic', marginTop: 4 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 20 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statN: { color: colors.gold, fontFamily: fonts.displayBold, fontSize: 28 },
  statL: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 12, marginTop: 2 },
  sec: { color: colors.text, fontFamily: fonts.display, fontSize: 22, marginTop: 28, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 8 },
  rt: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 14.5 },
  rs: { color: colors.textDim, fontFamily: fonts.ui, fontSize: 11.5, marginTop: 2 },
  toggle: { width: 42, height: 24, borderRadius: 12, backgroundColor: colors.surface2, padding: 2, justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.gold },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textMuted },
  knobOn: { alignSelf: 'flex-end', backgroundColor: colors.bg },
  foot: { color: colors.textDim, fontFamily: fonts.ui, fontSize: 11, textAlign: 'center', marginTop: 36 },
});
