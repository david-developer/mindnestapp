/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Tag, Calendar, BarChart3, Sparkles, Activity, Target,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts'
import API from '../api/axios'
import BottomNav from '../components/dashboard/BottomNav'

// reused mood mapping for label/emoji/color
const MOOD_INFO = (value) => {
  if (value === null || value === undefined) return { label: '—', emoji: '', color: '#9ca3af' }
  if (value < 1.5) return { label: 'Struggling', emoji: '😞', color: '#ef4444' }
  if (value < 2.5) return { label: 'Low',        emoji: '😕', color: '#f97316' }
  if (value < 3.5) return { label: 'Okay',       emoji: '😐', color: '#eab308' }
  if (value < 4.5) return { label: 'Good',       emoji: '🙂', color: '#84cc16' }
  if (value < 5.5) return { label: 'Happy',      emoji: '😊', color: '#22c55e' }
  return { label: 'Amazing', emoji: '😄', color: '#3AA76D' }
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Insights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeRange, setActiveRange] = useState('30d')

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const res = await API.get('/mood/insights')
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch insights:', err)
    } finally {
      setLoading(false)
    }
  }

  // build monthly chart data filling missing days with null
  const buildMonthlyData = () => {
    if (!data?.monthly) return []
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // build 30-day window ending today
    for (let i = 29; i >= 0; i--) {
      const day = new Date(today)
      day.setDate(day.getDate() - i)

      const match = data.monthly.find(d => {
        const rowDate = new Date(d.day)
        return rowDate.toDateString() === day.toDateString()
      })

      days.push({
        date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        shortLabel: day.getDate(),
        mood: match ? Number(match.avg_mood) : null,
        count: match ? Number(match.checkin_count) : 0,
      })
    }
    return days
  }

  // build day-of-week chart data normalizing to 7 days
  const buildActivityData = () => {
    if (!data?.activity) return DAYS_OF_WEEK.map((d, i) => ({
      day: d, count: 0, avg_mood: 0, dayIndex: i,
    }))

    return DAYS_OF_WEEK.map((day, i) => {
      const match = data.activity.find(a => a.day_of_week === i)
      return {
        day,
        count: match ? Number(match.count) : 0,
        avg_mood: match ? Number(match.avg_mood) : 0,
        dayIndex: i,
      }
    })
  }

  // build top tags chart data
  const buildTagsData = () => {
    if (!data?.topTags) return []
    return data.topTags.map(t => ({
      tag: t.tag,
      count: Number(t.count),
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FBFBFD' }}>
        <p className="text-gray-400">Loading insights...</p>
      </div>
    )
  }

  const totalCheckins = Number(data?.stats?.total_checkins || 0)
  const overallAvg = Number(data?.stats?.overall_avg || 0)
  const overallMood = MOOD_INFO(overallAvg)

  // empty state
  if (totalCheckins === 0) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: '#FBFBFD' }}>
        <div className="max-w-lg mx-auto px-4 pt-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#253244' }}>Insights</h1>
          <p className="text-sm text-gray-400 mb-6">Patterns from your check-ins</p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
            >
              <BarChart3 size={28} className="text-white" />
            </div>
            <p className="font-bold text-gray-800 text-lg">No insights yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Once you start checking in daily, your patterns and trends will appear here.
            </p>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    )
  }

  const monthlyData = buildMonthlyData()
  const activityData = buildActivityData()
  const tagsData = buildTagsData()
  const filledMonthlyDays = monthlyData.filter(d => d.mood !== null)

  // most active day calculation
  const mostActiveDay = activityData.reduce((max, day) =>
    day.count > max.count ? day : max, activityData[0])

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
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#253244' }}>Insights</h1>
            <p className="text-xs text-gray-400">Patterns from your check-ins</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* overall summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden"
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
          />

          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Overall Mood
            </p>

            <div className="flex items-center gap-4">
              <span className="text-5xl">{overallMood.emoji}</span>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: overallMood.color }}
                >
                  {overallMood.label}
                </p>
                <p className="text-sm text-gray-500">
                  Across {totalCheckins} check-in{totalCheckins !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* monthly trend card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} style={{ color: '#3AA76D' }} />
              <h3 className="font-bold" style={{ color: '#253244' }}>30-Day Trend</h3>
            </div>
            <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-100">
              {filledMonthlyDays.length} active days
            </span>
          </div>

          {filledMonthlyDays.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              Not enough data for the last 30 days yet
            </div>
          ) : (
            <div className="h-40 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3AA76D" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3AA76D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="shortLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    interval={4}
                  />
                  <YAxis hide domain={[1, 6]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [
                      value ? `${value} (${MOOD_INFO(value).label})` : '—',
                      'Mood',
                    ]}
                    labelFormatter={(label, payload) =>
                      payload && payload[0] ? payload[0].payload.date : label
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#3AA76D"
                    strokeWidth={2.5}
                    fill="url(#monthlyGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#3AA76D', stroke: 'white', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* top tags card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag size={18} style={{ color: '#3AA76D' }} />
            <h3 className="font-bold" style={{ color: '#253244' }}>Top Tags</h3>
          </div>

          {tagsData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Add tags to your check-ins to see patterns here
            </p>
          ) : (
            <div className="space-y-3">
              {tagsData.map((tag, idx) => {
                const maxCount = tagsData[0].count
                const widthPercent = (tag.count / maxCount) * 100

                return (
                  <motion.div
                    key={tag.tag}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize" style={{ color: '#253244' }}>
                        {tag.tag}
                      </span>
                      <span className="text-gray-500 font-semibold">
                        ×{tag.count}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 + idx * 0.05 }}
                        className="h-full rounded-full"
                        style={{
                          background: idx < 3
                            ? 'linear-gradient(to right, #3AA76D, #88C0F7)'
                            : '#d1d5db',
                        }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* day of week activity card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} style={{ color: '#3AA76D' }} />
              <h3 className="font-bold" style={{ color: '#253244' }}>Activity by Day</h3>
            </div>
            {mostActiveDay.count > 0 && (
              <span className="text-xs text-gray-500">
                Most active: <span className="font-semibold" style={{ color: '#3AA76D' }}>
                  {mostActiveDay.day}
                </span>
              </span>
            )}
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value, name, props) => {
                    const avg = props.payload.avg_mood
                    return avg > 0
                      ? [`${value} check-ins · avg ${MOOD_INFO(avg).label}`, '']
                      : [`${value} check-ins`, '']
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {activityData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.count === mostActiveDay.count && entry.count > 0
                        ? '#3AA76D' : '#88C0F7'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* mood distribution card - shows count per mood level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} style={{ color: '#3AA76D' }} />
            <h3 className="font-bold" style={{ color: '#253244' }}>Mood Distribution</h3>
          </div>

          {/* compute mood distribution from monthly data */}
          {(() => {
            const distribution = [1, 2, 3, 4, 5, 6].map((level) => {
              const dayCount = filledMonthlyDays.filter(d => Math.round(d.mood) === level).length
              const info = MOOD_INFO(level)
              return { level, count: dayCount, ...info }
            })
            const maxDistCount = Math.max(...distribution.map(d => d.count), 1)

            return (
              <div className="grid grid-cols-6 gap-2">
                {distribution.map((d, idx) => (
                  <motion.div
                    key={d.level}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="flex flex-col items-center gap-2"
                  >
                    {/* vertical bar */}
                    <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.count / maxDistCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 + idx * 0.05 }}
                        className="w-full rounded-lg"
                        style={{ backgroundColor: d.color }}
                      />
                    </div>
                    <span className="text-lg">{d.emoji}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{d.count}</span>
                  </motion.div>
                ))}
              </div>
            )
          })()}

          <p className="text-xs text-gray-400 text-center mt-4">
            Based on last 30 days of check-ins
          </p>
        </motion.div>

        {/* stats footer card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} style={{ color: '#3AA76D' }} />
            <h3 className="font-bold" style={{ color: '#253244' }}>Quick Facts</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FactCard
              icon={<Target size={16} />}
              label="Total check-ins"
              value={totalCheckins}
            />
            <FactCard
              icon={<TrendingUp size={16} />}
              label="Active days"
              value={`${filledMonthlyDays.length}/30`}
            />
            <FactCard
              icon={<Tag size={16} />}
              label="Different tags"
              value={tagsData.length}
            />
            <FactCard
              icon={<Calendar size={16} />}
              label="Most active"
              value={mostActiveDay.count > 0 ? mostActiveDay.day : '—'}
            />
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}

// small reusable fact card for the bottom stats grid
function FactCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-lg font-bold" style={{ color: '#253244' }}>
        {value}
      </p>
    </div>
  )
}