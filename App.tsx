import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { AppProvider } from './context/AppContext';
import { colors, fonts } from './lib/theme';
import { setSEO } from './lib/seo';
import { useResponsive } from './lib/responsive';
import type { MainTabParamList, RootStackParamList } from './lib/types';
import { Glass } from './components/Glass';
import { SplashScreen } from './components/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import SearchScreen from './screens/SearchScreen';
import MyListScreen from './screens/MyListScreen';
import ProfileScreen from './screens/ProfileScreen';
import MovieDetailsScreen from './screens/MovieDetailsScreen';
import TVDetailsScreen from './screens/TVDetailsScreen';
import WatchScreen from './screens/WatchScreen';
import PersonDetailsScreen from './screens/PersonDetailsScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import CategoryScreen from './screens/CategoryScreen';
import { MoviesBrowseScreen, TVBrowseScreen } from './screens/BrowseScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: 'transparent',
    primary: colors.gold,
  },
};

function TabIcon({ name, focused, label }: { name: keyof typeof Ionicons.glyphMap; focused: boolean; label: string }) {
  return (
    <View style={tabStyles.item}>
      <Ionicons name={name} size={21} color={focused ? colors.gold : colors.textDim} />
      <Text style={[tabStyles.lab, focused && tabStyles.labOn]}>{label}</Text>
    </View>
  );
}

function Tabs() {
  const { isDesktop } = useResponsive();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: isDesktop
          ? { display: 'none', height: 0 }
          : {
              position: 'absolute',
              left: 14,
              right: 14,
              bottom: 14,
              height: 68,
              borderRadius: 22,
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0,
            },
        tabBarBackground: () =>
          isDesktop ? null : <Glass heavy radius={22} style={StyleSheet.absoluteFill} />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Home" />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'compass' : 'compass-outline'} focused={focused} label="Explore" />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} label="Search" />,
        }}
      />
      <Tab.Screen
        name="MyList"
        component={MyListScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'bookmark' : 'bookmark-outline'} focused={focused} label="My List" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} label="Profile" />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNav() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="MainTabs" component={Tabs} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <Stack.Screen name="TVDetails" component={TVDetailsScreen} />
      <Stack.Screen name="Watch" component={WatchScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="PersonDetails" component={PersonDetailsScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="MoviesBrowse" component={MoviesBrowseScreen} />
      <Stack.Screen name="TVBrowse" component={TVBrowseScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [splash, setSplash] = useState(true);
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const done = useCallback(() => setSplash(false), []);

  useEffect(() => {
    setSEO({
      title: 'SHELTER OF STREAM',
      description: 'Your shelter. Your stories. Stream movies and TV with a cinematic, premium experience.',
    });
  }, []);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="light" />
            <RootNav />
            {splash ? <SplashScreen onDone={done} /> : null}
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const tabStyles = StyleSheet.create({
  item: { alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 52 },
  lab: { color: colors.textDim, fontFamily: fonts.uiMedium, fontSize: 10 },
  labOn: { color: colors.gold },
});
