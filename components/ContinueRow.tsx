import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, radius } from '../lib/theme';
import { img } from '../lib/tmdb';
import { useResponsive } from '../lib/responsive';
import { useApp } from '../context/AppContext';
import type { RootStackParamList, WatchHistoryItem } from '../lib/types';

export function ContinueRow() {
  const { history } = useApp();
  const { contentPad, isDesktop } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  if (!history.length) return null;
  const cardW = isDesktop ? 320 : 260;

  const open = (it: WatchHistoryItem) => {
    nav.navigate('Watch', {
      type: it.type,
      id: it.id,
      title: it.title,
      season: it.season,
      episode: it.episode,
    });
  };

  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={[styles.h, { paddingHorizontal: contentPad }]}>Continue watching</Text>
      <FlatList
        horizontal
        data={history}
        keyExtractor={(i) => `${i.type}-${i.id}-${i.season || 0}-${i.episode || 0}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: contentPad }}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => {
          const uri = img.backdrop(item.backdrop, 'w780') || img.poster(item.poster, 'w500');
          return (
            <Pressable onPress={() => open(item)} style={{ width: cardW }}>
              <View style={[styles.card, { width: cardW, height: cardW * 0.56 }]}>
                {uri ? (
                  <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
                )}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={StyleSheet.absoluteFill} />
                <View style={styles.play}>
                  <Ionicons name="play" size={16} color={colors.bg} />
                </View>
                <View style={styles.meta}>
                  <Text numberOfLines={1} style={styles.title}>
                    {item.title}
                  </Text>
                  <Text style={styles.sub}>
                    {item.type === 'tv' && item.season
                      ? `S${item.season} · E${item.episode}${item.episodeTitle ? '  ' + item.episodeTitle : ''}`
                      : 'Resume'}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  h: { color: colors.text, fontFamily: fonts.display, fontSize: 24, marginBottom: 14 },
  card: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  play: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { position: 'absolute', left: 12, right: 52, bottom: 12 },
  title: { color: colors.text, fontFamily: fonts.uiSemi, fontSize: 14 },
  sub: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 11.5, marginTop: 2 },
});
