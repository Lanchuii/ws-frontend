import { useEffect, useRef, useState, type TouchEvent } from 'react'
import {
  FaBell,
  FaCalendarAlt,
  FaCheckDouble,
  FaExchangeAlt,
  FaKey,
  FaMusic,
  FaTrashAlt,
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { InboxNotification } from '../../models/Notification'
import {
  clearNotification,
  fetchNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notifications'
import NotificationToggle from './NotificationToggle'

const NotificationInbox = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<InboxNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async (quiet = false) => {
    if (!quiet) setLoading(true)

    try {
      const inbox = await fetchNotificationInbox()
      setItems(inbox.items)
      setUnreadCount(inbox.unread_count)
      setError('')
    } catch {
      if (!quiet) setError('Notifications could not be loaded.')
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    const interval = window.setInterval(() => void refresh(true), 60_000)
    const onFocus = () => void refresh(true)
    window.addEventListener('focus', onFocus)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const toggle = () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) void refresh()
  }

  const openNotification = async (notification: InboxNotification) => {
    if (!notification.read_at) {
      setItems((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      )
      setUnreadCount((count) => Math.max(0, count - 1))
      try {
        await markNotificationRead(notification._id)
      } catch {
        void refresh(true)
      }
    }

    setOpen(false)
    navigate(notification.url)
  }

  const markAllRead = async () => {
    const readAt = new Date().toISOString()
    setItems((current) => current.map((item) => ({ ...item, read_at: readAt })))
    setUnreadCount(0)

    try {
      await markAllNotificationsRead()
    } catch {
      setError('Notifications could not be updated.')
      void refresh(true)
    }
  }

  const removeNotification = async (notification: InboxNotification) => {
    setItems((current) => current.filter((item) => item._id !== notification._id))
    if (!notification.read_at) {
      setUnreadCount((count) => Math.max(0, count - 1))
    }

    try {
      await clearNotification(notification._id)
    } catch {
      setError('Notification could not be cleared.')
      void refresh(true)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-5 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/20 sm:hidden"
          />
          <section className="fixed inset-x-3 bottom-3 z-50 flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-96">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-slate-950">Notifications</h2>
              <p className="text-xs text-slate-500">
                {unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-bold text-amber-700 hover:bg-amber-50"
              >
                <FaCheckDouble />
                Mark all read
              </button>
            )}
          </header>

          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <NotificationToggle isAdmin={isAdmin} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto sm:max-h-[28rem]">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                Loading notifications…
              </p>
            ) : error ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm font-medium text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="mt-2 text-sm font-bold text-amber-700"
                >
                  Try again
                </button>
              </div>
            ) : items.length ? (
              <div className="divide-y divide-slate-100">
                {items.map((notification) => (
                  <SwipeableNotification
                    key={notification._id}
                    notification={notification}
                    onOpen={() => void openNotification(notification)}
                    onClear={() => void removeNotification(notification)}
                  />
                ))}
              </div>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            )}
          </div>
          </section>
        </>
      )}
    </div>
  )
}

interface SwipeableNotificationProps {
  notification: InboxNotification
  onOpen: () => void
  onClear: () => void
}

const clearActionWidth = 80

const SwipeableNotification = ({
  notification,
  onOpen,
  onClear,
}: SwipeableNotificationProps) => {
  const [offset, setOffset] = useState(0)
  const startPosition = useRef({ x: 0, y: 0, offset: 0 })
  const swiped = useRef(false)

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    startPosition.current = { x: touch.clientX, y: touch.clientY, offset }
    swiped.current = false
  }

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    const deltaX = touch.clientX - startPosition.current.x
    const deltaY = touch.clientY - startPosition.current.y

    if (Math.abs(deltaY) > Math.abs(deltaX)) return
    if (Math.abs(deltaX) > 8) swiped.current = true

    const nextOffset = Math.max(
      -clearActionWidth,
      Math.min(0, startPosition.current.offset + deltaX),
    )
    setOffset(nextOffset)
  }

  const onTouchEnd = () => {
    setOffset((current) => current <= -clearActionWidth / 2 ? -clearActionWidth : 0)
  }

  const handleOpen = () => {
    if (swiped.current) {
      swiped.current = false
      return
    }
    if (offset < 0) {
      setOffset(0)
      return
    }
    onOpen()
  }

  return (
    <div
      className="relative overflow-hidden bg-red-600 touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <button
        type="button"
        onClick={onClear}
        onFocus={() => setOffset(-clearActionWidth)}
        className="absolute inset-y-0 right-0 flex w-20 flex-col items-center justify-center gap-1 bg-red-600 text-xs font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-200"
        aria-label={`Clear notification: ${notification.title}`}
      >
        <FaTrashAlt aria-hidden="true" />
        Clear
      </button>
      <button
        type="button"
        onClick={handleOpen}
        style={{ transform: `translateX(${offset}px)` }}
        className={`relative flex w-full gap-3 px-4 py-3 text-left transition-transform duration-150 hover:bg-slate-50 ${
          notification.read_at ? 'bg-white' : 'bg-amber-50'
        }`}
      >
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-amber-700">
          {notification.type === 'schedule_reminder' ||
          notification.type === 'schedule_updated' ? (
            <FaCalendarAlt />
          ) : notification.type.startsWith('lineup_') ? (
            <FaMusic />
          ) : notification.type === 'password_reset_requested' ? (
            <FaKey />
          ) : (
            <FaExchangeAlt />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <span className="flex-1 text-sm font-bold text-slate-950">
              {notification.title}
            </span>
            {!notification.read_at && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" />
            )}
          </span>
          <span className="mt-0.5 block text-sm leading-5 text-slate-600">
            {notification.body}
          </span>
          <span className="mt-1 block text-xs font-medium text-slate-400">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </span>
      </button>
    </div>
  )
}

const formatNotificationTime = (value: string) => {
  const date = new Date(value)
  const differenceMinutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60_000),
  )

  if (differenceMinutes < 1) return 'Just now'
  if (differenceMinutes < 60) return `${differenceMinutes}m ago`
  if (differenceMinutes < 1_440) return `${Math.floor(differenceMinutes / 60)}h ago`
  if (differenceMinutes < 10_080) return `${Math.floor(differenceMinutes / 1_440)}d ago`

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date)
}

export default NotificationInbox
