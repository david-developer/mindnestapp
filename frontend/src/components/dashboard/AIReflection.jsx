/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookmarkPlus, Heart, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AIReflection({ reflection, loading }) {
  // typewriter effect: progressively reveal the text character by character
  const [displayText, setDisplayText] = useState('')
  const [isMarkedHelpful, setIsMarkedHelpful] = useState(false)

  useEffect(() => {
    if (!reflection) {
      setDisplayText('')
      return
    }
    // reset and animate fresh each time reflection changes
    setDisplayText('')
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayText(reflection.slice(0, i))
      if (i >= reflection.length) clearInterval(interval)
    }, 15) // 15ms per character feels natural

    return () => clearInterval(interval)
  }, [reflection])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border overflow-hidden relative"
      style={{ borderColor: 'rgba(58, 167, 109, 0.2)' }}
    >
      {/* subtle gradient blob in corner */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
      />

      <div className="relative z-10">
        {/* companion avatar + label */}
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
          >
            <Sparkles size={14} className="text-white" />
          </motion.div>
          <p className="text-sm font-semibold" style={{ color: '#253244' }}>
            Companion
          </p>
        </div>

        {/* reflection content */}
        {loading ? (
          // animated dots while waiting for AI response
          <div className="flex items-center gap-1 py-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#3AA76D' }}
              />
            ))}
            <span className="text-sm text-gray-400 ml-2">
              Reflecting on your check-in...
            </span>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4 min-h-[60px]">
              {displayText}
              {/* blinking cursor while typing */}
              {displayText.length < (reflection?.length || 0) && (
                <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse" />
              )}
            </p>

            {/* action buttons - only show after typewriter finishes */}
            <AnimatePresence>
              {displayText.length === (reflection?.length || 0) && reflection && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 flex-wrap"
                >
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    <BookmarkPlus size={14} />
                    Save to Journal
                  </button>

                  <button
                    onClick={() => setIsMarkedHelpful((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition"
                    style={{
                      borderColor: isMarkedHelpful ? '#3AA76D' : '#e5e7eb',
                      color: isMarkedHelpful ? '#3AA76D' : '#6b7280',
                      backgroundColor: isMarkedHelpful ? 'rgba(58, 167, 109, 0.05)' : 'white',
                    }}
                  >
                    <Heart
                      size={14}
                      fill={isMarkedHelpful ? '#3AA76D' : 'none'}
                    />
                    {isMarkedHelpful ? 'Helpful' : 'Mark Helpful'}
                  </button>

                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    <MessageCircle size={14} />
                    Discuss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  )
}