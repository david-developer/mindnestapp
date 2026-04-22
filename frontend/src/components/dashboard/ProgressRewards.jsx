/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Trophy, Star } from 'lucide-react'
import API from '../../api/axios'

// badge definitions with unlock conditions
const BADGES = [
  { id: 'first',      name: 'First',     icon: '🎯', requiresCheckins: 1 },
  { id: 'week',       name: 'Week',      icon: '📅', requiresStreak: 7 },
  { id: 'month',      name: 'Month',     icon: '🌟', requiresStreak: 30 },
  { id: 'consistent', name: 'Consistent',icon: '💪', requiresCheckins: 20 },
  { id: 'helper',     name: 'Helper',    icon: '🤝', requiresCheckins: 50 },
  { id: 'journaler',  name: 'Journaler', icon: '📝', requiresCheckins: 10 },
  { id: 'resilient',  name: 'Resilient', icon: '🛡️', requiresStreak: 14 },
  { id: 'champion',   name: 'Champion',  icon: '🏆', requiresCheckins: 100 },
]

export default function ProgressRewards() {
  const [streak, setStreak] = useState(0)
  const [totalCheckins, setTotalCheckins] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await API.get('/mood/streak')
      setStreak(res.data.streak)
      setTotalCheckins(res.data.total_checkins)
    } catch (err) {
      console.error('Failed to fetch streak:', err)
    } finally {
      setLoading(false)
    }
  }

  // determine which badges are unlocked
  const badgesWithStatus = BADGES.map(badge => ({
    ...badge,
    unlocked:
      (badge.requiresStreak && streak >= badge.requiresStreak) ||
      (badge.requiresCheckins && totalCheckins >= badge.requiresCheckins),
  }))

  const unlockedCount = badgesWithStatus.filter(b => b.unlocked).length

  // progress toward next milestone (every 10 check-ins)
  const nextMilestone = Math.ceil((totalCheckins + 1) / 10) * 10
  const progressToNext = ((totalCheckins % 10) / 10) * 100

  // streak ring math - show progress toward 30 day milestone
  const streakPercentage = Math.min((streak / 30) * 100, 100)
  const strokeDasharray = 2 * Math.PI * 45
  const strokeDashoffset = strokeDasharray - (streakPercentage / 100) * strokeDasharray

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5"
    >
      <h3 className="font-bold" style={{ color: '#253244' }}>
        Progress & Rewards
      </h3>

      {/* streak ring + message */}
      <div className="flex items-center gap-6">
        {/* SVG circle showing streak progress */}
        <div className="relative shrink-0">
          <svg className="w-28 h-28 -rotate-90">
            {/* background ring */}
            <circle cx="56" cy="56" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            {/* animated progress ring */}
            <motion.circle
              cx="56"
              cy="56"
              r="45"
              fill="none"
              stroke="url(#streakGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: strokeDasharray }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            {/* gradient definition referenced above */}
            <defs>
              <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3AA76D" />
                <stop offset="100%" stopColor="#88C0F7" />
              </linearGradient>
            </defs>
          </svg>

          {/* text sits on top of the ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame size={18} style={{ color: '#F5A623' }} />
            <p className="text-2xl font-bold" style={{ color: '#253244' }}>
              {streak}
            </p>
            <p className="text-xs text-gray-400">days</p>
          </div>
        </div>

        {/* right side: motivational message + progress bar */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-2 leading-snug">
            {streak > 0
              ? `Nice! ${streak} day${streak !== 1 ? 's' : ''} in a row — small & steady.`
              : `Check in today to start your streak!`}
          </p>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{totalCheckins} check-ins</span>
              <span>Next: {nextMilestone}</span>
            </div>
            {/* progress bar showing proximity to next milestone */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: '#3AA76D' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* badges section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Badges</p>
          <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-100">
            {unlockedCount}/{BADGES.length}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {badgesWithStatus.map((badge, idx) => (
            <motion.button
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              disabled={!badge.unlocked}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
              style={{
                background: badge.unlocked
                  ? 'linear-gradient(135deg, #3AA76D, #88C0F7)'
                  : '#f3f4f6',
                opacity: badge.unlocked ? 1 : 0.5,
                cursor: badge.unlocked ? 'pointer' : 'not-allowed',
              }}
              aria-label={badge.name}
            >
              <span className="text-xl" style={{ filter: badge.unlocked ? 'none' : 'grayscale(1)' }}>
                {badge.icon}
              </span>
              <span
                className="text-[10px] font-medium"
                style={{ color: badge.unlocked ? 'white' : '#9ca3af' }}
              >
                {badge.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* stats strip */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
        <div className="text-center">
          <Trophy size={18} className="mx-auto mb-1" style={{ color: '#F5A623' }} />
          <p className="text-lg font-bold" style={{ color: '#253244' }}>{totalCheckins}</p>
          <p className="text-xs text-gray-400">Check-ins</p>
        </div>
        <div className="text-center">
          <Flame size={18} className="mx-auto mb-1" style={{ color: '#3AA76D' }} />
          <p className="text-lg font-bold" style={{ color: '#253244' }}>{streak}</p>
          <p className="text-xs text-gray-400">Day Streak</p>
        </div>
        <div className="text-center">
          <Star size={18} className="mx-auto mb-1" style={{ color: '#88C0F7' }} />
          <p className="text-lg font-bold" style={{ color: '#253244' }}>{unlockedCount}</p>
          <p className="text-xs text-gray-400">Badges</p>
        </div>
      </div>
    </motion.div>
  )
}