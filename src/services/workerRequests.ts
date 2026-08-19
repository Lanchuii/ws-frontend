import {
  Paginated,
  SwapMode,
  SwapOptions,
  WorkerRequest,
  WorkerRequestStatus,
  WorkerRequestType,
  WorkerUnavailability,
} from '../models/WorkerRequest';
import { api } from './api';

export interface RequestFilters {
  status?: WorkerRequestStatus | '';
  type?: WorkerRequestType | '';
  page?: number;
  limit?: number;
}

export interface CreateSwapPayload {
  mode: SwapMode;
  source_schedule_id: string;
  source_slot_key: string;
  target_worker_id?: string;
  target_schedule_id?: string;
  target_slot_key?: string;
  reason?: string;
}

const paramsFor = (filters: RequestFilters) => ({
  ...filters,
  status: filters.status || undefined,
  type: filters.type || undefined,
});

export const fetchMyWorkerRequests = async (
  filters: RequestFilters = {},
): Promise<Paginated<WorkerRequest>> => {
  const response = await api.get('/worker-requests/mine', {
    params: paramsFor(filters),
  });
  return response.data.data;
};

export const fetchWorkerRequests = async (
  filters: RequestFilters = {},
): Promise<Paginated<WorkerRequest>> => {
  const response = await api.get('/worker-requests', {
    params: paramsFor(filters),
  });
  return response.data.data;
};

export const fetchSwapOptions = async (
  mode: SwapMode,
  sourceScheduleId: string,
  sourceSlotKey: string,
): Promise<SwapOptions> => {
  const response = await api.get('/worker-requests/swap-options', {
    params: {
      mode,
      source_schedule_id: sourceScheduleId,
      source_slot_key: sourceSlotKey,
    },
  });
  return response.data.data;
};

export const createSwapRequest = async (
  payload: CreateSwapPayload,
): Promise<WorkerRequest> => {
  const response = await api.post('/worker-requests/swaps', payload);
  return response.data.data;
};

export const createUnavailableRequest = async (
  date: string,
  reason?: string,
): Promise<WorkerRequest> => {
  const response = await api.post('/worker-requests/unavailability', {
    date,
    reason,
  });
  return response.data.data;
};

export const cancelWorkerRequest = async (id: string): Promise<WorkerRequest> => {
  const response = await api.patch(`/worker-requests/${id}/cancel`);
  return response.data.data;
};

export const respondToSwapRequest = async (
  id: string,
  decision: 'accept' | 'decline',
  note?: string,
): Promise<WorkerRequest> => {
  const response = await api.patch(`/worker-requests/${id}/respond`, {
    decision,
    note,
  });
  return response.data.data;
};

export const approveWorkerRequest = async (
  id: string,
  note?: string,
): Promise<WorkerRequest> => {
  const response = await api.patch(`/worker-requests/${id}/approve`, { note });
  return response.data.data;
};

export const rejectWorkerRequest = async (
  id: string,
  note?: string,
): Promise<WorkerRequest> => {
  const response = await api.patch(`/worker-requests/${id}/reject`, { note });
  return response.data.data;
};

export const fetchWorkerUnavailability = async (): Promise<Paginated<WorkerUnavailability>> => {
  const response = await api.get('/worker-unavailability', {
    params: { active: true, limit: 100 },
  });
  return response.data.data;
};

export const removeWorkerUnavailability = async (id: string) => {
  const response = await api.delete(`/worker-unavailability/${id}`);
  return response.data.data as WorkerUnavailability;
};
