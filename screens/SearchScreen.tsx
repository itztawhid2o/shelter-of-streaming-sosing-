import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tmdb, img, titleOf, yearOf, typeOf } from '../lib/tmdb';
import { setSEO } from '../lib/seo';
import { colors, fonts, radius } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import type { Genre, MediaItem, RootStackParamList } from '../lib/types';
import { TopBar } from '../components/TopBar';
import { Glass } from '../components/Glass';
import { MediaCard } from '../components/MediaCard';
import { Shimmer } from '../components/Skeleton';

type Filter = 'multi' | 'movie' | 'tv' | 'person';
type SortKey = 'relevance' | 'rating' | 'year';

export default function SearchScreen() {
  const { contentPad, isDesktop, isMobile, width } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('multi');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [year, setYear] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [error, setError] = useState('');
  const [suggest, setSuggest] = useState<MediaItem[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQ = useRef('');

  useEffect(() => {
    setSEO({ title: 'Search', description: 'Search movies, series and people on SHELTER OF STREAM.' });
    Promise.all([tmdb.movieGenres(), tmdb.tvGenres()]).then(([m, t]) => {
      const map = new Map<number, Genre>();
      [...(m.genres || []), ...(t.genres || [])].forEach((g) => map.set(g.id, g));
      setGenres(Array.from(map.values()));
    });
  }, []);

  const run = useCallback(
    async (query: string, p = 1, append = false) => {
      if (!query.trim()) {
        setResults([]);
        setSuggest([]);
        return;
      }
      try {
        if (append) setMore(true);
        else setLoading(true);
        setError('');
        let data;
        if (filter === 'movie') data = await tmdb.searchMovie(query, p);
        else if (filter === 'tv') data = await tmdb.searchTV(query, p);
        else if (filter === 'person') data = await tmdb.searchPerson(query, p);
        else data = await tmdb.searchMulti(query, p);
        let list = (data.results || []).filter((r) => r.media_type !== 'person' || filter === 'person' || filter === 'multi');
        setTotalPages(data.total_pages || 1);
        setPage(p);
        if (append) setResults((prev) => [...prev, ...list]);
        else setResults(list);
      } catch (e: any) {
        setError(e?.message || 'Search failed');
      } finally {
        setLoading(false);
        setMore(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastQ.current = q;
      run(q, 1, false);
      if (q.trim().length >= 2) {
        tmdb.searchMulti(q, 1).then((d) => setSuggest((d.results || []).slice(0, 6)));
      } else setSuggest([]);
    }, 320);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, filter, run]);

  const filtered = results
    .filter((r) => {
      if (filter !== 'person' && r.media_type === 'person') return false;
      if (year && yearOf(r) !== year) return false;
      if (minRating && (r.vote_average || 0) < minRating) return false;
      if (genreId && !(r.genre_ids || []).includes(genreId)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'rating') return (b.vote_average || 0) - (a.vote_average || 0);
      if (sort === 'year') return (yearOf(b) || '').localeCompare(yearOf(a) || '');
      return 0;
    });

  const cols = isDesktop ? 6 : width > 520 ? 3 : 2;
  const gap = 12;
  const cardW = Math.floor((width - contentPad * 2 - gap * (cols - 1)) / cols);
  const cardH = Math.round(cardW * 1.5);

  const open = (item: MediaItem) => {
    if (item.media_type === 'person' || filter === 'person') {
      nav.navigate('PersonDetails', { id: item.id });
      return;
    }
    const t = typeOf(item);
    if (t === 'tv') nav.navigate('TVDetails', { id: item.id });
    else nav.navigate('MovieDetails', { id: item.id });
  };

  return (
    <View style={styles.root}>
      <TopBar current="Search" />
      <SafeAreaView edges={isDesktop ? [] : ['top']} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ paddingHorizontal: contentPad, paddingTop: isDesktop ? 96 : 6 }}>
            <Text style={styles.h}>Search</Text>
            <Glass radius={radius.xl} style={styles.searchBox}>
              <Ionicons name="search" size={18} color={colors.textDim} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Titles, people, stories…"
                placeholderTextColor={colors.textDim}
                style={styles.input}
                returnKeyType="search"
                autoCorrect={false}
              />
              {q.length > 0 && (
                <Pressable onPress={() => setQ('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textDim} />
                </Pressable>
              )}
            </Glass>

            {!!suggest.length && q.trim().length >= 2 && (
              <Glass radius={radius.lg} style={styles.suggest}>
                {suggest.map((s) => {
                  const person = s.media_type === 'person';
                  const uri = person ? img.profile((s as any).profile_path) : img.poster(s.poster_path, 'w185');
                  return (
                    <Pressable key={`${s.media_type}-${s.id}`} onPress={() => { setQ(''); open(s); }} style={styles.sugRow}>
                      <View style={styles.sugPoster}>
                        {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Ionicons name={person ? 'person' : 'film'} size={14} color={colors.textDim} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={styles.sugT}>{titleOf(s)}</Text>
                        <Text style={styles.sugS}>
                          {[person ? 'Person' : typeOf(s) === 'tv' ? 'Series' : 'Film', yearOf(s), s.vote_average ? s.vote_average.toFixed(1) : '']
                            .filter(Boolean)
                            .join('  ·  ')}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </Glass>
            )}

            <View style={styles.filters}>
              {(['multi', 'movie', 'tv', 'person'] as Filter[]).map((f) => (
                <Pressable key={f} onPress={() => setFilter(f)}>
                  <View style={[styles.chip, filter === f && styles.chipOn]}>
                    <Text style={[styles.chipTxt, filter === f && styles.chipTxtOn]}>
                      {f === 'multi' ? 'All' : f === 'movie' ? 'Movies' : f === 'tv' ? 'TV' : 'People'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <View style={styles.filters}>
              {(['relevance', 'rating', 'year'] as SortKey[]).map((s) => (
                <Pressable key={s} onPress={() => setSort(s)}>
                  <View style={[styles.chip, sort === s && styles.chipOn]}>
                    <Text style={[styles.chipTxt, sort === s && styles.chipTxtOn]}>
                      {s === 'relevance' ? 'Relevance' : s === 'rating' ? 'Rating' : 'Year'}
                    </Text>
                  </View>
                </Pressable>
              ))}
              {[0, 6, 7, 8].map((r) => (
                <Pressable key={r} onPress={() => setMinRating(r)}>
                  <View style={[styles.chip, minRating === r && styles.chipOn]}>
                    <Text style={[styles.chipTxt, minRating === r && styles.chipTxtOn]}>{r === 0 ? 'Any rating' : `${r}+`}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {filter !== 'person' && (
              <FlatList
                horizontal
                data={[{ id: 0, name: 'All genres' }, ...genres]}
                keyExtractor={(g) => String(g.id)}
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 8 }}
                renderItem={({ item }) => (
                  <Pressable onPress={() => setGenreId(item.id || null)}>
                    <View style={[styles.chip, (genreId || 0) === item.id && styles.chipOn, { marginRight: 6 }]}>
                      <Text style={[styles.chipTxt, (genreId || 0) === item.id && styles.chipTxtOn]}>{item.name}</Text>
                    </View>
                  </Pressable>
                )}
              />
            )}

            <View style={styles.yearRow}>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder="Year"
                placeholderTextColor={colors.textDim}
                keyboardType="number-pad"
                style={styles.year}
                maxLength={4}
              />
              {q.trim() ? (
                <Text style={styles.count}>
                  {filtered.length} result{filtered.length === 1 ? '' : 's'}
                </Text>
              ) : null}
            </View>
          </View>

          {!q.trim() ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={42} color={colors.textDim} />
              <Text style={styles.emptyT}>Find a story to take shelter in</Text>
              <Text style={styles.emptyS}>Search films, series or the people who made them.</Text>
            </View>
          ) : loading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: contentPad, gap }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Shimmer key={i} width={cardW} height={cardH} />
              ))}
            </View>
          ) : error ? (
            <View style={styles.empty}>
              <Ionicons name="cloud-offline-outline" size={42} color={colors.danger} />
              <Text style={styles.emptyT}>Something went quiet</Text>
              <Text style={styles.emptyS}>{error}</Text>
              <Pressable onPress={() => run(q, 1)} style={styles.retry}>
                <Text style={styles.retryTxt}>Try again</Text>
              </Pressable>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={42} color={colors.textDim} />
              <Text style={styles.emptyT}>No matches in the shelter</Text>
              <Text style={styles.emptyS}>Try another title, year or filter.</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              key={cols}
              numColumns={cols}
              keyExtractor={(it, i) => `${it.media_type}-${it.id}-${i}`}
              contentContainerStyle={{ paddingHorizontal: contentPad, paddingBottom: isMobile ? 120 : 48, paddingTop: 8 }}
              columnWrapperStyle={cols > 1 ? { gap, marginBottom: 16 } : undefined}
              onEndReachedThreshold={0.6}
              onEndReached={() => {
                if (!more && page < totalPages) run(q, page + 1, true);
              }}
              ListFooterComponent={more ? <ActivityIndicator color={colors.gold} style={{ margin: 20 }} /> : null}
              renderItem={({ item }) => {
                if (item.media_type === 'person' || filter === 'person') {
                  const uri = img.profile((item as any).profile_path);
                  return (
                    <Pressable onPress={() => open(item)} style={{ width: cardW, marginBottom: cols === 1 ? 12 : 0 }}>
                      <View style={[styles.person, { width: cardW, height: cardH }]}>
                        {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Ionicons name="person" size={36} color={colors.textDim} />}
                      </View>
                      <Text numberOfLines={1} style={styles.pt}>{item.name || titleOf(item)}</Text>
                      <Text style={styles.ps}>Person</Text>
                    </Pressable>
                  );
                }
                return (
                  <MediaCard
                    item={item}
                    width={cardW}
                    height={cardH}
                    onPress={() => open(item)}
                    type={typeOf(item)}
                  />
                );
              }}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  h: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 36, marginBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 50 },
  input: { flex: 1, color: colors.text, fontFamily: fonts.ui, fontSize: 15, outlineStyle: 'none' as any },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipTxt: { color: colors.textMuted, fontFamily: fonts.uiMedium, fontSize: 12 },
  chipTxtOn: { color: colors.bg },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 6 },
  year: {
    width: 90,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: colors.text,
    paddingHorizontal: 10,
    fontFamily: fonts.ui,
    backgroundColor: colors.surface,
  },
  count: { color: colors.textDim, fontFamily: fonts.ui, fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyT: { color: colors.text, fontFamily: fonts.display, fontSize: 24, marginTop: 14 },
  emptyS: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 13.5, marginTop: 6, textAlign: 'center' },
  retry: { marginTop: 16, backgroundColor: colors.gold, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  retryTxt: { color: colors.bg, fontFamily: fonts.uiSemi },
  person: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  pt: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 12.5, marginTop: 8 },
  ps: { color: colors.textDim, fontFamily: fonts.ui, fontSize: 11, marginTop: 2 },
  suggest: { marginTop: 8, paddingVertical: 6 },
  sugRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 7 },
  sugPoster: { width: 34, height: 48, borderRadius: 6, overflow: 'hidden', backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  sugT: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 13.5 },
  sugS: { color: colors.textDim, fontFamily: fonts.ui, fontSize: 11, marginTop: 2 },
});
