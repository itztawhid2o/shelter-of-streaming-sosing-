import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tmdb, img, titleOf, yearOf, trailerKey, runtimeLabel } from '../lib/tmdb';
import { setSEO } from '../lib/seo';
import { colors, fonts, radius } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import type { Episode, RootStackParamList, SeasonDetails, TVDetails } from '../lib/types';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { CastRow } from '../components/CastRow';
import { CrewRow } from '../components/CrewRow';
import { MediaRow } from '../components/MediaRow';
import { DetailsSkeleton } from '../components/Skeleton';
import { Glass } from '../components/Glass';
import { EmbedPlayer } from '../components/EmbedPlayer';

export default function TVDetailsScreen() {
  const { id } = useRoute<RouteProp<RootStackParamList, 'TVDetails'>>().params;
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { contentPad, isDesktop, isMobile, width } = useResponsive();
  const { inList, toggleList } = useApp();
  const [show, setShow] = useState<TVDetails | null>(null);
  const [season, setSeason] = useState<SeasonDetails | null>(null);
  const [seasonNo, setSeasonNo] = useState(1);
  const [err, setErr] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    let live = true;
    setShow(null);
    setErr('');
    tmdb
      .tv(id)
      .then((s) => {
        if (!live) return;
        setShow(s);
        const first = (s.seasons || []).find((x) => x.season_number > 0)?.season_number || 1;
        setSeasonNo(first);
        setSEO({
          title: titleOf(s),
          description: s.overview || `Watch ${titleOf(s)} on SHELTER OF STREAM.`,
          image: img.backdrop(s.backdrop_path),
        });
      })
      .catch((e) => live && setErr(e?.message || 'Failed to load'));
    return () => {
      live = false;
    };
  }, [id]);

  useEffect(() => {
    if (!show) return;
    let live = true;
    setSeason(null);
    tmdb.season(id, seasonNo).then((s) => live && setSeason(s)).catch(() => {});
    return () => {
      live = false;
    };
  }, [id, seasonNo, show]);

  const seasons = useMemo(() => (show?.seasons || []).filter((s) => s.season_number > 0), [show]);

  if (err) {
    return (
      <View style={styles.root}>
        <TopBar />
        <View style={styles.center}>
          <Text style={styles.err}>{err}</Text>
        </View>
      </View>
    );
  }
  if (!show) {
    return (
      <View style={styles.root}>
        <TopBar />
        <DetailsSkeleton />
      </View>
    );
  }

  const saved = inList(show.id, 'tv');
  const trailer = trailerKey(show.videos);
  const backdrop = img.backdrop(show.backdrop_path, 'original');
  const poster = img.poster(show.poster_path, 'w500');
  const creator = show.created_by?.[0];
  const runtime = show.episode_run_time?.[0];

  const watchEp = (ep: Episode) => {
    nav.navigate('Watch', {
      type: 'tv',
      id: show.id,
      season: ep.season_number,
      episode: ep.episode_number,
      title: titleOf(show),
    });
  };

  return (
    <View style={styles.root}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: isMobile ? 120 : 60 }}>
        <View style={{ height: isDesktop ? 520 : width * 0.62 }}>
          {backdrop ? <Image source={{ uri: backdrop }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
          <LinearGradient colors={['rgba(7,7,9,0.25)', 'rgba(7,7,9,0.55)', colors.bg]} style={StyleSheet.absoluteFill} />
          <SafeAreaView edges={['top']}>
            <Pressable onPress={() => nav.goBack()} style={[styles.back, { marginLeft: contentPad, marginTop: isDesktop ? 80 : 8 }]}>
              <Glass radius={20} style={styles.backGlass}>
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </Glass>
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={{ paddingHorizontal: contentPad, marginTop: isDesktop ? -180 : -80 }}>
          <View style={isDesktop ? styles.desk : undefined}>
            {poster && isDesktop ? <Image source={{ uri: poster }} style={styles.poster} contentFit="cover" /> : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>SERIES</Text>
              <Text style={[styles.title, { fontSize: isDesktop ? 52 : 34 }]}>{titleOf(show)}</Text>
              {show.tagline ? <Text style={styles.tag}>{show.tagline}</Text> : null}
              <View style={styles.meta}>
                <View style={styles.rate}>
                  <Ionicons name="star" size={13} color={colors.gold} />
                  <Text style={styles.rateTxt}>{show.vote_average?.toFixed(1)}</Text>
                </View>
                <Text style={styles.metaT}>{yearOf(show)}</Text>
                <Text style={styles.metaT}>{show.number_of_seasons} season{show.number_of_seasons === 1 ? '' : 's'}</Text>
                {runtime ? <Text style={styles.metaT}>{runtimeLabel(runtime)}</Text> : null}
                <Text style={styles.metaT}>{show.status}</Text>
              </View>
              <View style={styles.genres}>
                {(show.genres || []).map((g) => (
                  <Pressable key={g.id} onPress={() => nav.navigate('Category', { type: 'tv', genreId: g.id, genreName: g.name })}>
                    <View style={styles.genre}>
                      <Text style={styles.genreT}>{g.name}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
              {creator ? (
                <Pressable onPress={() => nav.navigate('PersonDetails', { id: creator.id })}>
                  <Text style={styles.dir}>
                    Created by <Text style={styles.dirN}>{creator.name}</Text>
                  </Text>
                </Pressable>
              ) : null}
              <Text style={styles.over}>{show.overview}</Text>
              <View style={styles.actions}>
                <Pressable
                  onPress={() =>
                    nav.navigate('Watch', { type: 'tv', id: show.id, season: seasonNo, episode: 1, title: titleOf(show) })
                  }
                  style={styles.play}
                >
                  <Ionicons name="play" size={18} color={colors.bg} />
                  <Text style={styles.playT}>Watch S{seasonNo}E1</Text>
                </Pressable>
                <Pressable onPress={() => toggleList(show, 'tv')}>
                  <Glass radius={999} style={styles.ghost}>
                    <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={16} color={saved ? colors.gold : colors.text} />
                    <Text style={styles.ghostT}>{saved ? 'In My List' : 'My List'}</Text>
                  </Glass>
                </Pressable>
                {trailer ? (
                  <Pressable onPress={() => setShowTrailer((s) => !s)}>
                    <Glass radius={999} style={styles.ghost}>
                      <Ionicons name="videocam-outline" size={16} color={colors.text} />
                      <Text style={styles.ghostT}>Trailer</Text>
                    </Glass>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {showTrailer && trailer ? (
          <View style={{ paddingHorizontal: contentPad, marginTop: 20 }}>
            <View style={styles.trailer}>
              <EmbedPlayer src={`https://www.youtube.com/embed/${trailer}?autoplay=1&rel=0`} />
            </View>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: contentPad, marginTop: 32 }}>
          <Text style={styles.sec}>Seasons & episodes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {seasons.map((s) => (
              <Pressable key={s.id} onPress={() => setSeasonNo(s.season_number)}>
                <View style={[styles.schip, seasonNo === s.season_number && styles.schipOn]}>
                  <Text style={[styles.schipT, seasonNo === s.season_number && styles.schipTOn]}>{s.name}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: contentPad, marginTop: 16 }}>
          {(season?.episodes || []).map((ep) => {
            const still = img.still(ep.still_path);
            return (
              <Pressable key={ep.id} onPress={() => watchEp(ep)} style={styles.ep}>
                <View style={styles.still}>
                  {still ? (
                    <Image source={{ uri: still }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  ) : (
                    <Ionicons name="play" size={18} color={colors.textDim} />
                  )}
                  <View style={styles.epPlay}>
                    <Ionicons name="play" size={12} color={colors.bg} />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.epN}>
                    {ep.episode_number}. {ep.name}
                  </Text>
                  <Text style={styles.epM}>
                    {[ep.air_date, ep.runtime ? runtimeLabel(ep.runtime) : ''].filter(Boolean).join('  ·  ')}
                  </Text>
                  <Text numberOfLines={2} style={styles.epO}>
                    {ep.overview || 'No synopsis yet.'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
              </Pressable>
            );
          })}
          {!season && (
            <Text style={{ color: colors.textDim, fontFamily: fonts.ui, paddingVertical: 16 }}>Loading episodes…</Text>
          )}
        </View>

        <CastRow cast={show.credits?.cast || []} />
        <CrewRow crew={show.credits?.crew || []} />
        <MediaRow title="Similar series" data={show.similar?.results || []} forceType="tv" />
        <MediaRow title="Recommended" data={show.recommendations?.results || []} forceType="tv" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  err: { color: colors.textMuted },
  back: { alignSelf: 'flex-start' },
  backGlass: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  desk: { flexDirection: 'row', gap: 28 },
  poster: { width: 220, height: 330, borderRadius: radius.lg },
  kicker: { color: colors.gold, fontFamily: fonts.uiSemi, letterSpacing: 3, fontSize: 11 },
  title: { color: colors.text, fontFamily: fonts.displayBold, marginTop: 6 },
  tag: { color: colors.textMuted, fontFamily: fonts.ui, fontStyle: 'italic', marginTop: 8 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, alignItems: 'center' },
  rate: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rateTxt: { color: colors.text, fontFamily: fonts.uiSemi },
  metaT: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 13 },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  genre: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  genreT: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 12 },
  dir: { color: colors.textDim, fontFamily: fonts.ui, marginTop: 14, fontSize: 13 },
  dirN: { color: colors.goldSoft, fontFamily: fonts.uiMedium },
  over: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 15, lineHeight: 24, marginTop: 16, maxWidth: 720 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  play: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.gold, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  playT: { color: colors.bg, fontFamily: fonts.uiSemi },
  ghost: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 11 },
  ghostT: { color: colors.text, fontFamily: fonts.uiMedium },
  trailer: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#000' },
  sec: { color: colors.text, fontFamily: fonts.display, fontSize: 24 },
  schip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
  schipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  schipT: { color: colors.textMuted, fontFamily: fonts.uiMedium, fontSize: 13 },
  schipTOn: { color: colors.bg },
  ep: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.06)' },
  still: { width: 128, height: 72, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  epPlay: { position: 'absolute', right: 6, bottom: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  epN: { color: colors.text, fontFamily: fonts.uiSemi, fontSize: 14 },
  epM: { color: colors.textDim, fontFamily: fonts.ui, fontSize: 11, marginTop: 2 },
  epO: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 12, marginTop: 4, lineHeight: 17 },
});
