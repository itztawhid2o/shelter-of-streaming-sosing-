import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../lib/theme';
import { img } from '../lib/tmdb';
import { useResponsive } from '../lib/responsive';
import type { CrewMember, RootStackParamList } from '../lib/types';
import { LazyImage } from './LazyImage';

const JOBS = new Set(['Director', 'Writer', 'Screenplay', 'Creator', 'Executive Producer', 'Director of Photography', 'Original Music Composer', 'Producer']);

export function CrewRow({ crew }: { crew?: CrewMember[] }) {
  const { contentPad } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  if (!crew?.length) return null;
  const seen = new Set<string>();
  const list = crew.filter((c) => {
    if (!JOBS.has(c.job)) return false;
    const k = `${c.id}-${c.job}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 14);
  if (!list.length) return null;

  return (
    <View style={{ marginTop: 22, marginBottom: 8 }}>
      <Text style={[styles.h, { paddingHorizontal: contentPad }]}>Crew</Text>
      <FlatList
        horizontal
        data={list}
        keyExtractor={(c, i) => `${c.id}-${c.job}-${i}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: contentPad }}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => {
          const uri = img.profile(item.profile_path);
          return (
            <Pressable onPress={() => nav.navigate('PersonDetails', { id: item.id })} style={{ width: 86 }}>
              <View style={styles.av}>
                {uri ? <LazyImage uri={uri} style={StyleSheet.absoluteFill} /> : <Ionicons name="person" size={26} color={colors.textDim} />}
              </View>
              <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.role}>{item.job}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  h: { color: colors.text, fontFamily: fonts.display, fontSize: 22, marginBottom: 14 },
  av: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  name: { color: colors.text, fontFamily: fonts.uiMedium, fontSize: 11.5, marginTop: 8 },
  role: { color: colors.textDim, fontFamily: fonts.ui, fontSize: 10.5, marginTop: 2 },
});
