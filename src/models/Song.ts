export interface Song {
  _id: string;
  title: string;
  artist: string;
  spotify_url?: string;
  is_active: boolean;
}

export interface LeaderRepertoireItem {
  _id: string;
  worker_id: string;
  song_id: string;
  key: string;
  song: Song;
}

export interface Pagination {
  page: number;
  per_page: number;
  last_page: number;
  total_rows: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}
