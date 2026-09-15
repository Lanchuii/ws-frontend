export type MeetingReminderStatus = 'pending' | 'processing' | 'sent' | 'failed';
export type MeetingAudienceMode = 'all_active' | 'groups' | 'workers';

export interface MeetingAudience {
  mode: MeetingAudienceMode;
  workerGroupIds: string[];
  workerIds: string[];
}

export interface MeetingReminder {
  id: string;
  daysBefore: number;
  time: string;
  scheduledFor: string;
  status: MeetingReminderStatus;
  sentAt?: string;
  retryCount?: number;
  nextAttemptAt?: string;
  lastError?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  reminders: MeetingReminder[];
  audience: MeetingAudience;
}

export interface SaveMeetingPayload {
  title: string;
  date: string;
  reminders: Array<{
    days_before: number;
    time: string;
  }>;
  audience: {
    mode: MeetingAudienceMode;
    worker_group_ids: string[];
    worker_ids: string[];
  };
}
