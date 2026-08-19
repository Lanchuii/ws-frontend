import { InboxNotification, NotificationInboxResult } from '../models/Notification'
import { api } from './api'

interface ApiResponse<T> {
  data: T
}

export const fetchNotificationInbox = async (limit = 20) => {
  const response = await api.get<ApiResponse<NotificationInboxResult>>(
    '/push-notifications/inbox',
    { params: { limit } },
  )
  return response.data.data
}

export const markNotificationRead = async (id: string) => {
  const response = await api.patch<ApiResponse<InboxNotification>>(
    `/push-notifications/inbox/${id}/read`,
  )
  return response.data.data
}

export const markAllNotificationsRead = async () => {
  const response = await api.patch<ApiResponse<{ updated: number }>>(
    '/push-notifications/inbox/read-all',
  )
  return response.data.data
}

export interface ScheduleReminderRecipient {
  user_id: string
  worker_id: string
  worker_name: string
  schedules: Array<{
    schedule_id: string
    date: string
    service_type: string
    roles: string[]
  }>
}

export interface ScheduleReminderPreview {
  week_start: string
  week_end: string
  recipients: ScheduleReminderRecipient[]
}

export const previewScheduleReminders = async (weekStart: string) => {
  const response = await api.post<ApiResponse<ScheduleReminderPreview>>(
    '/push-notifications/schedule-reminders/preview',
    { week_start: weekStart },
  )
  return response.data.data
}

export const clearNotification = async (id: string) => {
  const response = await api.delete<ApiResponse<{ deleted: boolean }>>(
    `/push-notifications/inbox/${id}`,
  )
  return response.data.data
}

export const sendScheduleReminders = async (
  weekStart: string,
  userIds: string[],
) => {
  const response = await api.post('/push-notifications/schedule-reminders/send', {
    week_start: weekStart,
    user_ids: userIds,
  })
  return response.data.data as {
    dispatch_id: string
    notified_users: number
    sent: number
    failed: number
    expired: number
    skipped: Array<{ user_id: string; reason: string }>
  }
}
