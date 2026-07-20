import {
  SaveServiceTypePayload,
  SaveWorkerGroupPayload,
  ServiceTypeConfiguration,
  WorkerGroup,
} from '../models/ServiceConfiguration';
import { api } from './api';

export const fetchWorkerGroups = async (): Promise<WorkerGroup[]> => {
  const response = await api.get('/worker-groups');
  return response.data.data;
};

export const createWorkerGroup = async (
  payload: SaveWorkerGroupPayload,
): Promise<WorkerGroup> => {
  const response = await api.post('/worker-groups', payload);
  return response.data.data;
};

export const updateWorkerGroup = async (
  id: string,
  payload: Partial<Omit<SaveWorkerGroupPayload, 'code'>>,
): Promise<WorkerGroup> => {
  const response = await api.patch(`/worker-groups/${id}`, payload);
  return response.data.data;
};

export const fetchServiceTypes = async (): Promise<ServiceTypeConfiguration[]> => {
  const response = await api.get('/service-types');
  return response.data.data;
};

export const createServiceType = async (
  payload: SaveServiceTypePayload,
): Promise<ServiceTypeConfiguration> => {
  const response = await api.post('/service-types', payload);
  return response.data.data;
};

export const updateServiceType = async (
  id: string,
  payload: Partial<Omit<SaveServiceTypePayload, 'code'>>,
): Promise<ServiceTypeConfiguration> => {
  const response = await api.patch(`/service-types/${id}`, payload);
  return response.data.data;
};
