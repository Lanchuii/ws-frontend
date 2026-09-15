import { Meeting, MeetingReminderStatus, SaveMeetingPayload } from '../models/Meeting';
import { api } from './api';

export const fetchMeetings = async (
  query: { from?: string; to?: string } = {},
): Promise<Meeting[]> => {
  const items: unknown[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await api.get('/meetings', {
      params: { ...query, page, limit: 100 },
    });
    const raw = unwrap(response.data);
    items.push(...(Array.isArray(raw)
      ? raw
      : isRecord(raw) && Array.isArray(raw.items)
        ? raw.items
        : []));
    const pagination = isRecord(raw) && isRecord(raw.pagination)
      ? raw.pagination
      : undefined;
    lastPage = typeof pagination?.last_page === 'number'
      ? pagination.last_page
      : 1;
    page += 1;
  } while (page <= lastPage);

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

export const retryMeetingReminder = async (
  meetingId: string,
  reminderId: string,
) => {
  const response = await api.post(
    `/meetings/${meetingId}/reminders/${reminderId}/retry`,
  );
  return requireMeeting(unwrap(response.data));
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
          retryCount: getNumber(reminder, 'retry_count'),
          nextAttemptAt: getString(reminder, 'next_attempt_at'),
          lastError: getString(reminder, 'last_error'),
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
  return value === 'processing' || value === 'sent' || value === 'failed'
    ? value
    : 'pending';
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
