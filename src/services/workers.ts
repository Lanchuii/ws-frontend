import { LeaderSong, Worker, WorkerLabel, WorkerRole, WorkerStatus } from '../models/Worker';
import { api } from './api';

export interface SaveWorkerPayload {
  user_id?: string | null;
  name: string;
  roles: WorkerRole[];
  label?: WorkerLabel;
  status?: WorkerStatus;
  leader_songs?: Array<{
    title: string;
    key: string;
  }>;
}

export const fetchWorkers = async (status?: WorkerStatus): Promise<Worker[]> => {
  const response = await api.get('/workers', {
    params: status ? { status } : undefined,
  });
  const data = response.data.data;

  return Array.isArray(data) ? data : data.items ?? [];
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

export const deleteWorker = async (id: string) => {
  await api.delete(`/workers/${id}`);
};
