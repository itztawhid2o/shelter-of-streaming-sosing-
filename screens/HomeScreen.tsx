import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { tmdb } from '../lib/tmdb';
import { setSEO } from '../lib/seo';
import { colors } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import type { Genre, MediaItem, RootStackParamList } from '../lib/types';
import { HeroBanner } from '../components/HeroBanner';
import { MediaRow } from '../components/MediaRow';
import { ContinueRow } from '../components/ContinueRow';
import { TopBar } from '../components/TopBar';
import { HeroSkeleton, RowSkeleton } from '../components/Skeleton';
import { BrandLockup } from '../components/Logo';

export default function HomeScreen() {
  const { isDesktop, contentPad, isMobile } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [hero, setHero] = useState<MediaItem | null>(null);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popMovies, setPopMovies] = useState<MediaItem[]>([]);
  const [popTV, setPopTV] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [topTV, setTopTV] = useState<MediaItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<MediaItem[]>([]);
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);
  const [nowPlaying, setNowPlaying] = useState<MediaItem[]>([]);
  const [genreRows, setGenreRows] = useState<{ genre: Genre; items: MediaItem[]; type: 'movie' | 'tv' }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [tr, ttv, pm, pt, trm, trt, up, np, gens, tvGens] = await Promise.all([
        tmdb.trending('all', 'week'),
        tmdb.trending('tv', 'week'),
        tmdb.popularMovies(),
        tmdb.popularTV(),
        tmdb.topRatedMovies(),
        tmdb.topRatedTV(),
        tmdb.upcoming(),
        tmdb.nowPlaying(),
        tmdb.movieGenres(),
        tmdb.tvGenres(),
      ]);
      const heroPool = (tr.results || []).filter((r) => r.backdrop_path);
      setHero(heroPool[0] || tr.results[0] || null);
      setTrending(tr.results || []);
      setTrendingTV(ttv.results || []);
      setPopMovies(pm.results || []);
      setPopTV(pt.results || []);
      setTopRated(trm.results || []);
      setTopTV(trt.results || []);
      setUpcoming(up.results || []);
      setNowPlaying(np.results || []);

      const moviePicks = (gens.genres || []).slice(0, 4);
      const tvPicks = (tvGens.genres || []).slice(0, 2);
      const rows = await Promise.all([
        ...moviePicks.map(async (g) => {
          const d = await tmdb.discoverMovie({ with_genres: g.id, sort_by: 'popularity.desc', page: 1 });
          return { genre: g, items: d.results || [], type: 'movie' as const };
        }),
        ...tvPicks.map(async (g) => {
          const d = await tmdb.discoverTV({ with_genres: g.id, sort_by: 'popularity.desc', page: 1 });
          return { genre: g, items: d.results || [], type: 'tv' as const };
        }),
      ]);
      setGenreRows(rows);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setSEO({
      title: 'SHELTER OF STREAM',
      description: 'Your shelter. Your stories. Stream movies and TV shows in a cinematic, premium experience.',
    });
    load();
  }, [load]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <TopBar current="Home" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.gold} />
        }
      >
        {isMobile && (
          <SafeAreaView edges={['top']}>
            <View style={{ paddingHorizontal: contentPad, paddingTop: 6, paddingBottom: 8 }}>
              <BrandLockup size={30} />
            </View>
          </SafeAreaView>
        )}
        {loading && !hero ? <HeroSkeleton /> : hero ? <HeroBanner item={hero} /> : null}
        <View style={{ paddingTop: isDesktop ? 8 : 12, paddingBottom: isMobile ? 110 : 48 }}>
          <ContinueRow />
          {loading ? (
            <>
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </>
          ) : (
            <>
              <MediaRow title="Trending this week" data={trending} />
              <MediaRow title="Popular movies" data={popMovies} forceType="movie" onSeeAll={() => nav.navigate('MoviesBrowse', { category: 'popular' })} />
              <MediaRow title="Popular series" data={popTV} forceType="tv" onSeeAll={() => nav.navigate('TVBrowse', { category: 'popular' })} />
              <MediaRow title="Trending series" data={trendingTV} forceType="tv" onSeeAll={() => nav.navigate('TVBrowse', { category: 'popular' })} />
              <MediaRow title="Now in theatres" data={nowPlaying} forceType="movie" onSeeAll={() => nav.navigate('MoviesBrowse', { category: 'now_playing' })} />
              <MediaRow title="Top rated films" data={topRated} forceType="movie" onSeeAll={() => nav.navigate('MoviesBrowse', { category: 'top_rated' })} />
              <MediaRow title="Top rated series" data={topTV} forceType="tv" onSeeAll={() => nav.navigate('TVBrowse', { category: 'top_rated' })} />
              <MediaRow title="Coming soon" data={upcoming} forceType="movie" onSeeAll={() => nav.navigate('MoviesBrowse', { category: 'upcoming' })} />
              {genreRows.map((r) => (
                <MediaRow
                  key={`${r.type}-${r.genre.id}`}
                  title={r.genre.name}
                  data={r.items}
                  forceType={r.type}
                  onSeeAll={() => nav.navigate('Category', { type: r.type, genreId: r.genre.id, genreName: r.genre.name })}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
