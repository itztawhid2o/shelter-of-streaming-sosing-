import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import { typeOf } from '../lib/tmdb';
import type { MediaItem, RootStackParamList } from '../lib/types';
import { MediaCard } from './MediaCard';
import { CardSkeleton } from './Skeleton';

interface Props {
  title: string;
  data: MediaItem[];
  loading?: boolean;
  onSeeAll?: () => void;
  forceType?: 'movie' | 'tv';
}

export function MediaRow({ title, data, loading, onSeeAll, forceType }: Props) {
  const { posterW, posterH, contentPad } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const open = useCallback(
    (item: MediaItem) => {
      const t = forceType || typeOf(item);
      if (t === 'tv') nav.navigate('TVDetails', { id: item.id });
      else nav.navigate('MovieDetails', { id: item.id });
    },
    [nav, forceType]
  );

  if (!loading && (!data || data.length === 0)) return null;

  return (
    <View style={styles.wrap}>
      <View style={[styles.head, { paddingHorizontal: contentPad }]}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && (
          <Pressable onPress={onSeeAll} style={styles.see}>
            <Text style={styles.seeTxt}>See all</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.gold} />
          </Pressable>
        )}
      </View>
      {loading ? (
        <View style={{ flexDirection: 'row', paddingLeft: contentPad }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} w={posterW} h={posterH} />
          ))}
        </View>
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={(it, i) => `${it.id}-${i}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: contentPad }}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          renderItem={({ item }) => (
            <MediaCard
              item={item}
              width={posterW}
              height={posterH}
              onPress={() => open(item)}
              type={forceType || typeOf(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 30 },
  head: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 24, letterSpacing: 0.3 },
  see: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 4 },
  seeTxt: { color: colors.gold, fontFamily: fonts.uiMedium, fontSize: 13 },
});
