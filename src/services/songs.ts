import { PaginatedResult, Song } from '../models/Song';
import { api } from './api';

export type SaveSongPayload = Pick<
  Song,
  'title' | 'artist' | 'spotify_url' | 'is_active'
>;

export const createSong = async (payload: SaveSongPayload): Promise<Song> => {
  const response = await api.post('/songs', payload);
  return response.data.data;
};

export const updateSong = async (
  id: string,
  payload: Partial<SaveSongPayload>,
): Promise<Song> => {
  const response = await api.patch(`/songs/${id}`, payload);
  return response.data.data;
};

export interface SongSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

export const fetchSongs = async ({
  search = '',
  page = 1,
  limit = 10,
  includeInactive = false,
}: SongSearchParams = {}): Promise<PaginatedResult<Song>> => {
  const response = await api.get('/songs', {
    params: {
      search,
      page,
      limit,
      include_inactive: includeInactive,
    },
  });

  return response.data.data;
};
