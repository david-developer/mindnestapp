/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Trash2, BookOpen, Pen, Sparkles, ChevronRight,
  Lightbulb, Quote,
} from 'lucide-react'
import API from '../api/axios'
import BottomNav from '../components/dashboard/BottomNav'


// MOOD MAPPING (consistent with rest of app)

const MOOD_OPTIONS = [
  { value: 1, emoji: '😞', label: 'Struggling', color: '#ef4444' },
  { value: 2, emoji: '😕', label: 'Low',        color: '#f97316' },
  { value: 3, emoji: '😐', label: 'Okay',       color: '#eab308' },
  { value: 4, emoji: '🙂', label: 'Good',       color: '#84cc16' },
  { value: 5, emoji: '😊', label: 'Happy',      color: '#22c55e' },
  { value: 6, emoji: '😄', label: 'Amazing',    color: '#3AA76D' },
]


// WRITING PROMPTS — soft starters 
const PROMPTS = [
  "What went well today, even if small?",
  "What's been on your mind lately?",
  "If you could tell yesterday-you one thing, what would it be?",
  "What's one thing you're grateful for right now?",
  "What's something you're looking forward to?",
  "Describe a moment today that made you pause.",
]

// rotating gentle quote for empty state
const EMPTY_STATE_QUOTES = [
  { text: "The act of writing is the act of discovering what you believe.", author: "David Hare" },
  { text: "Journal writing is a voyage to the interior.", author: "Christina Baldwin" },
  { text: "Fill your paper with the breathings of your heart.", author: "William Wordsworth" },
]

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  // confirmation/expand states keyed by entry id
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  // editor state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [moodValue, setMoodValue] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // pick a stable random quote per page load
  const [quote] = useState(() =>
    EMPTY_STATE_QUOTES[Math.floor(Math.random() * EMPTY_STATE_QUOTES.length)]
  )

  // fetch entries on mount
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
      const res = await API.post('/journal/entry', {
        title: title.trim() || null,
        content,
        mood_value: moodValue,
      })
      setEntries(prev => [res.data, ...prev])
      // reset editor
      setTitle('')
      setContent('')
      setMoodValue(null)
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

  // tapping a prompt fills it as the title and focuses content
  const handlePromptTap = (prompt) => {
    setTitle(prompt)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  // group entries by month for section headers
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

  // helper to find mood data for an entry
  const getMoodFor = (value) =>
    MOOD_OPTIONS.find(m => m.value === value) || null

  // ───────────────────────────────────────────────────────────────────
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
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#253244' }}>
                Journal
              </h1>
              <p className="text-xs text-gray-400">
                {entries.length > 0
                  ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
                  : 'Your private space'}
              </p>
            </div>
          </div>

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
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {loading && (
          <p className="text-center text-gray-400 text-sm py-8">Loading entries...</p>
        )}

        {/* empty state with quote */}
        {!loading && entries.length === 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center overflow-hidden relative"
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
                style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
              />
              <div
                className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-15"
                style={{ background: 'linear-gradient(135deg, #F5A623, #88C0F7)' }}
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

            {/* inspirational quote card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: '#FEF7E5',
                borderColor: '#F5E1B0',
              }}
            >
              <Quote
                size={18}
                style={{ color: '#F5A623' }}
                className="mb-2"
              />
              <p
                className="text-sm italic leading-relaxed"
                style={{ color: '#7A5A1F' }}
              >
                {quote.text}
              </p>
              <p className="text-xs text-gray-500 mt-2">— {quote.author}</p>
            </motion.div>
          </>
        )}

        {/* grouped entries by month */}
        {Object.entries(grouped).map(([month, monthEntries]) => (
          <div key={month} className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 pt-2">
              {month}
            </p>

            {monthEntries.map((entry, idx) => {
              const isExpanded = expandedId === entry.id
              const isConfirming = confirmDelete === entry.id
              const mood = getMoodFor(entry.mood_value)

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  style={{
                    // subtle left accent bar in the entry's mood color (or default)
                    borderLeft: mood
                      ? `4px solid ${mood.color}`
                      : '4px solid transparent',
                  }}
                >
                  {/* clickable header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full p-5 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1 flex items-start gap-3">
                        {/* mood badge - shows entry's mood at a glance */}
                        {mood ? (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                            style={{
                              backgroundColor: `${mood.color}15`,
                              border: `1.5px solid ${mood.color}40`,
                            }}
                            title={mood.label}
                          >
                            {mood.emoji}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 shrink-0">
                            <Pen size={16} className="text-gray-400" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className="font-semibold leading-snug"
                            style={{ color: '#253244' }}
                          >
                            {entry.title || 'Untitled'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-400">
                              {formatDate(entry.created_at)}
                            </span>
                            {mood && (
                              <span
                                className="text-xs font-medium"
                                style={{ color: mood.color }}
                              >
                                · {mood.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        className="text-gray-300 shrink-0 mt-1 transition-transform"
                        style={{
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      />
                    </div>

                    {/* preview or full content */}
                    <p
                      className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mt-2"
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

                  {/* expanded actions */}
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
                              <span className="text-xs text-gray-500 mr-auto">
                                Delete this entry?
                              </span>
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

      {/* EDITOR MODAL */}
      <EditorModal
        open={showForm}
        title={title}
        content={content}
        moodValue={moodValue}
        submitting={submitting}
        onClose={() => setShowForm(false)}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onMoodChange={setMoodValue}
        onSubmit={handleSubmit}
        onPromptTap={handlePromptTap}
      />

      <BottomNav />
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────
// EDITOR MODAL — bottom sheet with mood picker, prompts, content
// ───────────────────────────────────────────────────────────────────────
function EditorModal({
  open, title, content, moodValue, submitting,
  onClose, onTitleChange, onContentChange, onMoodChange,
  onSubmit, onPromptTap,
}) {
  const [showPrompts, setShowPrompts] = useState(false)

  // count words for read time
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = words > 0 ? Math.max(1, Math.round(words / 225)) : 0

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-3xl shadow-2xl"
            style={{ maxHeight: '92vh' }}
          >
            <div className="max-w-lg mx-auto flex flex-col" style={{ maxHeight: '92vh' }}>
              {/* fixed top */}
              <div className="px-5 pt-4 pb-3 shrink-0">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold" style={{ color: '#253244' }}>
                    New Entry
                  </h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* scrollable body */}
              <div className="px-5 overflow-y-auto">
                {/* mood picker */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  How are you feeling?
                </p>
                <div className="grid grid-cols-6 gap-1.5 mb-4">
                  {MOOD_OPTIONS.map((mood) => {
                    const isSelected = moodValue === mood.value
                    return (
                      <motion.button
                        key={mood.value}
                        whileTap={{ scale: 0.92 }}
                        onClick={() =>
                          onMoodChange(isSelected ? null : mood.value)
                        }
                        className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? `${mood.color}20`
                            : '#f9fafb',
                          border: isSelected
                            ? `2px solid ${mood.color}`
                            : '2px solid transparent',
                        }}
                        title={mood.label}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                      </motion.button>
                    )
                  })}
                </div>
                {moodValue && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center mb-4 font-medium"
                    style={{ color: getMoodColor(moodValue) }}
                  >
                    {getMoodLabel(moodValue)}
                  </motion.p>
                )}

                {/* writing prompts toggle */}
                <button
                  onClick={() => setShowPrompts(v => !v)}
                  className="text-xs flex items-center gap-1.5 mb-3 hover:text-gray-700 transition"
                  style={{ color: '#3AA76D' }}
                >
                  <Lightbulb size={13} />
                  {showPrompts ? 'Hide prompts' : 'Need a prompt?'}
                </button>

                <AnimatePresence>
                  {showPrompts && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="space-y-1.5 pb-2">
                        {PROMPTS.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onPromptTap(prompt)
                              setShowPrompts(false)
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm border border-gray-200 hover:border-green-400 hover:bg-green-50 transition"
                            style={{ color: '#253244' }}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* title input */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                {/* content textarea */}
                <textarea
                  value={content}
                  onChange={(e) => onContentChange(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={9}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                {/* word + read-time */}
                <div className="flex items-center justify-between mt-2 mb-3">
                  <p className="text-xs text-gray-400">
                    {content.length} characters
                  </p>
                  {words > 0 && (
                    <p className="text-xs text-gray-400">
                      {words} words · ~{minutes} min read
                    </p>
                  )}
                </div>
              </div>

              {/* fixed bottom actions */}
              <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onSubmit}
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
  )
}

// helpers
function getMoodColor(value) {
  const m = MOOD_OPTIONS.find(m => m.value === value)
  return m?.color || '#6b7280'
}
function getMoodLabel(value) {
  const m = MOOD_OPTIONS.find(m => m.value === value)
  return m?.label || ''
}