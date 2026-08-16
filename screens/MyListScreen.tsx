import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../lib/theme';
import { useResponsive } from '../lib/responsive';
import { setSEO } from '../lib/seo';
import type { ListItem, RootStackParamList } from '../lib/types';
import { MediaCard } from '../components/MediaCard';
import { TopBar } from '../components/TopBar';
import { ContinueRow } from '../components/ContinueRow';

export default function MyListScreen() {
  const { list } = useApp();
  const { contentPad, isDesktop, isMobile, width } = useResponsive();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<'all' | 'movie' | 'tv'>('all');

  React.useEffect(() => {
    setSEO({ title: 'My List', description: 'Your saved films and series on SHELTER OF STREAM.' });
  }, []);

  const items = useMemo(
    () => (tab === 'all' ? list : list.filter((i) => i.type === tab)),
    [list, tab]
  );

  const cols = isDesktop ? 6 : width > 520 ? 3 : 2;
  const gap = 12;
  const cardW = Math.floor((width - contentPad * 2 - gap * (cols - 1)) / cols);
  const cardH = Math.round(cardW * 1.5);

  const open = (it: ListItem) => {
    if (it.type === 'tv') nav.navigate('TVDetails', { id: it.id });
    else nav.navigate('MovieDetails', { id: it.id });
  };

  return (
    <View style={styles.root}>
      <TopBar current="MyList" />
      <SafeAreaView edges={isDesktop ? [] : ['top']} style={{ flex: 1 }}>
        <FlatList
          data={items}
          key={cols + tab}
          numColumns={cols}
          keyExtractor={(it) => `${it.type}-${it.id}`}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: contentPad, paddingTop: isDesktop ? 96 : 8 }}>
              <Text style={styles.k}>YOUR SHELTER</Text>
              <Text style={styles.h}>My List</Text>
              <View style={{ marginHorizontal: -contentPad, marginTop: 8 }}>
                <ContinueRow />
              </View>
              <View style={styles.tabs}>
                {(['all', 'movie', 'tv'] as const).map((t) => (
                  <Pressable key={t} onPress={() => setTab(t)}>
                    <View style={[styles.tab, tab === t && styles.tabOn]}>
                      <Text style={[styles.tabT, tab === t && styles.tabTOn]}>
                        {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'TV Shows'}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: contentPad, paddingBottom: isMobile ? 120 : 48 }}
          columnWrapperStyle={items.length && cols > 1 ? { gap, marginBottom: 16 } : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={42} color={colors.textDim} />
              <Text style={styles.et}>Nothing saved yet</Text>
              <Text style={styles.es}>Bookmark a film or series and it will live here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <MediaCard
              item={{
                id: item.id,
                title: item.title,
                name: item.title,
                poster_path: item.poster,
                backdrop_path: item.backdrop,
                vote_average: item.rating,
                vote_count: 0,
                popularity: 0,
                overview: '',
                release_date: item.year,
                media_type: item.type,
              }}
              width={cardW}
              height={cardH}
              onPress={() => open(item)}
              type={item.type}
            />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  k: { color: colors.gold, fontFamily: fonts.uiSemi, letterSpacing: 3, fontSize: 11 },
  h: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 40, marginTop: 4 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tabOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabT: { color: colors.textMuted, fontFamily: fonts.uiMedium, fontSize: 13 },
  tabTOn: { color: colors.bg },
  empty: { alignItems: 'center', paddingTop: 48 },
  et: { color: colors.text, fontFamily: fonts.display, fontSize: 24, marginTop: 12 },
  es: { color: colors.textMuted, fontFamily: fonts.ui, marginTop: 6 },
});
