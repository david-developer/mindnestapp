import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Search, X, Check, Clock, Mail, Send, Trash2, EyeOff,
} from 'lucide-react'
import API from '../api/axios'
import BottomNav from '../components/dashboard/BottomNav'

// reused mood emoji mapping
const MOOD_EMOJI = {
  1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😊', 6: '😄',
}
const MOOD_LABEL = {
  1: 'Struggling', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Happy', 6: 'Amazing',
}
const MOOD_COLOR = {
  1: '#ef4444', 2: '#f97316', 3: '#eab308',
  4: '#84cc16', 5: '#22c55e', 6: '#3AA76D',
}

// avatar initials helper
const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
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

export default function Circle() {
  // 'feed' | 'mine' | 'friends' | 'requests'
  const [tab, setTab] = useState('feed')
  const [feed, setFeed] = useState([])
  const [myShares, setMyShares] = useState([])
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // confirmation states keyed by share id
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmHide, setConfirmHide] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [feedRes, myRes, friendsRes, requestsRes] = await Promise.all([
        API.get('/circle/feed'),
        API.get('/circle/my-shares'),
        API.get('/circle/friends'),
        API.get('/circle/requests'),
      ])
      setFeed(feedRes.data)
      setMyShares(myRes.data)
      setFriends(friendsRes.data)
      setRequests(requestsRes.data)
    } catch (err) {
      console.error('Failed to fetch circle data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAction = async (requestId, action) => {
    try {
      await API.put(`/circle/request/${requestId}`, { action })
      fetchAll()
    } catch (err) {
      console.error('Could not respond to request:', err)
    }
  }

  // hide a friend's share from your feed (soft hide)
  const handleHideFromFeed = async (shareId) => {
    try {
      await API.post(`/circle/feed/hide/${shareId}`)
      // optimistic update - remove from local state instantly
      setFeed(prev => prev.filter(f => f.id !== shareId))
      setConfirmHide(null)
    } catch (err) {
      console.error('Could not hide share:', err)
    }
  }

  // delete one of your own shares (hard delete - removes for everyone)
  const handleDeleteMyShare = async (shareId) => {
    try {
      await API.delete(`/circle/share/${shareId}`)
      setMyShares(prev => prev.filter(s => s.id !== shareId))
      setConfirmDelete(null)
    } catch (err) {
      console.error('Could not delete share:', err)
    }
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#FBFBFD' }}>
      {/* sticky header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 border-b border-gray-100 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(251, 251, 253, 0.85)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
            >
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#253244' }}>Mood Circle</h1>
              <p className="text-xs text-gray-400">Your trusted friends</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 shadow-md"
            style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
          >
            <UserPlus size={16} />
            Add
          </motion.button>
        </div>

        {/* tab strip - now 4 tabs */}
        <div className="max-w-lg mx-auto px-4 pb-2">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <TabBtn active={tab === 'feed'} onClick={() => setTab('feed')}>
              Feed
            </TabBtn>
            <TabBtn active={tab === 'mine'} onClick={() => setTab('mine')}>
              Mine
              {myShares.length > 0 && (
                <span className="ml-1 text-xs opacity-60">{myShares.length}</span>
              )}
            </TabBtn>
            <TabBtn active={tab === 'friends'} onClick={() => setTab('friends')}>
              Friends
              {friends.length > 0 && (
                <span className="ml-1 text-xs opacity-60">{friends.length}</span>
              )}
            </TabBtn>
            <TabBtn active={tab === 'requests'} onClick={() => setTab('requests')}>
              Requests
              {requests.length > 0 && (
                <span
                  className="ml-1 text-xs px-1.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  {requests.length}
                </span>
              )}
            </TabBtn>
          </div>
        </div>
      </motion.div>

      {/* content */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-8">Loading...</p>
        )}

        {/* FEED TAB - shares from friends */}
        {!loading && tab === 'feed' && (
          <AnimatePresence mode="wait">
            {feed.length === 0 ? (
              <EmptyState
                key="empty-feed"
                icon={<Users size={28} className="text-white" />}
                title="No shares yet"
                subtitle="When friends share their mood, you'll see it here. Add a friend to get started."
                cta="Add a Friend"
                onCta={() => setShowAddModal(true)}
              />
            ) : (
              feed.map((share, idx) => (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    {/* avatar with mood dot indicator */}
                    <div className="relative shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
                      >
                        {getInitials(share.name)}
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center text-xs"
                        style={{ borderColor: MOOD_COLOR[share.mood_value] }}
                      >
                        {MOOD_EMOJI[share.mood_value]}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold truncate" style={{ color: '#253244' }}>
                          {share.name}
                        </p>
                        <p className="text-xs text-gray-400 shrink-0">
                          {timeAgo(share.created_at)}
                        </p>
                      </div>

                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: MOOD_COLOR[share.mood_value] }}
                      >
                        Feeling {MOOD_LABEL[share.mood_value]}
                      </p>

                      {share.message && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {share.message}
                        </p>
                      )}

                      {/* hide action - confirm before hiding */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {confirmHide === share.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-gray-500 mr-auto">
                              Hide from your feed?
                            </span>
                            <button
                              onClick={() => setConfirmHide(null)}
                              className="text-xs px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleHideFromFeed(share.id)}
                              className="text-xs px-3 py-1 rounded-lg text-white font-medium"
                              style={{ backgroundColor: '#6b7280' }}
                            >
                              Hide
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmHide(share.id)}
                            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1.5 transition"
                          >
                            <EyeOff size={12} />
                            Hide from my feed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}

        {/* MINE TAB - your own shares with delete option */}
        {!loading && tab === 'mine' && (
          <AnimatePresence mode="wait">
            {myShares.length === 0 ? (
              <EmptyState
                key="empty-mine"
                icon={<Send size={28} className="text-white" />}
                title="You haven't shared yet"
                subtitle="When you check in with the Share toggle on, your moods appear here. You can delete any of them anytime."
              />
            ) : (
              myShares.map((share, idx) => (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    {/* mood badge instead of avatar (it's you) */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-2xl shadow-sm"
                      style={{
                        backgroundColor: 'white',
                        border: `2px solid ${MOOD_COLOR[share.mood_value]}`,
                      }}
                    >
                      {MOOD_EMOJI[share.mood_value]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p
                          className="font-semibold"
                          style={{ color: MOOD_COLOR[share.mood_value] }}
                        >
                          Feeling {MOOD_LABEL[share.mood_value]}
                        </p>
                        <p className="text-xs text-gray-400 shrink-0">
                          {timeAgo(share.created_at)}
                        </p>
                      </div>

                      {share.message ? (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {share.message}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          No message attached
                        </p>
                      )}

                      {/* delete with confirmation */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {confirmDelete === share.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-gray-500 mr-auto">
                              Delete this share?
                            </span>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteMyShare(share.id)}
                              className="text-xs px-3 py-1 rounded-lg text-white font-medium"
                              style={{ backgroundColor: '#ef4444' }}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(share.id)}
                            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition"
                          >
                            <Trash2 size={12} />
                            Delete this share
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}

        {/* FRIENDS TAB */}
        {!loading && tab === 'friends' && (
          <AnimatePresence mode="wait">
            {friends.length === 0 ? (
              <EmptyState
                key="empty-friends"
                icon={<UserPlus size={28} className="text-white" />}
                title="No friends yet"
                subtitle="Add friends by their email to start sharing moods together."
                cta="Add a Friend"
                onCta={() => setShowAddModal(true)}
              />
            ) : (
              friends.map((friend, idx) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
                  >
                    {getInitials(friend.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#253244' }}>
                      {friend.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{friend.email}</p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}

        {/* REQUESTS TAB */}
        {!loading && tab === 'requests' && (
          <AnimatePresence mode="wait">
            {requests.length === 0 ? (
              <EmptyState
                key="empty-requests"
                icon={<Clock size={28} className="text-white" />}
                title="No pending requests"
                subtitle="When someone sends you a friend request, it'll appear here."
              />
            ) : (
              requests.map((req, idx) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                      style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
                    >
                      {getInitials(req.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: '#253244' }}>
                        {req.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{req.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequestAction(req.id, 'reject')}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1.5"
                    >
                      <X size={14} />
                      Decline
                    </button>
                    <button
                      onClick={() => handleRequestAction(req.id, 'accept')}
                      className="flex-1 py-2 rounded-lg text-white text-sm font-semibold shadow-md flex items-center justify-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
                    >
                      <Check size={14} />
                      Accept
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ADD FRIEND MODAL */}
      <AddFriendModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onRequestSent={fetchAll}
      />

      <BottomNav />
    </div>
  )
}

// ===== smaller components =====

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 rounded-lg text-sm font-medium transition-all relative"
      style={{
        backgroundColor: active ? 'white' : 'transparent',
        color: active ? '#253244' : '#6b7280',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

function EmptyState({ icon, title, subtitle, cta, onCta }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
    >
      <div
        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-md"
        style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
      >
        {icon}
      </div>
      <p className="font-bold text-gray-800 text-lg">{title}</p>
      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">{subtitle}</p>
      {cta && onCta && (
        <button
          onClick={onCta}
          className="mt-5 px-5 py-2.5 rounded-xl text-white font-semibold inline-flex items-center gap-2 shadow-md"
          style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
        >
          <UserPlus size={16} />
          {cta}
        </button>
      )}
    </motion.div>
  )
}

// add friend modal - debounced search
function AddFriendModal({ open, onClose, onRequestSent }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [sentTo, setSentTo] = useState(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      setError('')
      try {
        const res = await API.get(`/circle/search?email=${encodeURIComponent(query)}`)
        setResults(res.data)
      } catch (err) {
        setError('Search failed')
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSendRequest = async (userId) => {
    try {
      await API.post('/circle/request', { addressee_id: userId })
      setSentTo(prev => new Set(prev).add(userId))
      if (onRequestSent) onRequestSent()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send request')
    }
  }

  const handleClose = () => {
    setQuery('')
    setResults([])
    setSentTo(new Set())
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-black/40"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-3xl shadow-2xl"
            style={{ maxHeight: '85vh' }}
          >
            <div className="max-w-lg mx-auto p-5">
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: '#253244' }}>
                  Add a Friend
                </h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by email..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs mb-3">{error}</p>
              )}

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {query.length > 0 && query.length < 3 && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Type at least 3 characters
                  </p>
                )}

                {query.length >= 3 && searching && (
                  <p className="text-sm text-gray-400 text-center py-6">Searching...</p>
                )}

                {query.length >= 3 && !searching && results.length === 0 && (
                  <div className="text-center py-8">
                    <Mail size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No users found</p>
                  </div>
                )}

                {results.map((user) => {
                  const wasSent = sentTo.has(user.id)
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#253244' }}>
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        disabled={wasSent}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                        style={{
                          backgroundColor: wasSent ? '#f3f4f6' : '#3AA76D',
                          color: wasSent ? '#6b7280' : 'white',
                        }}
                      >
                        {wasSent ? (
                          <>
                            <Check size={12} />
                            Sent
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            Send
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}