/**
 * Centralized TMDB access.
 * Move TMDB_API_KEY to EXPO_PUBLIC_TMDB_API_KEY / serverless proxy for production.
 */
import type {
  Collection,
  Genre,
  MediaItem,
  MediaType,
  MovieDetails,
  Paged,
  PersonDetails,
  SeasonDetails,
  TVDetails,
} from './types';

const TMDB_API_KEY =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_TMDB_API_KEY) ||
  '49ca8da0b09c8489e221f3a941fdebd2';

export const TMDB_BASE = 'https://api.themoviedb.org/3';
export const IMG_BASE = 'https://image.tmdb.org/t/p';

const memory = new Map<string, { at: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();
const TTL = 1000 * 60 * 8;

export const img = {
  poster: (path: string | null | undefined, size: 'w185' | 'w342' | 'w500' = 'w342') =>
    path ? `${IMG_BASE}/${size}${path}` : null,
  backdrop: (path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280') =>
    path ? `${IMG_BASE}/${size}${path}` : null,
  profile: (path: string | null | undefined, size: 'w185' | 'h632' | 'w300' = 'w185') =>
    path ? `${IMG_BASE}/${size}${path}` : null,
  still: (path: string | null | undefined) => (path ? `${IMG_BASE}/w300${path}` : null),
  logo: (path: string | null | undefined) => (path ? `${IMG_BASE}/w500${path}` : null),
  original: (path: string | null | undefined) => (path ? `${IMG_BASE}/original${path}` : null),
};

function qs(params?: Record<string, string | number | boolean | undefined>) {
  const u = new URLSearchParams();
  u.set('api_key', TMDB_API_KEY);
  u.set('language', 'en-US');
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) u.set(k, String(v));
    });
  }
  return u.toString();
}

export async function tmdbFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const key = `${path}?${qs(params)}`;
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data as T;

  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const req = (async () => {
    const res = await fetch(`${TMDB_BASE}${path}?${qs(params)}`);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`TMDB ${res.status}: ${text || res.statusText}`);
    }
    const data = (await res.json()) as T;
    memory.set(key, { at: Date.now(), data });
    return data;
  })();

  inflight.set(key, req);
  try {
    return (await req) as T;
  } finally {
    inflight.delete(key);
  }
}

export const titleOf = (m: { title?: string; name?: string }) => m.title || m.name || 'Untitled';
export const yearOf = (m: { release_date?: string; first_air_date?: string }) =>
  (m.release_date || m.first_air_date || '').slice(0, 4);
export const typeOf = (m: MediaItem): MediaType => {
  if (m.media_type === 'tv' || m.media_type === 'movie') return m.media_type;
  if (m.title || m.release_date) return 'movie';
  return 'tv';
};

export const tmdb = {
  trending: (media: 'all' | 'movie' | 'tv' = 'all', window: 'day' | 'week' = 'week') =>
    tmdbFetch<Paged<MediaItem>>(`/trending/${media}/${window}`),

  popularMovies: (page = 1) => tmdbFetch<Paged<MediaItem>>('/movie/popular', { page }),
  topRatedMovies: (page = 1) => tmdbFetch<Paged<MediaItem>>('/movie/top_rated', { page }),
  nowPlaying: (page = 1) => tmdbFetch<Paged<MediaItem>>('/movie/now_playing', { page }),
  upcoming: (page = 1) => tmdbFetch<Paged<MediaItem>>('/movie/upcoming', { page }),

  popularTV: (page = 1) => tmdbFetch<Paged<MediaItem>>('/tv/popular', { page }),
  topRatedTV: (page = 1) => tmdbFetch<Paged<MediaItem>>('/tv/top_rated', { page }),
  onTheAir: (page = 1) => tmdbFetch<Paged<MediaItem>>('/tv/on_the_air', { page }),
  airingToday: (page = 1) => tmdbFetch<Paged<MediaItem>>('/tv/airing_today', { page }),

  movieGenres: () => tmdbFetch<{ genres: Genre[] }>('/genre/movie/list'),
  tvGenres: () => tmdbFetch<{ genres: Genre[] }>('/genre/tv/list'),

  discoverMovie: (params: Record<string, string | number | boolean | undefined>) =>
    tmdbFetch<Paged<MediaItem>>('/discover/movie', params),
  discoverTV: (params: Record<string, string | number | boolean | undefined>) =>
    tmdbFetch<Paged<MediaItem>>('/discover/tv', params),

  movie: (id: number) =>
    tmdbFetch<MovieDetails>(`/movie/${id}`, {
      append_to_response: 'credits,videos,similar,recommendations,images',
    }),
  tv: (id: number) =>
    tmdbFetch<TVDetails>(`/tv/${id}`, {
      append_to_response: 'credits,videos,similar,recommendations',
    }),
  season: (id: number, season: number) => tmdbFetch<SeasonDetails>(`/tv/${id}/season/${season}`),
  person: (id: number) =>
    tmdbFetch<PersonDetails>(`/person/${id}`, { append_to_response: 'combined_credits' }),
  collection: (id: number) => tmdbFetch<Collection>(`/collection/${id}`),

  searchMulti: (query: string, page = 1) =>
    tmdbFetch<Paged<MediaItem>>('/search/multi', { query, page, include_adult: false }),
  searchMovie: (query: string, page = 1) =>
    tmdbFetch<Paged<MediaItem>>('/search/movie', { query, page, include_adult: false }),
  searchTV: (query: string, page = 1) =>
    tmdbFetch<Paged<MediaItem>>('/search/tv', { query, page, include_adult: false }),
  searchPerson: (query: string, page = 1) =>
    tmdbFetch<Paged<MediaItem>>('/search/person', { query, page, include_adult: false }),
};

export function trailerKey(videos?: { results: { key: string; site: string; type: string; official: boolean }[] }) {
  const list = videos?.results || [];
  const yt = list.filter((v) => v.site === 'YouTube');
  return (
    yt.find((v) => v.type === 'Trailer' && v.official)?.key ||
    yt.find((v) => v.type === 'Trailer')?.key ||
    yt.find((v) => v.type === 'Teaser')?.key ||
    yt[0]?.key ||
    null
  );
}

export function vidsrcMovie(id: number) {
  return `https://vidsrc.sbs/embed/movie/${id}`;
}
export function vidsrcTV(id: number, season: number, episode: number) {
  return `https://vidsrc.sbs/embed/tv/${id}/${season}/${episode}`;
}

export function runtimeLabel(mins?: number | null) {
  if (!mins) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
