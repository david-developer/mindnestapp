/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartHandshake, ArrowRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

export default function CounselorNudge({ refreshKey }) {
  const navigate = useNavigate()
  const [shouldShow, setShouldShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // check whether to show on mount and when refresh triggers
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await API.get('/mood/nudge')
        setShouldShow(res.data.shouldNudge)
      } catch (err) {
        console.error(err)
      }
    }
    fetchStatus()
  }, [refreshKey])

  const handleDismiss = async () => {
    // animate out first, then call API
    setDismissed(true)
    try {
      await API.post('/mood/nudge/dismiss')
    } catch (err) {
      console.error('Could not dismiss nudge:', err)
    }
  }

  // don't render anything if we shouldn't show or user just dismissed
  if (!shouldShow || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div
          className="rounded-2xl p-5 shadow-md border-2 relative overflow-hidden"
          style={{
            backgroundColor: '#FEF7E5',
            borderColor: '#F5A623',
          }}
        >
          {/* dismiss button in corner */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/60 transition"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>

          {/* decorative gradient blob */}
          <div
            className="absolute bottom-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{ background: 'linear-gradient(135deg, #F5A623, #3AA76D)' }}
          />

          <div className="relative z-10">
            {/* header with animated icon */}
            <div className="flex items-start gap-3 mb-3">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #F5A623, #3AA76D)' }}
              >
                <HeartHandshake size={20} className="text-white" />
              </motion.div>

              <div className="flex-1 min-w-0 pr-6">
                <p className="font-bold text-base" style={{ color: '#253244' }}>
                  We notice things have been hard
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  Some days have felt heavy lately. Talking to someone trained
                  to listen can make a real difference — totally optional, totally yours.
                </p>
              </div>
            </div>

            {/* CTA button */}
            <button
              onClick={() => navigate('/counselors')}
              className="w-full mt-2 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-md"
              style={{ background: 'linear-gradient(135deg, #F5A623, #3AA76D)' }}
            >
              Browse Counselors
              <ArrowRight size={16} />
            </button>

            {/* subtle reassurance */}
            <p className="text-xs text-gray-500 text-center mt-2">
              You can dismiss this — we won't show it again for a week.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}