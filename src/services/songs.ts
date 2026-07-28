import { PaginatedResult, Song } from '../models/Song';
import { api } from './api';

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
