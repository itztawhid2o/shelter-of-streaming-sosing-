import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tmdb, img, titleOf, vidsrcMovie, vidsrcTV } from '../lib/tmdb';
import { setSEO } from '../lib/seo';
import { colors, fonts, radius } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import type { Episode, RootStackParamList, SeasonDetails, TVDetails } from '../lib/types';
import { useApp } from '../context/AppContext';
import { Glass } from '../components/Glass';
import { EmbedPlayer } from '../components/EmbedPlayer';
import { MediaRow } from '../components/MediaRow';

export default function WatchScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Watch'>>();
  const { type, id, title: incoming } = route.params;
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { contentPad, isDesktop, isMobile, width } = useResponsive();
  const { addHistory, prefs, setAutoNext, inList, toggleList } = useApp();
  const [title, setTitle] = useState(incoming || 'Watch');
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const [tv, setTv] = useState<TVDetails | null>(null);
  const [seasonData, setSeasonData] = useState<SeasonDetails | null>(null);
  const [season, setSeason] = useState(route.params.season || 1);
  const [episode, setEpisode] = useState(route.params.episode || 1);
  const [theater, setTheater] = useState(false);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);
  const [similar, setSimilar] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const src = useMemo(() => {
    if (type === 'movie') return vidsrcMovie(id);
    return vidsrcTV(id, season, episode);
  }, [type, id, season, episode, tick]);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (type === 'movie') {
          const m = await tmdb.movie(id);
          if (!live) return;
          setTitle(titleOf(m));
          setBackdrop(m.backdrop_path);
          setPoster(m.poster_path);
          setSimilar(m.recommendations?.results || m.similar?.results || []);
          addHistory({
            id,
            type: 'movie',
            title: titleOf(m),
            poster: m.poster_path,
            backdrop: m.backdrop_path,
            watchedAt: Date.now(),
          });
          setSEO({ title: `Watch ${titleOf(m)}`, description: m.overview, image: img.backdrop(m.backdrop_path) });
        } else {
          const s = await tmdb.tv(id);
          if (!live) return;
          setTv(s);
          setTitle(titleOf(s));
          setBackdrop(s.backdrop_path);
          setPoster(s.poster_path);
          setSimilar(s.recommendations?.results || s.similar?.results || []);
          const first = (s.seasons || []).find((x) => x.season_number > 0)?.season_number || 1;
          if (!route.params.season) setSeason(first);
          setSEO({ title: `Watch ${titleOf(s)}`, description: s.overview, image: img.backdrop(s.backdrop_path) });
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      live = false;
    };
  }, [id, type]);

  useEffect(() => {
    if (type !== 'tv') return;
    let live = true;
    tmdb.season(id, season).then((s) => live && setSeasonData(s)).catch(() => {});
    return () => {
      live = false;
    };
  }, [id, type, season]);

  useEffect(() => {
    if (type !== 'tv' || !tv) return;
    const ep = seasonData?.episodes?.find((e) => e.episode_number === episode);
    addHistory({
      id,
      type: 'tv',
      title,
      poster,
      backdrop,
      season,
      episode,
      episodeTitle: ep?.name,
      watchedAt: Date.now(),
    });
  }, [type, tv, season, episode, seasonData, title, poster, backdrop, id, addHistory]);

  const episodes: Episode[] = seasonData?.episodes || [];
  const currentIdx = episodes.findIndex((e) => e.episode_number === episode);
  const nextEp = currentIdx >= 0 ? episodes[currentIdx + 1] : undefined;
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : undefined;
  const seasons = (tv?.seasons || []).filter((s) => s.season_number > 0);

  const goNext = useCallback(() => {
    setCountdown(null);
    if (nextEp) setEpisode(nextEp.episode_number);
    else {
      const si = seasons.findIndex((s) => s.season_number === season);
      if (si >= 0 && seasons[si + 1]) {
        setSeason(seasons[si + 1].season_number);
        setEpisode(1);
      }
    }
  }, [nextEp, seasons, season]);

  useEffect(() => {
    if (type !== 'tv' || !prefs.autoNext) {
      setCountdown(null);
      return;
    }
    const start = setTimeout(() => setCountdown(12), 42 * 60 * 1000);
    return () => clearTimeout(start);
  }, [type, season, episode, prefs.autoNext]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      goNext();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, goNext]);

  const enterFullscreen = () => {
    if (typeof document === 'undefined') {
      setTheater(true);
      return;
    }
    const el = document.getElementById('sos-player');
    if (el && (el as any).requestFullscreen) (el as any).requestFullscreen();
    else setTheater((t) => !t);
  };

  const goPrev = () => {
    if (prevEp) setEpisode(prevEp.episode_number);
    else {
      const si = seasons.findIndex((s) => s.season_number === season);
      if (si > 0) {
        const prevS = seasons[si - 1].season_number;
        setSeason(prevS);
        setEpisode(1);
      }
    }
  };

  const bg = img.backdrop(backdrop, 'original');
  const playerW = theater ? width : Math.min(width - contentPad * 2, isDesktop ? 1100 : width - contentPad * 2);

  return (
    <View style={styles.root}>
      {bg ? <Image source={{ uri: bg }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      <LinearGradient colors={['rgba(7,7,9,0.72)', 'rgba(7,7,9,0.88)', colors.bg]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: isMobile ? 40 : 48 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.head, { paddingHorizontal: contentPad, paddingTop: 8 }]}>
            <Pressable onPress={() => nav.goBack()}>
              <Glass radius={20} style={styles.icon}>
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </Glass>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.title}>
                {title}
              </Text>
              {type === 'tv' ? (
                <Text style={styles.sub}>
                  Season {season} · Episode {episode}
                  {seasonData?.episodes?.find((e) => e.episode_number === episode)?.name
                    ? `  ·  ${seasonData.episodes.find((e) => e.episode_number === episode)?.name}`
                    : ''}
                </Text>
              ) : (
                <Text style={styles.sub}>Feature film</Text>
              )}
            </View>
            <Pressable onPress={() => setTheater((t) => !t)}>
              <Glass radius={20} style={styles.icon}>
                <Ionicons name={theater ? 'contract-outline' : 'tablet-landscape-outline'} size={18} color={colors.text} />
              </Glass>
            </Pressable>
            <Pressable onPress={enterFullscreen}>
              <Glass radius={20} style={styles.icon}>
                <Ionicons name="scan-outline" size={18} color={colors.text} />
              </Glass>
            </Pressable>
            <Pressable
              onPress={() => {
                toggleList(
                  { id, title, name: title, poster_path: poster, backdrop_path: backdrop, overview: '', vote_average: 0, vote_count: 0, popularity: 0 },
                  type
                );
              }}
            >
              <Glass radius={20} style={styles.icon}>
                <Ionicons name={inList(id, type) ? 'bookmark' : 'bookmark-outline'} size={16} color={inList(id, type) ? colors.gold : colors.text} />
              </Glass>
            </Pressable>
          </View>

          <View style={{ alignItems: theater ? 'stretch' : 'center', marginTop: 12 }}>
            <View nativeID="sos-player" style={[styles.stage, { width: theater ? width : playerW, borderRadius: theater ? 0 : radius.lg }]}>
              {error ? (
                <View style={styles.err}>
                  <Ionicons name="alert-circle-outline" size={36} color={colors.gold} />
                  <Text style={styles.errT}>The stream could not be reached</Text>
                  <Text style={styles.errS}>The provider may be temporarily unavailable.</Text>
                  <Pressable
                    onPress={() => {
                      setError(false);
                      setTick((n) => n + 1);
                    }}
                    style={styles.retry}
                  >
                    <Text style={styles.retryT}>Retry</Text>
                  </Pressable>
                </View>
              ) : (
                <EmbedPlayer src={src} onError={() => setError(true)} />
              )}
            </View>
          </View>

          {countdown !== null && type === 'tv' && (
            <View style={{ paddingHorizontal: contentPad, marginTop: 14 }}>
              <Glass radius={radius.md} style={styles.upnext}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upL}>Up next in {countdown}s</Text>
                  <Text style={styles.upT} numberOfLines={1}>
                    {nextEp ? `${nextEp.episode_number}. ${nextEp.name}` : 'Next season'}
                  </Text>
                </View>
                <Pressable onPress={() => setCountdown(null)}>
                  <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
                <Pressable onPress={goNext} style={styles.playNow}>
                  <Text style={styles.playNowT}>Play now</Text>
                </Pressable>
              </Glass>
            </View>
          )}

          {type === 'tv' && (
            <View style={{ paddingHorizontal: contentPad, marginTop: 18 }}>
              <View style={styles.ctrl}>
                <Pressable onPress={goPrev} disabled={!prevEp && seasons.findIndex((s) => s.season_number === season) <= 0} style={{ opacity: prevEp ? 1 : 0.4 }}>
                  <Glass radius={999} style={styles.navBtn}>
                    <Ionicons name="play-skip-back" size={16} color={colors.text} />
                    <Text style={styles.navT}>Previous</Text>
                  </Glass>
                </Pressable>
                <Pressable onPress={goNext} disabled={!nextEp && !seasons.find((s) => s.season_number === season + 1)} style={{ opacity: nextEp || seasons.find((s) => s.season_number === season + 1) ? 1 : 0.4 }}>
                  <View style={styles.next}>
                    <Text style={styles.nextT}>Next episode</Text>
                    <Ionicons name="play-skip-forward" size={16} color={colors.bg} />
                  </View>
                </Pressable>
                <Pressable onPress={() => setAutoNext(!prefs.autoNext)}>
                  <Glass radius={999} style={styles.navBtn}>
                    <Ionicons name={prefs.autoNext ? 'infinite' : 'infinite-outline'} size={16} color={prefs.autoNext ? colors.gold : colors.text} />
                    <Text style={styles.navT}>Auto-next {prefs.autoNext ? 'on' : 'off'}</Text>
                  </Glass>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
                {seasons.map((s) => (
                  <Pressable key={s.id} onPress={() => { setSeason(s.season_number); setEpisode(1); }}>
                    <View style={[styles.schip, season === s.season_number && styles.schipOn]}>
                      <Text style={[styles.schipT, season === s.season_number && styles.schipTOn]}>{s.name}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={{ marginTop: 10 }}>
                {episodes.map((ep) => (
                  <Pressable key={ep.id} onPress={() => setEpisode(ep.episode_number)} style={[styles.ep, episode === ep.episode_number && styles.epOn]}>
                    <Text style={styles.epN}>
                      {ep.episode_number}. {ep.name}
                    </Text>
                    {episode === ep.episode_number ? <Ionicons name="play" size={14} color={colors.gold} /> : null}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={{ marginTop: 28 }}>
            <MediaRow title="Because you're watching this" data={similar} forceType={type} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 22 },
  sub: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 12, marginTop: 2 },
  stage: { aspectRatio: 16 / 9, backgroundColor: '#000', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  err: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errT: { color: colors.text, fontFamily: fonts.display, fontSize: 24, marginTop: 10 },
  errS: { color: colors.textMuted, fontFamily: fonts.ui, marginTop: 6, textAlign: 'center' },
  retry: { marginTop: 16, backgroundColor: colors.gold, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  retryT: { color: colors.bg, fontFamily: fonts.uiSemi },
  ctrl: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  navT: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 13 },
  next: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gold, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999 },
  nextT: { color: colors.bg, fontFamily: fonts.uiSemi, fontSize: 13 },
  schip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
  schipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  schipT: { color: colors.textMuted, fontFamily: fonts.uiMedium, fontSize: 12 },
  schipTOn: { color: colors.bg },
  ep: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.06)' },
  epOn: { backgroundColor: 'rgba(212,168,83,0.08)', marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 8 },
  epN: { color: colors.text, fontFamily: fonts.ui, fontSize: 13.5, flex: 1 },
  upnext: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  upL: { color: colors.gold, fontFamily: fonts.uiSemi, fontSize: 11, letterSpacing: 1.2 },
  upT: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 14, marginTop: 3 },
  cancel: { color: colors.textMuted, fontFamily: fonts.uiMedium, fontSize: 13 },
  playNow: { backgroundColor: colors.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  playNowT: { color: colors.bg, fontFamily: fonts.uiSemi, fontSize: 12.5 },
});
