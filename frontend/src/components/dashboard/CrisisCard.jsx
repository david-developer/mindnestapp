/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion'
import { AlertCircle, Phone, MessageSquare, Heart } from 'lucide-react'

// Turkish + international crisis resources
// these are intentionally hardcoded for safety - never coming from API
const CRISIS_LINES = [
  {
    title: 'Emergency / Ambulance',
    description: '112 - 24/7 medical emergency',
    target: '112',
    action: 'call',
    icon: Phone,
  },
  {
    title: 'Social Support Line',
    description: '183 - Family, Women & Child Support',
    target: '183',
    action: 'call',
    icon: Phone,
  },
  {
    title: 'Crisis Text Line',
    description: 'Free 24/7 text support',
    target: '741741',
    action: 'sms',
    icon: MessageSquare,
  },
]

export default function CrisisCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-5 shadow-md border-2"
      style={{
        backgroundColor: '#FEF2F2',
        borderColor: '#FCA5A5',
      }}
    >
      {/* header */}
      <div className="flex items-start gap-3 mb-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#ef4444' }}
        >
          <Heart size={20} className="text-white" fill="white" />
        </motion.div>
        <div className="min-w-0">
          <p className="font-bold text-base" style={{ color: '#253244' }}>
            We hear you
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-1">
            What you're feeling matters. Please reach out to someone trained
            to support you right now — you don't have to go through this alone.
          </p>
        </div>
      </div>

      {/* crisis line buttons */}
      <div className="space-y-2 mb-4">
        {CRISIS_LINES.map((line, idx) => {
          const Icon = line.icon
          const href = line.action === 'call' ? `tel:${line.target}` : `sms:${line.target}`

          return (
            <motion.a
              key={line.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              href={href}
              className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 hover:shadow-md transition"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: '#253244' }}>
                  {line.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {line.description}
                </p>
              </div>
              <div
                className="shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: '#ef4444' }}
              >
                <Icon size={18} />
              </div>
            </motion.a>
          )
        })}
      </div>

      {/* gentle reassurance footer */}
      <div className="flex items-start gap-2 pt-3 border-t" style={{ borderColor: '#FCA5A5' }}>
        <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
        <p className="text-xs text-gray-600 leading-relaxed">
          MindNest is a non-clinical companion. If you're in immediate danger,
          please contact emergency services right away.
        </p>
      </div>
    </motion.div>
  )
}