export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  known_for_department: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: Genre[];
  media_type?: MediaType | 'person';
  popularity: number;
  adult?: boolean;
  origin_country?: string[];
}

export interface MovieDetails extends MediaItem {
  runtime: number | null;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  homepage: string;
  imdb_id: string;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  credits?: { cast: CastMember[]; crew: CrewMember[] };
  videos?: { results: Video[] };
  similar?: { results: MediaItem[] };
  recommendations?: { results: MediaItem[] };
  images?: { logos: { file_path: string; iso_639_1: string | null }[] };
}

export interface SeasonSummary {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  overview: string;
  poster_path: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  episode_number: number;
  season_number: number;
  vote_average: number;
  runtime: number | null;
}

export interface TVDetails extends MediaItem {
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  status: string;
  tagline: string;
  homepage: string;
  in_production: boolean;
  last_air_date: string | null;
  seasons: SeasonSummary[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  credits?: { cast: CastMember[]; crew: CrewMember[] };
  videos?: { results: Video[] };
  similar?: { results: MediaItem[] };
  recommendations?: { results: MediaItem[] };
}

export interface SeasonDetails {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  air_date: string | null;
  poster_path: string | null;
  episodes: Episode[];
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  also_known_as: string[];
  popularity: number;
  combined_credits?: {
    cast: (MediaItem & { character?: string; media_type: MediaType })[];
    crew: (MediaItem & { job?: string; media_type: MediaType })[];
  };
}

export interface PersonSearch extends PersonDetails {
  media_type: 'person';
  known_for?: MediaItem[];
}

export interface Paged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Collection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: MediaItem[];
}

export interface ListItem {
  id: number;
  type: MediaType;
  title: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  year: string;
  addedAt: number;
}

export interface WatchHistoryItem {
  id: number;
  type: MediaType;
  title: string;
  poster: string | null;
  backdrop: string | null;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  watchedAt: number;
}

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  MovieDetails: { id: number };
  TVDetails: { id: number };
  Watch: {
    type: MediaType;
    id: number;
    season?: number;
    episode?: number;
    title?: string;
  };
  PersonDetails: { id: number };
  Category: { type: MediaType; genreId: number; genreName: string };
  MoviesBrowse: { category?: string } | undefined;
  TVBrowse: { category?: string } | undefined;
  Categories: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Search: undefined;
  MyList: undefined;
  Profile: undefined;
};
