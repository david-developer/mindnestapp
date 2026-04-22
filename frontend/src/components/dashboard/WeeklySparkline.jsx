/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import API from '../../api/axios'

export default function WeeklySparkline() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeekly()
  }, [])

  const fetchWeekly = async () => {
    try {
      const res = await API.get('/mood/weekly')
      // transform raw database rows into chart-friendly format
      const chartData = buildWeekArray(res.data)
      setData(chartData)
    } catch (err) {
      console.error('Failed to fetch weekly mood:', err)
    } finally {
      setLoading(false)
    }
  }

  // build an array of 7 days ending today, filling missing days with null
  const buildWeekArray = (rawData) => {
    const week = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // loop backwards from 6 days ago to today
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today)
      day.setDate(day.getDate() - i)

      // find matching entry from backend if exists
      const match = rawData.find(d => {
        const rowDate = new Date(d.day)
        return rowDate.toDateString() === day.toDateString()
      })

      week.push({
        // short day label like "Mon"
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        // mood value (null if no check-in that day)
        mood: match ? Number(match.avg_mood) : null,
      })
    }

    return week
  }

  // calculate average mood across filled days
const filledDays = data.filter(d => d.mood !== null)
const avgValue = filledDays.length
  ? filledDays.reduce((sum, d) => sum + d.mood, 0) / filledDays.length
  : null

// map average value to mood word + emoji for display
const getMoodLabel = (value) => {
  if (value === null) return { label: '—', emoji: '', color: '#9ca3af' }
  if (value < 1.5) return { label: 'Struggling', emoji: '😞', color: '#ef4444' }
  if (value < 2.5) return { label: 'Low',        emoji: '😕', color: '#f97316' }
  if (value < 3.5) return { label: 'Okay',       emoji: '😐', color: '#eab308' }
  if (value < 4.5) return { label: 'Good',       emoji: '🙂', color: '#22c55e' }
  if (value < 5.5) return { label: 'Happy',      emoji: '😊', color: '#22c55e' }
  return { label: 'Amazing', emoji: '😄', color: '#3AA76D' }
}

const moodSummary = getMoodLabel(avgValue)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      {/* card header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} style={{ color: '#3AA76D' }} />
          <h3 className="font-bold" style={{ color: '#253244' }}>
            Weekly Mood
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
  <span className="text-xs text-gray-400">This week:</span>
  <span
    className="text-sm font-semibold"
    style={{ color: moodSummary.color }}
  >
    {moodSummary.label} {moodSummary.emoji}
  </span>
</div>
      </div>

      {/* empty state */}
      {loading ? (
        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
          Loading...
        </div>
      ) : filledDays.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-gray-400 text-sm text-center px-4">
          Start checking in daily — your mood trend will appear here.
        </div>
      ) : (
        <div className="h-32 -mx-2">
          {/* ResponsiveContainer makes chart adapt to parent width */}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              {/* gradient fill under the line */}
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3AA76D" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3AA76D" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <YAxis hide domain={[1, 6]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => [value, 'Mood']}
              />

              {/* line + filled area below it */}
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#3AA76D"
                strokeWidth={2.5}
                fill="url(#moodGradient)"
                // show dot only on days with data
                dot={{ fill: '#3AA76D', r: 4, strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* subtle expand hint */}
      <p className="text-xs text-gray-400 text-center mt-2">
        Tap a point to see that day
      </p>
    </motion.div>
  )
}