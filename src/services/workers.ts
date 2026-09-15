import { LeaderSong, Worker, WorkerLabel, WorkerRole, WorkerStatus } from '../models/Worker';
import { api } from './api';
import { LeaderRepertoireItem, PaginatedResult } from '../models/Song';

export interface SaveWorkerPayload {
  user_id?: string | null;
  name: string;
  roles: WorkerRole[];
  label?: WorkerLabel;
  worker_group_ids?: string[];
  status?: WorkerStatus;
  leader_songs?: Array<{
    title: string;
    key: string;
  }>;
}

export interface WorkerQuery {
  status?: WorkerStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export const fetchWorkersPage = async (
  query: WorkerQuery = {},
): Promise<PaginatedResult<Worker>> => {
  const response = await api.get('/workers', {
    params: query,
  });
  const data = response.data.data;

  if (Array.isArray(data)) {
    return {
      items: data,
      pagination: {
        page: 1,
        per_page: data.length,
        last_page: data.length ? 1 : 0,
        total_rows: data.length,
      },
    };
  }

  return data;
};

export const fetchWorkers = async (status?: WorkerStatus): Promise<Worker[]> => {
  const items: Worker[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const result = await fetchWorkersPage({ status, page, limit: 100 });
    items.push(...result.items);
    lastPage = result.pagination.last_page;
    page += 1;
  } while (page <= lastPage);

  return items;
};

export const createWorker = async (payload: SaveWorkerPayload): Promise<Worker> => {
  const response = await api.post('/workers', payload);
  return response.data.data;
};

export const updateWorker = async (
  id: string,
  payload: SaveWorkerPayload,
): Promise<Worker> => {
  const response = await api.patch(`/workers/${id}`, payload);
  return response.data.data;
};

export const updateMyLeaderSongs = async (
  leaderSongs: LeaderSong[],
): Promise<Worker> => {
  const response = await api.patch('/workers/me/leader-songs', {
    leader_songs: leaderSongs,
  });
  return response.data.data;
};

export interface RepertoireQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AddRepertoirePayload {
  song_id?: string;
  title?: string;
  artist?: string;
  spotify_url?: string;
  key: string;
}

export const fetchLeaderRepertoire = async (
  workerId: string,
  { search = '', page = 1, limit = 10 }: RepertoireQuery = {},
): Promise<PaginatedResult<LeaderRepertoireItem>> => {
  const response = await api.get(`/workers/${workerId}/repertoire`, {
    params: { search, page, limit },
  });
  return response.data.data;
};

export const fetchMyLeaderRepertoire = async (
  { search = '', page = 1, limit = 10 }: RepertoireQuery = {},
): Promise<PaginatedResult<LeaderRepertoireItem>> => {
  const response = await api.get('/workers/me/repertoire', {
    params: { search, page, limit },
  });
  return response.data.data;
};

export const addToMyLeaderRepertoire = async (
  payload: AddRepertoirePayload,
): Promise<LeaderRepertoireItem> => {
  const response = await api.post('/workers/me/repertoire', payload);
  return response.data.data;
};

export const addToLeaderRepertoire = async (
  workerId: string,
  payload: AddRepertoirePayload,
): Promise<LeaderRepertoireItem> => {
  const response = await api.post(`/workers/${workerId}/repertoire`, payload);
  return response.data.data;
};

export const updateMyLeaderRepertoireKey = async (
  entryId: string,
  key: string,
): Promise<LeaderRepertoireItem> => {
  const response = await api.patch(`/workers/me/repertoire/${entryId}`, {
    key,
  });
  return response.data.data;
};

export const updateLeaderRepertoireKey = async (
  workerId: string,
  entryId: string,
  key: string,
): Promise<LeaderRepertoireItem> => {
  const response = await api.patch(
    `/workers/${workerId}/repertoire/${entryId}`,
    { key },
  );
  return response.data.data;
};

export const removeFromMyLeaderRepertoire = async (entryId: string) => {
  await api.delete(`/workers/me/repertoire/${entryId}`);
};

export const removeFromLeaderRepertoire = async (
  workerId: string,
  entryId: string,
) => {
  await api.delete(`/workers/${workerId}/repertoire/${entryId}`);
};

export const deleteWorker = async (id: string) => {
  await api.delete(`/workers/${id}`);
};
