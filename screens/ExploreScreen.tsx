import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { tmdb } from '../lib/tmdb';
import { setSEO } from '../lib/seo';
import { colors, fonts, radius } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import type { Genre, MediaItem, RootStackParamList } from '../lib/types';
import { MediaRow } from '../components/MediaRow';
import { TopBar } from '../components/TopBar';
import { RowSkeleton } from '../components/Skeleton';
import { Glass } from '../components/Glass';

export default function ExploreScreen() {
  const { contentPad, isDesktop, isMobile } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<'movie' | 'tv'>('movie');
  const [movieG, setMovieG] = useState<Genre[]>([]);
  const [tvG, setTvG] = useState<Genre[]>([]);
  const [rows, setRows] = useState<Record<string, MediaItem[]>>({
    popular: [],
    top: [],
    fresh: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (kind: 'movie' | 'tv') => {
    try {
      if (kind === 'movie') {
        const [p, t, n, g] = await Promise.all([tmdb.popularMovies(), tmdb.topRatedMovies(), tmdb.nowPlaying(), tmdb.movieGenres()]);
        setRows({ popular: p.results, top: t.results, fresh: n.results });
        setMovieG(g.genres || []);
      } else {
        const [p, t, n, g] = await Promise.all([tmdb.popularTV(), tmdb.topRatedTV(), tmdb.onTheAir(), tmdb.tvGenres()]);
        setRows({ popular: p.results, top: t.results, fresh: n.results });
        setTvG(g.genres || []);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setSEO({ title: 'Explore', description: 'Browse movies and TV shows on SHELTER OF STREAM.' });
    setLoading(true);
    load(tab);
  }, [tab, load]);

  const genres = tab === 'movie' ? movieG : tvG;

  return (
    <View style={styles.root}>
      <TopBar current={tab === 'movie' ? 'MoviesBrowse' : 'TVBrowse'} />
      <SafeAreaView edges={isDesktop ? [] : ['top']} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(tab); }} tintColor={colors.gold} />
          }
          contentContainerStyle={{ paddingTop: isDesktop ? 96 : 8, paddingBottom: isMobile ? 120 : 48 }}
        >
          <View style={{ paddingHorizontal: contentPad }}>
            <Text style={styles.kicker}>EXPLORE</Text>
            <Text style={styles.h}>The catalogue</Text>
            <View style={styles.tabs}>
              {(['movie', 'tv'] as const).map((k) => (
                <Pressable key={k} onPress={() => setTab(k)}>
                  <View style={[styles.tab, tab === k && styles.tabOn]}>
                    <Text style={[styles.tabTxt, tab === k && styles.tabTxtOn]}>{k === 'movie' ? 'Movies' : 'TV Shows'}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
            <View style={styles.quick}>
              <Pressable onPress={() => nav.navigate(tab === 'movie' ? 'MoviesBrowse' : 'TVBrowse', undefined)} style={{ flex: 1 }}>
                <Glass radius={radius.md} style={styles.qcard}>
                  <Ionicons name={tab === 'movie' ? 'film-outline' : 'tv-outline'} size={20} color={colors.gold} />
                  <Text style={styles.qtxt}>Browse all</Text>
                </Glass>
              </Pressable>
              <Pressable onPress={() => nav.navigate('Categories')} style={{ flex: 1 }}>
                <Glass radius={radius.md} style={styles.qcard}>
                  <Ionicons name="grid-outline" size={20} color={colors.gold} />
                  <Text style={styles.qtxt}>Categories</Text>
                </Glass>
              </Pressable>
            </View>
            <Text style={styles.subh}>Genres</Text>
            <View style={styles.chips}>
              {genres.slice(0, 14).map((g) => (
                <Pressable
                  key={g.id}
                  onPress={() => nav.navigate('Category', { type: tab, genreId: g.id, genreName: g.name })}
                >
                  <View style={styles.chip}>
                    <Text style={styles.chipTxt}>{g.name}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            {loading ? (
              <>
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : (
              <>
                <MediaRow title={tab === 'movie' ? 'Popular movies' : 'Popular series'} data={rows.popular} forceType={tab} />
                <MediaRow title="Critically acclaimed" data={rows.top} forceType={tab} />
                <MediaRow title={tab === 'movie' ? 'In theatres' : 'On the air'} data={rows.fresh} forceType={tab} />
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  kicker: { color: colors.gold, fontFamily: fonts.uiSemi, fontSize: 11, letterSpacing: 3.4 },
  h: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 40, marginTop: 4 },
  tabs: { flexDirection: 'row', gap: 8, marginTop: 18 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabTxt: { color: colors.textMuted, fontFamily: fonts.uiMedium, fontSize: 13 },
  tabTxtOn: { color: colors.bg },
  quick: { flexDirection: 'row', gap: 10, marginTop: 18 },
  qcard: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtxt: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 14 },
  subh: { color: colors.text, fontFamily: fonts.display, fontSize: 22, marginTop: 26, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chipTxt: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 12.5 },
});
