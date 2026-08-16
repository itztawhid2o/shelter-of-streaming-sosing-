import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ListItem, MediaItem, MediaType, WatchHistoryItem } from '../lib/types';
import { loadHistory, loadList, loadPrefs, saveHistory, saveList, savePrefs, type Prefs } from '../lib/storage';
import { titleOf, typeOf, yearOf } from '../lib/tmdb';

interface AppState {
  list: ListItem[];
  history: WatchHistoryItem[];
  prefs: Prefs;
  ready: boolean;
  inList: (id: number, type: MediaType) => boolean;
  toggleList: (item: MediaItem, type?: MediaType) => void;
  addHistory: (item: WatchHistoryItem) => void;
  removeHistory: (id: number, type: MediaType) => void;
  setAutoNext: (v: boolean) => void;
  clearAll: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<ListItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [prefs, setPrefs] = useState<Prefs>({ autoNext: true });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [l, h, p] = await Promise.all([loadList(), loadHistory(), loadPrefs()]);
      setList(l);
      setHistory(h);
      setPrefs(p);
      setReady(true);
    })();
  }, []);

  const inList = useCallback(
    (id: number, type: MediaType) => list.some((i) => i.id === id && i.type === type),
    [list]
  );

  const toggleList = useCallback((item: MediaItem, forced?: MediaType) => {
    const type = forced || typeOf(item);
    setList((prev) => {
      const exists = prev.some((i) => i.id === item.id && i.type === type);
      const next = exists
        ? prev.filter((i) => !(i.id === item.id && i.type === type))
        : [
            {
              id: item.id,
              type,
              title: titleOf(item),
              poster: item.poster_path,
              backdrop: item.backdrop_path,
              rating: item.vote_average,
              year: yearOf(item),
              addedAt: Date.now(),
            },
            ...prev,
          ];
      saveList(next);
      return next;
    });
  }, []);

  const addHistory = useCallback((item: WatchHistoryItem) => {
    setHistory((prev) => {
      const next = [item, ...prev.filter((i) => !(i.id === item.id && i.type === item.type))].slice(0, 40);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeHistory = useCallback((id: number, type: MediaType) => {
    setHistory((prev) => {
      const next = prev.filter((i) => !(i.id === id && i.type === type));
      saveHistory(next);
      return next;
    });
  }, []);

  const setAutoNext = useCallback((v: boolean) => {
    setPrefs((p) => {
      const next = { ...p, autoNext: v };
      savePrefs(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(async () => {
    setList([]);
    setHistory([]);
    await Promise.all([saveList([]), saveHistory([])]);
  }, []);

  const value = useMemo(
    () => ({
      list,
      history,
      prefs,
      ready,
      inList,
      toggleList,
      addHistory,
      removeHistory,
      setAutoNext,
      clearAll,
    }),
    [list, history, prefs, ready, inList, toggleList, addHistory, removeHistory, setAutoNext, clearAll]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
