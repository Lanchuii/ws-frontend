export type MeetingReminderStatus = 'pending' | 'processing' | 'sent';

export interface MeetingReminder {
  id: string;
  daysBefore: number;
  time: string;
  scheduledFor: string;
  status: MeetingReminderStatus;
  sentAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  reminders: MeetingReminder[];
}

export interface SaveMeetingPayload {
  title: string;
  date: string;
  reminders: Array<{
    days_before: number;
    time: string;
  }>;
}
