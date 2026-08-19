export type NotificationType =
  | 'schedule_reminder'
  | 'schedule_updated'
  | 'request_created'
  | 'request_approved'
  | 'request_denied'
  | 'password_reset_requested'
  | 'swap_action_required'
  | 'swap_accepted'
  | 'swap_declined'
  | 'lineup_posted'
  | 'lineup_updated'

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
