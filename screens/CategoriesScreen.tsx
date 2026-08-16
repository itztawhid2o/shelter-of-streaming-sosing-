import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { tmdb } from '../lib/tmdb';
import { setSEO } from '../lib/seo';
import { colors, fonts, radius } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import type { Genre, RootStackParamList } from '../lib/types';
import { TopBar } from '../components/TopBar';
import { Glass } from '../components/Glass';

const accents = ['#D4A853', '#B56A3C', '#8A6BB0', '#4E7C8A', '#6FAE7A', '#C45C4A', '#7A8AA0', '#C48A5A'];

export default function CategoriesScreen() {
  const { contentPad, isDesktop, isMobile } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [movieG, setMovieG] = useState<Genre[]>([]);
  const [tvG, setTvG] = useState<Genre[]>([]);

  useEffect(() => {
    setSEO({ title: 'Categories', description: 'Browse films and series by genre on SHELTER OF STREAM.' });
    tmdb.movieGenres().then((d) => setMovieG(d.genres || []));
    tmdb.tvGenres().then((d) => setTvG(d.genres || []));
  }, []);

  const grid = (list: Genre[], type: 'movie' | 'tv') => (
    <View style={styles.grid}>
      {list.map((g, i) => (
        <Pressable
          key={`${type}-${g.id}`}
          onPress={() => nav.navigate('Category', { type, genreId: g.id, genreName: g.name })}
          style={{ width: isDesktop ? '23%' : '48%', minWidth: 140 }}
        >
          <View style={[styles.card, { borderColor: accents[i % accents.length] + '55' }]}>
            <View style={[styles.bar, { backgroundColor: accents[i % accents.length] }]} />
            <Text style={styles.gt}>{g.name}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.textDim} />
          </View>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.root}>
      <TopBar current="Categories" />
      <SafeAreaView edges={isDesktop ? [] : ['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: contentPad, paddingTop: isDesktop ? 96 : 10, paddingBottom: isMobile ? 120 : 48 }}>
          <Pressable onPress={() => nav.goBack()} style={{ marginBottom: 10 }}>
            <Glass radius={20} style={styles.back}>
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Glass>
          </Pressable>
          <Text style={styles.k}>BROWSE</Text>
          <Text style={styles.h}>Categories</Text>
          <Text style={styles.sec}>Movies</Text>
          {grid(movieG, 'movie')}
          <Text style={styles.sec}>TV Shows</Text>
          {grid(tvG, 'tv')}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  k: { color: colors.gold, fontFamily: fonts.uiSemi, letterSpacing: 3, fontSize: 11 },
  h: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 40, marginTop: 4 },
  sec: { color: colors.text, fontFamily: fonts.display, fontSize: 24, marginTop: 28, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    minHeight: 78,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  gt: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 14.5, paddingLeft: 6 },
});
