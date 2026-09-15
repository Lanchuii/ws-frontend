import { Meeting, MeetingReminderStatus, SaveMeetingPayload } from '../models/Meeting';
import { api } from './api';

export const fetchMeetings = async (): Promise<Meeting[]> => {
  const response = await api.get('/meetings');
  const raw = unwrap(response.data);
  const items = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.items)
      ? raw.items
      : [];

  return items
    .map(normalizeMeeting)
    .filter((meeting): meeting is Meeting => Boolean(meeting))
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
};

export const createMeeting = async (payload: SaveMeetingPayload) => {
  const response = await api.post('/meetings', payload);
  return requireMeeting(unwrap(response.data));
};

export const updateMeeting = async (id: string, payload: SaveMeetingPayload) => {
  const response = await api.patch(`/meetings/${id}`, payload);
  return requireMeeting(unwrap(response.data));
};

export const deleteMeeting = async (id: string) => {
  await api.delete(`/meetings/${id}`);
};

const normalizeMeeting = (value: unknown): Meeting | null => {
  if (!isRecord(value)) return null;

  const id = getString(value, '_id') ?? getString(value, 'id');
  const title = getString(value, 'title');
  const rawDate = getString(value, 'date');
  if (!id || !title || !rawDate) return null;

  return {
    id,
    title,
    date: rawDate.slice(0, 10),
    reminders: Array.isArray(value.reminders)
      ? value.reminders.filter(isRecord).map((reminder) => ({
          id: getString(reminder, '_id') ?? getString(reminder, 'id') ?? '',
          daysBefore: getNumber(reminder, 'days_before') ?? 0,
          time: getString(reminder, 'time') ?? '08:00',
          scheduledFor: getString(reminder, 'scheduled_for') ?? '',
          status: normalizeStatus(getString(reminder, 'status')),
          sentAt: getString(reminder, 'sent_at'),
        }))
      : [],
    audience: normalizeAudience(value.audience),
  };
};

const normalizeAudience = (value: unknown): Meeting['audience'] => {
  if (!isRecord(value)) {
    return { mode: 'all_active', workerGroupIds: [], workerIds: [] };
  }
  const mode = getString(value, 'mode');
  return {
    mode: mode === 'groups' || mode === 'workers' ? mode : 'all_active',
    workerGroupIds: getStringArray(value, 'worker_group_ids'),
    workerIds: getStringArray(value, 'worker_ids'),
  };
};

const requireMeeting = (value: unknown) => {
  const meeting = normalizeMeeting(value);
  if (!meeting) throw new Error('Meeting response could not be normalized');
  return meeting;
};

const unwrap = (value: unknown): unknown => {
  return isRecord(value) && 'data' in value ? value.data : value;
};

const normalizeStatus = (value?: string): MeetingReminderStatus => {
  return value === 'processing' || value === 'sent' ? value : 'pending';
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getString = (value: Record<string, unknown>, key: string) => {
  return typeof value[key] === 'string' ? value[key] as string : undefined;
};

const getNumber = (value: Record<string, unknown>, key: string) => {
  return typeof value[key] === 'number' ? value[key] as number : undefined;
};

const getStringArray = (value: Record<string, unknown>, key: string) => {
  return Array.isArray(value[key])
    ? value[key].filter((item): item is string => typeof item === 'string')
    : [];
};
