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
import type { MediaItem, RootStackParamList } from '../lib/types';
import { MediaCard } from '../components/MediaCard';
import { TopBar } from '../components/TopBar';
import { Glass } from '../components/Glass';
import { Shimmer } from '../components/Skeleton';

export default function CategoryScreen() {
  const { type, genreId, genreName } = useRoute<RouteProp<RootStackParamList, 'Category'>>().params;
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { contentPad, isDesktop, isMobile, width } = useResponsive();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [sort, setSort] = useState<'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'first_air_date.desc'>('popularity.desc');

  const load = useCallback(
    async (p: number, append = false) => {
      try {
        if (append) setMore(true);
        else setLoading(true);
        const params: any = { with_genres: genreId, page: p, sort_by: sort, 'vote_count.gte': sort.includes('vote') ? 80 : 0 };
        const data = type === 'movie' ? await tmdb.discoverMovie(params) : await tmdb.discoverTV(params);
        setTotal(data.total_pages || 1);
        setPage(p);
        setItems((prev) => (append ? [...prev, ...(data.results || [])] : data.results || []));
      } finally {
        setLoading(false);
        setMore(false);
      }
    },
    [genreId, type, sort]
  );

  useEffect(() => {
    setSEO({ title: genreName, description: `${genreName} ${type === 'movie' ? 'movies' : 'series'} on SHELTER OF STREAM.` });
    load(1, false);
  }, [load, genreName, type]);

  const cols = isDesktop ? 6 : width > 520 ? 3 : 2;
  const gap = 12;
  const cardW = Math.floor((width - contentPad * 2 - gap * (cols - 1)) / cols);
  const cardH = Math.round(cardW * 1.5);

  return (
    <View style={styles.root}>
      <TopBar current="Category" />
      <SafeAreaView edges={isDesktop ? [] : ['top']} style={{ flex: 1 }}>
        <FlatList
          data={items}
          key={cols + sort}
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
              <Text style={styles.k}>{type === 'movie' ? 'MOVIES' : 'TV SHOWS'}</Text>
              <Text style={styles.h}>{genreName}</Text>
              <View style={styles.row}>
                {[
                  { k: 'popularity.desc' as const, l: 'Popular' },
                  { k: 'vote_average.desc' as const, l: 'Top rated' },
                  { k: (type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc') as any, l: 'Newest' },
                ].map((s) => (
                  <Pressable key={s.l} onPress={() => setSort(s.k)}>
                    <View style={[styles.chip, sort === s.k && styles.chipOn]}>
                      <Text style={[styles.chipT, sort === s.k && styles.chipTOn]}>{s.l}</Text>
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
              <Text style={{ color: colors.textMuted, fontFamily: fonts.ui }}>Nothing here yet.</Text>
            )
          }
          renderItem={({ item }) => (
            <MediaCard
              item={item}
              width={cardW}
              height={cardH}
              type={type}
              onPress={() =>
                type === 'tv' ? nav.navigate('TVDetails', { id: item.id }) : nav.navigate('MovieDetails', { id: item.id })
              }
            />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  k: { color: colors.gold, fontFamily: fonts.uiSemi, letterSpacing: 3, fontSize: 11 },
  h: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 40, marginTop: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipT: { color: colors.textMuted, fontFamily: fonts.uiMedium, fontSize: 12.5 },
  chipTOn: { color: colors.bg },
});
