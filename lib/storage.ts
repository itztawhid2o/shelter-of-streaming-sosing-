import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ListItem, MediaType, WatchHistoryItem } from './types';

const LIST_KEY = 'sos:mylist';
const WATCH_KEY = 'sos:continue';
const PREFS_KEY = 'sos:prefs';

export interface Prefs {
  autoNext: boolean;
}

const defaultPrefs: Prefs = { autoNext: true };

export async function loadList(): Promise<ListItem[]> {
  try {
    const raw = await AsyncStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveList(items: ListItem[]) {
  await AsyncStorage.setItem(LIST_KEY, JSON.stringify(items));
}

export async function loadHistory(): Promise<WatchHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(WATCH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveHistory(items: WatchHistoryItem[]) {
  await AsyncStorage.setItem(WATCH_KEY, JSON.stringify(items.slice(0, 40)));
}

export async function loadPrefs(): Promise<Prefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export async function savePrefs(p: Prefs) {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

export function listKey(id: number, type: MediaType) {
  return `${type}:${id}`;
}
