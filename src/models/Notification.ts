export type NotificationType =
  | 'schedule_reminder'
  | 'request_created'
  | 'request_approved'
  | 'request_denied'

export interface InboxNotification {
  _id: string
  type: NotificationType
  title: string
  body: string
  url: string
  metadata?: Record<string, unknown>
  read_at?: string
  createdAt: string
}

export interface NotificationInboxResult {
  items: InboxNotification[]
  unread_count: number
  pagination: {
    page: number
    per_page: number
    last_page: number
    total_rows: number
  }
}
