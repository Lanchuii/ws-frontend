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
