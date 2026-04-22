/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, BookOpen, Pen, Sparkles, ChevronRight } from 'lucide-react'
import API from '../api/axios'
import BottomNav from '../components/dashboard/BottomNav'

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  // id of entry being deleted (for confirm state) or expanded
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  // fetch entries when page loads
  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const res = await API.get('/journal/entries')
      setEntries(res.data)
    } catch (err) {
      setError('Could not load entries')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)

    try {
      const res = await API.post('/journal/entry', { title, content })
      // add new entry to top of list without refetching
      setEntries(prev => [res.data, ...prev])
      setTitle('')
      setContent('')
      setShowForm(false)
    } catch (err) {
      setError('Could not save entry')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/journal/entry/${id}`)
      setEntries(prev => prev.filter(e => e.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      setError('Could not delete entry')
    }
  }

  // format timestamp to readable date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  // group entries by month for section headers
  // returns something like { 'April 2026': [entry, entry], 'March 2026': [entry] }
  const groupByMonth = (entries) => {
    return entries.reduce((groups, entry) => {
      const monthKey = new Date(entry.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
      if (!groups[monthKey]) groups[monthKey] = []
      groups[monthKey].push(entry)
      return groups
    }, {})
  }

  const grouped = groupByMonth(entries)

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#FBFBFD' }}>
      {/* sticky header with gradient accent bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 border-b border-gray-100 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(251, 251, 253, 0.85)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* gradient icon bubble */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
            >
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#253244' }}>
                Journal
              </h1>
              <p className="text-xs text-gray-400">Your private space</p>
            </div>
          </div>

          {/* toggle write form button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 shadow-md"
            style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
          >
            <Plus size={16} />
            New
          </motion.button>
        </div>
      </motion.div>

      {/* main content */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* loading state */}
        {loading && (
          <p className="text-center text-gray-400 text-sm py-8">Loading entries...</p>
        )}

        {/* empty state with gradient card */}
        {!loading && entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center overflow-hidden relative"
          >
            {/* decorative gradient blob */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
            />

            <div className="relative z-10">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
              >
                <Pen size={28} className="text-white" />
              </div>

              <p className="font-bold text-gray-800 text-lg mb-1">
                Start your first entry
              </p>
              <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
                Capture your thoughts, feelings, and experiences.
                Journaling helps you process emotions.
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 rounded-xl text-white font-semibold inline-flex items-center gap-2 shadow-md"
                style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
              >
                <Sparkles size={16} />
                Write Something
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* grouped entries by month */}
        {Object.entries(grouped).map(([month, monthEntries]) => (
          <div key={month} className="space-y-3">
            {/* month header */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              {month}
            </p>

            {monthEntries.map((entry, idx) => {
              const isExpanded = expandedId === entry.id
              const isConfirming = confirmDelete === entry.id

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* card top - clickable area to expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full p-5 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 truncate">
                          {entry.title || 'Untitled'}
                        </p>
                        {/* date pill */}
                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-500">
                          {formatDate(entry.created_at)}
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-gray-300 shrink-0 mt-1 transition-transform"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                    </div>

                    {/* content preview or full based on expanded state */}
                    <p
                      className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: isExpanded ? 'visible' : 'hidden',
                      }}
                    >
                      {entry.content}
                    </p>
                  </button>

                  {/* expanded actions row */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100 overflow-hidden"
                      >
                        <div className="px-5 py-3 flex items-center justify-end gap-2">
                          {isConfirming ? (
                            <>
                              <span className="text-xs text-gray-500 mr-2">Delete this?</span>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="text-xs px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
                                style={{ backgroundColor: '#ef4444' }}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(entry.id)}
                              className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 flex items-center gap-1.5 transition"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        ))}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </div>

      {/* modal form - slides up from bottom */}
      <AnimatePresence>
        {showForm && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 z-[100] bg-black/40"
            />

            {/* slide-up panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-3xl shadow-2xl" // Changed from z-50
              style={{ maxHeight: '85vh' }}

            >
  {/* full height flex column inside */}
  <div className="max-w-lg mx-auto flex flex-col">

    {/* fixed top section */}
    <div className="px-5 pt-4 pb-3 shrink-0">
      <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: '#253244' }}>
          New Entry
        </h2>
        <button
          onClick={() => setShowForm(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>

    {/* scrollable middle section */}
    <div className="px-5 overflow-y-auto">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={10}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <div className="flex items-center justify-between mt-2 mb-3">
        <p className="text-xs text-gray-400">
          {content.length} characters
        </p>
        {content.trim().length > 0 && (() => {
          const words = content.trim().split(/\s+/).length
          const minutes = Math.max(1, Math.round(words / 225))
          return (
            <p className="text-xs text-gray-400">
              {words} words · ~{minutes} min read
            </p>
          )
        })()}
      </div>

      {error && (
        <p className="text-red-500 text-xs mb-3">{error}</p>
      )}
    </div>

    {/* fixed bottom actions - always visible */}
    <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0">
      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          className="flex-1 py-3 rounded-xl text-white font-semibold disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
        >
          <Sparkles size={16} />
          {submitting ? 'Saving...' : 'Save Entry'}
        </motion.button>
      </div>
    </div>
  </div>
</motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}