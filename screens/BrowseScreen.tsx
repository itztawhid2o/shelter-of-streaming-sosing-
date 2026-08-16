import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { tmdb } from '../lib/tmdb';
import { setSEO } from '../lib/seo';
import { colors, fonts } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import type { MediaItem, MediaType, RootStackParamList } from '../lib/types';
import { MediaCard } from '../components/MediaCard';
import { TopBar } from '../components/TopBar';
import { Glass } from '../components/Glass';
import { Shimmer } from '../components/Skeleton';

type Cat = 'popular' | 'top_rated' | 'now_playing' | 'upcoming' | 'on_the_air' | 'airing_today';

async function fetchPage(kind: MediaType, cat: Cat, page: number) {
  if (kind === 'movie') {
    if (cat === 'top_rated') return tmdb.topRatedMovies(page);
    if (cat === 'now_playing') return tmdb.nowPlaying(page);
    if (cat === 'upcoming') return tmdb.upcoming(page);
    return tmdb.popularMovies(page);
  }
  if (cat === 'top_rated') return tmdb.topRatedTV(page);
  if (cat === 'on_the_air') return tmdb.onTheAir(page);
  if (cat === 'airing_today') return tmdb.airingToday(page);
  return tmdb.popularTV(page);
}

function Browse({ kind }: { kind: MediaType }) {
  const route = useRoute<RouteProp<RootStackParamList, 'MoviesBrowse' | 'TVBrowse'>>();
  const initial = (route.params?.category as Cat) || 'popular';
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { contentPad, isDesktop, isMobile, width } = useResponsive();
  const [cat, setCat] = useState<Cat>(initial);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);

  const cats: { k: Cat; l: string }[] =
    kind === 'movie'
      ? [
          { k: 'popular', l: 'Popular' },
          { k: 'now_playing', l: 'Now playing' },
          { k: 'top_rated', l: 'Top rated' },
          { k: 'upcoming', l: 'Upcoming' },
        ]
      : [
          { k: 'popular', l: 'Popular' },
          { k: 'top_rated', l: 'Top rated' },
          { k: 'on_the_air', l: 'On the air' },
          { k: 'airing_today', l: 'Airing today' },
        ];

  const load = useCallback(
    async (p: number, append = false) => {
      try {
        if (append) setMore(true);
        else setLoading(true);
        const data = await fetchPage(kind, cat, p);
        setTotal(data.total_pages || 1);
        setPage(p);
        setItems((prev) => (append ? [...prev, ...(data.results || [])] : data.results || []));
      } finally {
        setLoading(false);
        setMore(false);
      }
    },
    [kind, cat]
  );

  useEffect(() => {
    setSEO({
      title: kind === 'movie' ? 'Movies' : 'TV Shows',
      description: `Browse ${kind === 'movie' ? 'movies' : 'TV shows'} on SHELTER OF STREAM.`,
    });
    load(1, false);
  }, [load, kind]);

  const cols = isDesktop ? 6 : width > 520 ? 3 : 2;
  const gap = 12;
  const cardW = Math.floor((width - contentPad * 2 - gap * (cols - 1)) / cols);
  const cardH = Math.round(cardW * 1.5);

  return (
    <View style={styles.root}>
      <TopBar current={kind === 'movie' ? 'MoviesBrowse' : 'TVBrowse'} />
      <SafeAreaView edges={isDesktop ? [] : ['top']} style={{ flex: 1 }}>
        <FlatList
          data={items}
          key={cols + cat}
          numColumns={cols}
          keyExtractor={(it, i) => `${it.id}-${i}`}
          contentContainerStyle={{ paddingHorizontal: contentPad, paddingBottom: isMobile ? 120 : 48 }}
          columnWrapperStyle={cols > 1 ? { gap, marginBottom: 16 } : undefined}
          onEndReached={() => {
            if (!more && page < total) load(page + 1, true);
          }}
          onEndReachedThreshold={0.6}
          ListHeaderComponent={
            <View style={{ paddingTop: isDesktop ? 96 : 8, paddingBottom: 16 }}>
              <Pressable onPress={() => nav.goBack()}>
                <Glass radius={20} style={styles.back}>
                  <Ionicons name="chevron-back" size={18} color={colors.text} />
                </Glass>
              </Pressable>
              <Text style={styles.k}>CATALOGUE</Text>
              <Text style={styles.h}>{kind === 'movie' ? 'Movies' : 'TV Shows'}</Text>
              <View style={styles.row}>
                {cats.map((c) => (
                  <Pressable key={c.k} onPress={() => setCat(c.k)}>
                    <View style={[styles.chip, cat === c.k && styles.chipOn]}>
                      <Text style={[styles.chipT, cat === c.k && styles.chipOnT]}>{c.l}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          ListFooterComponent={more ? <ActivityIndicator color={colors.gold} style={{ margin: 16 }} /> : null}
          ListEmptyComponent={
            loading ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Shimmer key={i} width={cardW} height={cardH} />
                ))}
              </View>
            ) : (
              <Text style={{ color: colors.textMuted }}>Nothing found.</Text>
            )
          }
          renderItem={({ item }) => (
            <MediaCard
              item={item}
              width={cardW}
              height={cardH}
              type={kind}
              onPress={() =>
                kind === 'tv' ? nav.navigate('TVDetails', { id: item.id }) : nav.navigate('MovieDetails', { id: item.id })
              }
            />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

export function MoviesBrowseScreen() {
  return <Browse kind="movie" />;
}
export function TVBrowseScreen() {
  return <Browse kind="tv" />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  k: { color: colors.gold, fontFamily: fonts.uiSemi, letterSpacing: 3, fontSize: 11 },
  h: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 40, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipT: { color: colors.textMuted, fontFamily: fonts.uiMedium, fontSize: 12.5 },
  chipOnT: { color: colors.bg },
});
