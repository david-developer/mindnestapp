/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Calendar, LogOut, BarChart3, BookOpen, Flame,
  Settings, Shield, HelpCircle, ChevronRight, Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import BottomNav from '../components/dashboard/BottomNav'

export default function Profile() {
  const { logout, user: authUser } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile')
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // get the first 2 initials for avatar circle
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // format date as "Joined April 2026"
  const formatJoinDate = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FBFBFD' }}>
        <p className="text-gray-400">Loading profile...</p>
      </div>
    )
  }

  const user = data?.user || authUser
  const stats = data?.stats || { total_checkins: 0, total_entries: 0, active_days: 0 }

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
            <User size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#253244' }}>Profile</h1>
            <p className="text-xs text-gray-400">Account & settings</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* identity card with avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
        >
          {/* decorative gradient blob */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
            style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
          />

          <div className="relative z-10 flex items-center gap-4">
            {/* avatar with initials */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
            >
              <span className="text-2xl font-bold text-white">
                {getInitials(user?.name)}
              </span>
            </motion.div>

            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold truncate" style={{ color: '#253244' }}>
                {user?.name || 'User'}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5 truncate">
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              {user?.created_at && (
                <p className="text-xs text-gray-400 mt-2 inline-flex items-center gap-1">
                  <Sparkles size={12} />
                  Joined {formatJoinDate(user.created_at)}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <StatBox
            icon={<BarChart3 size={18} />}
            value={stats.total_checkins}
            label="Check-ins"
            color="#3AA76D"
          />
          <StatBox
            icon={<BookOpen size={18} />}
            value={stats.total_entries}
            label="Entries"
            color="#88C0F7"
          />
          <StatBox
            icon={<Flame size={18} />}
            value={stats.active_days}
            label="Active days"
            color="#F5A623"
          />
        </motion.div>

        {/* settings sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <SettingRow
            icon={<Settings size={18} />}
            label="Account Settings"
            description="Edit your name, email, password"
            disabled
          />
          <SettingRow
            icon={<Shield size={18} />}
            label="Privacy & Data"
            description="Manage data sharing and exports"
            disabled
          />
          <SettingRow
            icon={<HelpCircle size={18} />}
            label="Help & About"
            description="Support, terms, version info"
            disabled
            isLast
          />
        </motion.div>

        {/* logout section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-center gap-2 hover:bg-red-50 transition group"
            >
              <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition" />
              <span className="font-medium text-gray-600 group-hover:text-red-500 transition">
                Log out
              </span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border-2"
              style={{ borderColor: '#FCA5A5' }}
            >
              <p className="font-semibold text-gray-800 text-center mb-1">
                Log out?
              </p>
              <p className="text-sm text-gray-500 text-center mb-4">
                You'll need to sign in again next time.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold shadow-md"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  Log out
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* version footer */}
        <p className="text-center text-xs text-gray-400 pt-2">
          MindNest · Prototype v0.1
        </p>
      </div>

      <BottomNav />
    </div>
  )
}

// stat tile used in the 3-column row
function StatBox({ icon, value, label, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
      <div className="flex justify-center mb-1.5" style={{ color }}>
        {icon}
      </div>
      <p className="text-xl font-bold" style={{ color: '#253244' }}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

// row used in settings list
function SettingRow({ icon, label, description, disabled, isLast }) {
  return (
    <button
      disabled={disabled}
      className={`w-full p-4 flex items-center gap-3 transition ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'
      } ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#F0FDF4', color: '#3AA76D' }}
      >
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#253244' }}>
          {label}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {description}
          {disabled && ' · Coming soon'}
        </p>
      </div>
      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </button>
  )
}