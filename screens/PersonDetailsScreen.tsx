import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tmdb, img } from '../lib/tmdb';
import { setSEO } from '../lib/seo';
import { colors, fonts, radius } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import type { PersonDetails, RootStackParamList } from '../lib/types';
import { TopBar } from '../components/TopBar';
import { MediaRow } from '../components/MediaRow';
import { Glass } from '../components/Glass';
import { DetailsSkeleton } from '../components/Skeleton';

export default function PersonDetailsScreen() {
  const { id } = useRoute<RouteProp<RootStackParamList, 'PersonDetails'>>().params;
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { contentPad, isDesktop, isMobile } = useResponsive();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [err, setErr] = useState('');
  const [more, setMore] = useState(false);

  useEffect(() => {
    let live = true;
    setPerson(null);
    tmdb
      .person(id)
      .then((p) => {
        if (!live) return;
        setPerson(p);
        setSEO({ title: p.name, description: p.biography || `${p.name} on SHELTER OF STREAM.`, image: img.profile(p.profile_path, 'h632') });
      })
      .catch((e) => live && setErr(e?.message || 'Failed'));
    return () => {
      live = false;
    };
  }, [id]);

  const known = useMemo(() => {
    const cast = person?.combined_credits?.cast || [];
    const uniq = new Map<string, any>();
    [...cast]
      .filter((c) => c.poster_path && (c.media_type === 'movie' || c.media_type === 'tv'))
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .forEach((c) => uniq.set(`${c.media_type}-${c.id}`, c));
    return Array.from(uniq.values());
  }, [person]);

  if (err) {
    return (
      <View style={styles.root}>
        <Text style={{ color: colors.textMuted, padding: 40 }}>{err}</Text>
      </View>
    );
  }
  if (!person) {
    return (
      <View style={styles.root}>
        <TopBar />
        <DetailsSkeleton />
      </View>
    );
  }

  const photo = img.profile(person.profile_path, 'h632');
  const bio = person.biography || 'No biography available.';

  return (
    <View style={styles.root}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: isMobile ? 120 : 60, paddingTop: isDesktop ? 96 : 0 }}>
        <SafeAreaView edges={isDesktop ? [] : ['top']}>
          <Pressable onPress={() => nav.goBack()} style={{ marginLeft: contentPad, marginTop: 8 }}>
            <Glass radius={20} style={styles.back}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Glass>
          </Pressable>
        </SafeAreaView>
        <View style={[styles.head, { paddingHorizontal: contentPad, flexDirection: isDesktop ? 'row' : 'column' }]}>
          <View style={styles.photo}>
            {photo ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Ionicons name="person" size={48} color={colors.textDim} />}
          </View>
          <View style={{ flex: 1, paddingTop: isDesktop ? 8 : 16 }}>
            <Text style={styles.k}>{person.known_for_department || 'TALENT'}</Text>
            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.meta}>
              {[person.birthday, person.place_of_birth, person.deathday ? `† ${person.deathday}` : '']
                .filter(Boolean)
                .join('  ·  ')}
            </Text>
            <Text style={styles.bio} numberOfLines={more ? undefined : 6}>
              {bio}
            </Text>
            {bio.length > 240 ? (
              <Pressable onPress={() => setMore((m) => !m)}>
                <Text style={styles.more}>{more ? 'Show less' : 'Read more'}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        <MediaRow title="Known for" data={known} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  head: { gap: 22, marginTop: 16, marginBottom: 24 },
  photo: {
    width: 180,
    height: 240,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  k: { color: colors.gold, fontFamily: fonts.uiSemi, letterSpacing: 3, fontSize: 11 },
  name: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 40, marginTop: 4 },
  meta: { color: colors.textMuted, fontFamily: fonts.ui, marginTop: 8, fontSize: 13 },
  bio: { color: colors.textMuted, fontFamily: fonts.ui, fontSize: 14.5, lineHeight: 23, marginTop: 14, maxWidth: 680 },
  more: { color: colors.gold, fontFamily: fonts.uiMedium, marginTop: 8 },
});
