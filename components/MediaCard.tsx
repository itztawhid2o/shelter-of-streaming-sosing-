import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../lib/theme';
import { img, titleOf, yearOf } from '../lib/tmdb';
import type { MediaItem, MediaType } from '../lib/types';
import { useApp } from '../context/AppContext';
import { LazyImage } from './LazyImage';

interface Props {
  item: MediaItem;
  width: number;
  height: number;
  onPress: () => void;
  showMeta?: boolean;
  type?: MediaType;
}

export function MediaCard({ item, width, height, onPress, showMeta = true, type }: Props) {
  const poster = img.poster(item.poster_path, width > 150 ? 'w500' : 'w342');
  const title = titleOf(item);
  const year = yearOf(item);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const { inList, toggleList } = useApp();
  const mediaType: MediaType = type || (item.media_type === 'tv' ? 'tv' : 'movie');
  const saved = inList(item.id, mediaType);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ width }, pressed && { opacity: 0.86, transform: [{ scale: 0.98 }] }]}>
      <View style={[styles.posterWrap, { width, height, borderRadius: radius.md }]}>
        {poster ? (
          <LazyImage uri={poster} style={styles.img} recyclingKey={`${item.id}-${poster}`} />
        ) : (
          <View style={styles.ph}>
            <Ionicons name="film-outline" size={28} color={colors.textDim} />
          </View>
        )}
        {rating ? (
          <View style={styles.rating}>
            <Ionicons name="star" size={10} color={colors.gold} />
            <Text style={styles.ratingTxt}>{rating}</Text>
          </View>
        ) : null}
        <Pressable
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleList(item, mediaType);
          }}
          style={styles.bookmark}
        >
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={14} color={saved ? colors.gold : colors.text} />
        </Pressable>
      </View>
      {showMeta && (
        <View style={{ marginTop: 8 }}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.meta}>{[year, mediaType === 'tv' ? 'Series' : 'Film'].filter(Boolean).join('  ·  ')}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  posterWrap: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  img: { width: '100%', height: '100%' },
  ph: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  rating: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(8,8,10,0.72)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.25)',
  },
  ratingTxt: { color: colors.text, fontFamily: fonts.uiSemi, fontSize: 10 },
  bookmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(8,8,10,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 12.5 },
  meta: { color: colors.textDim, fontFamily: fonts.ui, fontSize: 11, marginTop: 2 },
});
