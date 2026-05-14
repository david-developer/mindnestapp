/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Users, UserPlus, Flame, HeartHandshake, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

// poll the server every 30 seconds for new notifications
const POLL_INTERVAL = 30 * 1000

// icon + color per notification type
const TYPE_CONFIG = {
  friend_request: {
    icon: UserPlus,
    color: '#88C0F7',
  },
  friend_accepted: {
    icon: Check,
    color: '#3AA76D',
  },
  mood_share: {
    icon: Users,
    color: '#3AA76D',
  },
  streak_milestone: {
    icon: Flame,
    color: '#F5A623',
  },
  counselor_update: {
    icon: HeartHandshake,
    color: '#88C0F7',
  },
}

// human-readable time difference
const timeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const dropdownRef = useRef(null)

  // fetch on mount + poll every 30 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
        try {
          const res = await API.get('/notifications')
          setNotifications(res.data.notifications)
          setUnread(res.data.unread)
        } catch (err) {
          console.error('Failed to fetch notifications:', err)
        }
      }
    
      fetchNotifications()
      const interval = setInterval(fetchNotifications, POLL_INTERVAL)
      return () => clearInterval(interval)
    }, [])
    
  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  /*const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications')
      setNotifications(res.data.notifications)
      setUnread(res.data.unread)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }*/

  // open dropdown and mark all as read
  const handleOpen = async () => {
    setOpen(true)
    if (unread > 0) {
      // optimistic update - update UI instantly
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      try {
        await API.put('/notifications/read-all')
      } catch (err) {
        console.error('Could not mark as read:', err)
      }
    }
  }

  // navigate to notification's link when clicked
  const handleNotificationClick = (notif) => {
    setOpen(false)
    if (notif.link) navigate(notif.link)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* bell button */}
      <button
        onClick={() => open ? setOpen(false) : handleOpen()}
        className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition relative"
        aria-label="Notifications"
      >
        <Bell size={20} />

        {/* unread badge - dot + count */}
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm"
            style={{ backgroundColor: '#ef4444' }}
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      {/* dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-sm" style={{ color: '#253244' }}>
                Notifications
              </p>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-400"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* scrollable list */}
            <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">
                    No notifications yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    We'll let you know when something happens.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const cfg = TYPE_CONFIG[notif.type] || {
                    icon: Bell,
                    color: '#6b7280',
                  }
                  const Icon = cfg.icon

                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 flex items-start gap-3 last:border-b-0"
                      style={{
                        backgroundColor: notif.read ? 'transparent' : '#F8FFF9',
                      }}
                    >
                      {/* icon bubble */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${cfg.color}15`,
                          color: cfg.color,
                        }}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm leading-snug"
                          style={{
                            color: '#253244',
                            fontWeight: notif.read ? 400 : 600,
                          }}
                        >
                          {notif.title}
                        </p>
                        {notif.body && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {notif.body}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>

                      {/* unread indicator dot */}
                      {!notif.read && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0 mt-2"
                          style={{ backgroundColor: '#3AA76D' }}
                        />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}