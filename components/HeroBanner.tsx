import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, radius } from '../lib/theme';
import { img, titleOf, typeOf, yearOf } from '../lib/tmdb';
import { useResponsive } from '../lib/responsive';
import type { MediaItem, RootStackParamList } from '../lib/types';
import { useApp } from '../context/AppContext';
import { Glass } from './Glass';

export function HeroBanner({ item }: { item: MediaItem }) {
  const { width, heroH, isDesktop, contentPad } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { inList, toggleList } = useApp();
  const type = typeOf(item);
  const saved = inList(item.id, type);
  const backdrop = img.backdrop(item.backdrop_path || item.poster_path, 'original');
  const title = titleOf(item);
  const year = yearOf(item);
  const rating = item.vote_average?.toFixed(1);

  const openDetails = () => {
    if (type === 'tv') nav.navigate('TVDetails', { id: item.id });
    else nav.navigate('MovieDetails', { id: item.id });
  };
  const watch = () => {
    nav.navigate('Watch', { type, id: item.id, title, season: type === 'tv' ? 1 : undefined, episode: type === 'tv' ? 1 : undefined });
  };

  const overview = useMemo(() => {
    const o = item.overview || '';
    return o.length > (isDesktop ? 280 : 150) ? o.slice(0, isDesktop ? 280 : 150).trim() + '…' : o;
  }, [item.overview, isDesktop]);

  return (
    <View style={{ width, height: heroH, backgroundColor: colors.bg }}>
      {backdrop ? (
        <Image source={{ uri: backdrop }} style={StyleSheet.absoluteFill} contentFit="cover" transition={500} cachePolicy="memory-disk" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
      )}
      <LinearGradient
        colors={['rgba(7,7,9,0.15)', 'rgba(7,7,9,0.25)', 'rgba(7,7,9,0.72)', colors.bg]}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient colors={['rgba(7,7,9,0.55)', 'transparent']} style={styles.topFade} />
      <View style={[styles.content, { paddingHorizontal: contentPad, paddingBottom: isDesktop ? 72 : 40 }]}>
        <View style={styles.kicker}>
          <View style={styles.dot} />
          <Text style={styles.kickerTxt}>{type === 'tv' ? 'SERIES' : 'FEATURE FILM'}</Text>
        </View>
        <Text numberOfLines={2} style={[styles.title, { fontSize: isDesktop ? 72 : 40, lineHeight: isDesktop ? 74 : 42, maxWidth: isDesktop ? 760 : '100%' }]}>
          {title}
        </Text>
        <View style={styles.meta}>
          {rating ? (
            <View style={styles.rate}>
              <Ionicons name="star" size={13} color={colors.gold} />
              <Text style={styles.rateTxt}>{rating}</Text>
            </View>
          ) : null}
          {year ? <Text style={styles.metaTxt}>{year}</Text> : null}
          <Text style={styles.metaTxt}>{type === 'tv' ? 'TV Series' : 'Movie'}</Text>
        </View>
        {overview ? (
          <Text numberOfLines={isDesktop ? 4 : 3} style={[styles.overview, { maxWidth: isDesktop ? 560 : '100%' }]}>
            {overview}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Pressable onPress={watch} style={({ pressed }) => [styles.play, pressed && { opacity: 0.88 }]}>
            <Ionicons name="play" size={18} color={colors.bg} />
            <Text style={styles.playTxt}>Watch now</Text>
          </Pressable>
          <Pressable onPress={openDetails} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
            <Glass radius={radius.pill} style={styles.infoBtn}>
              <Ionicons name="information-circle-outline" size={18} color={colors.text} />
              <Text style={styles.infoTxt}>Details</Text>
            </Glass>
          </Pressable>
          <Pressable onPress={() => toggleList(item, type)} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
            <Glass radius={radius.pill} style={styles.iconBtn}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? colors.gold : colors.text} />
            </Glass>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  content: { flex: 1, justifyContent: 'flex-end' },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold },
  kickerTxt: { color: colors.goldSoft, fontFamily: fonts.uiSemi, fontSize: 11, letterSpacing: 3 },
  title: { color: colors.text, fontFamily: fonts.displayBold },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  rate: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rateTxt: { color: colors.text, fontFamily: fonts.uiSemi, fontSize: 13 },
  metaTxt: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 13 },
  overview: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 14.5, lineHeight: 22, marginTop: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22, flexWrap: 'wrap' },
  play: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  playTxt: { color: colors.bg, fontFamily: fonts.uiSemi, fontSize: 14.5 },
  infoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 11 },
  infoTxt: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 14 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
