/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookPlus, CheckCircle2 } from 'lucide-react'
import API from '../../api/axios'

// mood levels mapped to emoji, labels, and colors
const MOOD_LEVELS = [
  { value: 1, emoji: '😞', label: 'Struggling', color: '#ef4444' },
  { value: 2, emoji: '😕', label: 'Low',        color: '#f97316' },
  { value: 3, emoji: '😐', label: 'Okay',       color: '#eab308' },
  { value: 4, emoji: '🙂', label: 'Good',       color: '#84cc16' },
  { value: 5, emoji: '😊', label: 'Happy',      color: '#22c55e' },
  { value: 6, emoji: '😄', label: 'Amazing',    color: '#3AA76D' },
]

// available quick mood tags students can pick from
const TAGS = [
  'exam', 'sleep', 'stressed', 'tired',
  'happy', 'anxious', 'motivated', 'lonely',
]

// eslint-disable-next-line no-unused-vars
export default function MoodCheckIn({ user }) {
  const [moodValue, setMoodValue] = useState(3) // slider starts at middle
  const [selectedTags, setSelectedTags] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // get the mood object that matches current slider value
  const currentMood = MOOD_LEVELS.find((m) => m.value === moodValue)

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag)
      if (prev.length >= 3) return prev
      return [...prev, tag]
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await API.post('/mood/checkin', {
        mood_value: moodValue,
        tags: selectedTags,
        note: '',
      })
      setSubmitted(true)
    } catch (err) {
      setError('Could not save check-in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // animated success state
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          className="flex justify-center mb-3"
        >
          <CheckCircle2 size={48} style={{ color: '#3AA76D' }} />
        </motion.div>
        <p className="font-bold text-gray-800 text-lg">Check-in saved!</p>
        <p className="text-sm text-gray-400 mt-1">
          Your reflection is being prepared...
        </p>
      </motion.div>
    )
  }

  // compute slider fill percentage for gradient background
  const fillPercent = ((moodValue - 1) / 5) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      {/* heading */}
      <p className="text-lg font-bold" style={{ color: '#253244' }}>
        How are you right now?
      </p>
      <p className="text-sm text-gray-400 mt-1 mb-5">
        One quick check helps notice patterns.
      </p>

      {/* animated mood label + emoji */}
      <div className="flex flex-col items-center gap-2 mb-5">
        {/* label crossfades when value crosses a level boundary */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMood.label}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="text-lg font-bold tracking-wide"
            style={{ color: currentMood.color }}
          >
            {currentMood.label}
          </motion.p>
        </AnimatePresence>

        {/* emoji spring-bounces when mood level changes */}
        <AnimatePresence mode="wait">
          <motion.span
            key={currentMood.emoji}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-5xl"
          >
            {currentMood.emoji}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* mood slider with colored fill */}
      <div className="mb-2">
      <input
  type="range"
  min="1"
  max="6"
  value={moodValue}
  onChange={(e) => setMoodValue(Number(e.target.value))}
  style={{
    background: `linear-gradient(to right, #3AA76D 0%, #3AA76D ${fillPercent}%, #e5e7eb ${fillPercent}%, #e5e7eb 100%)`,
  }}
  className="w-full h-3 rounded-full appearance-none cursor-pointer outline-none"
/>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Not great</span>
          <span>Amazing</span>
        </div>
      </div>

      {/* tag selection */}
      <div className="mt-5 mb-5">
        <p className="text-sm font-medium text-gray-600 mb-2">
          What's happening?
          <span className="text-gray-400"> (Pick up to 3)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <motion.button
                key={tag}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTag(tag)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150"
                style={{
                  backgroundColor: isSelected ? '#3AA76D' : 'white',
                  color: isSelected ? 'white' : '#6b7280',
                  borderColor: isSelected ? '#3AA76D' : '#e5e7eb',
                  boxShadow: isSelected
                    ? '0 2px 4px rgba(58, 167, 109, 0.3)'
                    : '0 1px 2px rgba(0, 0, 0, 0.03)',
                }}
              >
                {tag}
              </motion.button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}

      {/* action buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #3AA76D 0%, #88C0F7 100%)',
          }}
        >
          <Sparkles size={18} />
          {loading ? 'Saving...' : 'Reflect'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
          title="Add journal entry"
        >
          <BookPlus size={18} />
        </motion.button>
      </div>
    </motion.div>
  )
}