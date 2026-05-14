/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, ArrowRight, UserPlus, Bell } from 'lucide-react'
import API from '../../api/axios'

// Mapping from your Circle.jsx logic
const MOOD_EMOJI = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😊', 6: '😄' }
const MOOD_COLOR = {
  1: 'bg-red-100 text-red-600',
  2: 'bg-orange-100 text-orange-600',
  3: 'bg-amber-100 text-amber-600',
  4: 'bg-lime-100 text-lime-600',
  5: 'bg-green-100 text-green-600',
  6: 'bg-emerald-100 text-emerald-600'
}

export default function MoodCircle({ refreshKey }) {
  const [feed, setFeed] = useState([])
  const [requestCount, setRequestCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCirclePreview = async () => {
      try {
        const [feedRes, reqRes] = await Promise.all([
          API.get('/circle/feed'),
          API.get('/circle/requests')
        ])
        // Show only top 5 most recent for the dashboard preview
        setFeed(feedRes.data.slice(0, 8))
        setRequestCount(reqRes.data.length)
      } catch (err) {
        console.error('Mood Circle preview error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCirclePreview()
  }, [refreshKey])

  if (loading) return (
    <div className="h-40 w-full bg-white rounded-[2rem] animate-pulse border border-stone-100" />
  )

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100/50">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 leading-none">Mood Circle</h2>
            {requestCount > 0 && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                <Bell size={10} fill="currentColor" /> {requestCount} New Requests
              </span>
            )}
          </div>
        </div>
        
        <Link 
          to="/circle" 
          className="p-2 text-stone-400 hover:text-green-600 transition-colors"
        >
          <ArrowRight size={20} />
        </Link>
      </div>

      {/* Horizontal Feed */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        {feed.length === 0 ? (
          <Link 
            to="/circle" 
            className="w-full flex items-center justify-center gap-3 py-6 border-2 border-dashed border-stone-100 rounded-2xl text-stone-400 hover:border-green-200 hover:text-green-600 transition-all group"
          >
            <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold">Invite friends to your circle</span>
          </Link>
        ) : (
          feed.map((share, idx) => (
            <motion.div
              key={share.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="relative">
                {/* Avatar with Initials */}
                <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-sm border-2 border-white shadow-sm transition-transform group-active:scale-95">
                  {share.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                
                {/* Floating Mood Indicator */}
                <div className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-sm shadow-sm ${MOOD_COLOR[share.mood_value] || 'bg-stone-100'}`}>
                  {MOOD_EMOJI[share.mood_value]}
                </div>
              </div>
              <span className="text-[11px] font-bold text-stone-500 truncate w-14 text-center">
                {share.name.split(' ')[0]}
              </span>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Interaction Footer */}
      {feed.length > 0 && (
        <div className="mt-6 pt-4 border-t border-stone-50">
          <Link 
            to="/circle" 
            className="w-full flex items-center justify-center py-3 bg-stone-50 rounded-xl text-xs font-bold text-stone-600 hover:bg-green-50 hover:text-green-700 transition-all"
          >
            View All Updates
          </Link>
        </div>
      )}
    </div>
  )
}