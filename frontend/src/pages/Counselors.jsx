/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartHandshake, Search, Filter, MapPin, Mail, Phone, Globe,
  X, Send, Check, MessageCircle, Sparkles, Clock,
} from 'lucide-react'
import API from '../api/axios'
import BottomNav from '../components/dashboard/BottomNav'

// avatar initials helper
const getInitials = (name) => {
  if (!name) return '?'
  // strip prefixes like "Dr." for cleaner initials
  const cleaned = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '')
  const parts = cleaned.split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Counselors() {
  const [counselors, setCounselors] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSpec, setFilterSpec] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCounselor, setSelectedCounselor] = useState(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [activeTab, setActiveTab] = useState('directory')  // 'directory' | 'requests'

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [counsRes, reqsRes] = await Promise.all([
        API.get('/counselors'),
        API.get('/counselors/my-requests'),
      ])
      setCounselors(counsRes.data)
      setMyRequests(reqsRes.data)
    } catch (err) {
      console.error('Failed to load counselors:', err)
    } finally {
      setLoading(false)
    }
  }

  // collect all unique specializations across counselors for filter chips
  const allSpecializations = [
    ...new Set(counselors.flatMap(c => c.specializations || [])),
  ]

  // filter counselors based on search query and selected specialization
  const filteredCounselors = counselors.filter(c => {
    // search by name, title, or specializations text
    const haystack = [
      c.name, c.title,
      ...(c.specializations || []),
      ...(c.languages || []),
    ].join(' ').toLowerCase()
    const matchesSearch = !searchQuery ||
      haystack.includes(searchQuery.toLowerCase())

    const matchesSpec = !filterSpec ||
      (c.specializations || []).includes(filterSpec)

    return matchesSearch && matchesSpec
  })

  const handleOpenContact = (counselor) => {
    setSelectedCounselor(counselor)
    setShowContactModal(true)
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
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
            style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
          >
            <HeartHandshake size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#253244' }}>Counselors</h1>
            <p className="text-xs text-gray-400">Professional support, when you need it</p>
          </div>
        </div>

        {/* tab strip */}
        <div className="max-w-lg mx-auto px-4 pb-2">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <TabBtn active={activeTab === 'directory'} onClick={() => setActiveTab('directory')}>
              Directory
            </TabBtn>
            <TabBtn active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>
              My Requests
              {myRequests.length > 0 && (
                <span className="ml-1.5 text-xs opacity-60">{myRequests.length}</span>
              )}
            </TabBtn>
          </div>
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-8">Loading...</p>
        )}

        {/* DIRECTORY TAB */}
        {!loading && activeTab === 'directory' && (
          <>
            {/* search + filter row */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or specialty..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                />
              </div>
              <button
                onClick={() => setShowFilters(v => !v)}
                className="px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition"
                style={{
                  backgroundColor: filterSpec ? '#3AA76D' : 'white',
                  color: filterSpec ? 'white' : '#253244',
                  borderColor: filterSpec ? '#3AA76D' : '#e5e7eb',
                }}
              >
                <Filter size={14} />
                Filter
              </button>
            </div>

            {/* filter chips */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-2">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Filter by Specialization
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        active={!filterSpec}
                        onClick={() => setFilterSpec('')}
                      >
                        All
                      </FilterChip>
                      {allSpecializations.map(spec => (
                        <FilterChip
                          key={spec}
                          active={filterSpec === spec}
                          onClick={() => setFilterSpec(filterSpec === spec ? '' : spec)}
                        >
                          {spec}
                        </FilterChip>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* result count */}
            {!loading && (
              <p className="text-xs text-gray-400 px-1">
                {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? 's' : ''}
                {(searchQuery || filterSpec) && ' matching'}
              </p>
            )}

            {/* counselor cards */}
            {filteredCounselors.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <Search size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No counselors match your search</p>
              </div>
            ) : (
              filteredCounselors.map((c, idx) => (
                <CounselorCard
                  key={c.id}
                  counselor={c}
                  index={idx}
                  onContact={handleOpenContact}
                />
              ))
            )}
          </>
        )}

        {/* MY REQUESTS TAB */}
        {!loading && activeTab === 'requests' && (
          <>
            {myRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
                >
                  <MessageCircle size={28} className="text-white" />
                </div>
                <p className="font-bold text-gray-800 text-lg">No requests yet</p>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                  Browse the directory and reach out to a counselor when you're ready.
                </p>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="mt-5 px-5 py-2.5 rounded-xl text-white font-semibold inline-flex items-center gap-2 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
                >
                  <HeartHandshake size={16} />
                  Browse Directory
                </button>
              </motion.div>
            ) : (
              myRequests.map((req, idx) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold shrink-0"
                      style={{ backgroundColor: req.avatar_color || '#3AA76D' }}
                    >
                      {getInitials(req.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: '#253244' }}>
                        {req.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{req.title}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  {req.message && (
                    <div className="mt-2 p-3 rounded-lg bg-gray-50 text-sm text-gray-600">
                      "{req.message}"
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(req.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </motion.div>
              ))
            )}
          </>
        )}
      </div>

      {/* CONTACT MODAL */}
      <ContactModal
        open={showContactModal}
        counselor={selectedCounselor}
        onClose={() => setShowContactModal(false)}
        onSent={fetchAll}
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
      className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
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

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize"
      style={{
        backgroundColor: active ? '#3AA76D' : 'white',
        color: active ? 'white' : '#6b7280',
        borderColor: active ? '#3AA76D' : '#e5e7eb',
      }}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: 'Pending', color: '#F5A623', bg: '#FEF3C7' },
    contacted: { label: 'In contact', color: '#3AA76D', bg: '#D1FAE5' },
    closed: { label: 'Closed', color: '#6b7280', bg: '#f3f4f6' },
  }[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' }

  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  )
}

function CounselorCard({ counselor, index, onContact }) {
  const [expanded, setExpanded] = useState(false)
  const c = counselor

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full p-4 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-semibold shrink-0 shadow-md"
            style={{ backgroundColor: c.avatar_color || '#3AA76D' }}
          >
            {getInitials(c.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-semibold truncate" style={{ color: '#253244' }}>
                {c.name}
              </p>
              {!c.accepting_new && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                  Full
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-2">{c.title}</p>

            {/* specialization tags */}
            <div className="flex flex-wrap gap-1.5">
              {(c.specializations || []).slice(0, 3).map(spec => (
                <span
                  key={spec}
                  className="text-xs px-2 py-0.5 rounded-md capitalize"
                  style={{ backgroundColor: '#F0FDF4', color: '#3AA76D' }}
                >
                  {spec}
                </span>
              ))}
              {(c.specializations || []).length > 3 && (
                <span className="text-xs text-gray-400 px-1">
                  +{c.specializations.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* expanded detail section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 space-y-3">
              {c.bio && (
                <p className="text-sm text-gray-600 leading-relaxed">{c.bio}</p>
              )}

              {/* meta info rows */}
              <div className="space-y-1.5 text-sm">
                {c.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{c.location}</span>
                  </div>
                )}
                {c.languages?.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe size={14} className="text-gray-400" />
                    <span>{c.languages.join(', ')}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{c.phone}</span>
                  </div>
                )}
              </div>

              {/* contact button */}
              <button
                disabled={!c.accepting_new}
                onClick={() => onContact(c)}
                className="w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
              >
                <Send size={14} />
                {c.accepting_new ? 'Request Contact' : 'Not Accepting New'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// modal for sending a contact request
function ContactModal({ open, counselor, onClose, onSent }) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await API.post('/counselors/request', {
        counselor_id: counselor.id,
        message: message.trim() || null,
      })
      setSuccess(true)
      if (onSent) onSent()
      // auto-close after 1.5s
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setMessage('')
    setError('')
    setSuccess(false)
    onClose()
  }

  if (!counselor) return null

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

              {success ? (
                // success state
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#D1FAE5' }}
                  >
                    <Check size={32} style={{ color: '#3AA76D' }} />
                  </motion.div>
                  <p className="font-bold text-lg" style={{ color: '#253244' }}>
                    Request sent!
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {counselor.name} will reach out soon.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold" style={{ color: '#253244' }}>
                      Contact {counselor.name?.split(' ').slice(0, 2).join(' ')}
                    </h2>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* counselor preview */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shrink-0"
                      style={{ backgroundColor: counselor.avatar_color || '#3AA76D' }}
                    >
                      {getInitials(counselor.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#253244' }}>
                        {counselor.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{counselor.title}</p>
                    </div>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly mention what you'd like support with..."
                    rows={5}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {message.length}/500
                  </p>

                  <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-blue-50">
                    <Sparkles size={14} style={{ color: '#88C0F7' }} className="shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900">
                      Your name and email will be shared so the counselor can reach back.
                    </p>
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs mt-3">{error}</p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
                    >
                      <Send size={16} />
                      {submitting ? 'Sending...' : 'Send Request'}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}