/* eslint-disable no-unused-vars */
import { useState, useEffect} from "react"
import { useAuth } from "../../context/AuthContext"
import { Plus, BookOpen, Share2, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import API from '../../api/axios'


// returns greeting based on current time of day
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Morning"
  if (hour < 17) return "Afternoon"
  return "Evening"
}

export default function Header({ user, refreshKey }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [streak, setStreak] = useState(0)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    API.get('/mood/streak')
        .then(res => setStreak(res.data.streak))
        .catch(() => setStreak(0))
  }, [refreshKey])

  // get just the first name for the greeting
  const firstName = user?.name?.split(' ')[0] || 'Friend'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    // backdrop-blur creates the glassmorphism effect from the spec
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-gray-100 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(251, 251, 253, 0.85)' }}
    >
      {/* left side: greeting + streak badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">
            {getGreeting()}, <span className="font-semibold" style={{ color: '#253244' }}>
              {firstName}
            </span>
          </p>
        </div>

        {/* streak badge with gradient */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
        >
          <span>🔥</span>
          <span>{streak} {streak === 1 ? 'day' : 'days'}</span>
        </motion.div>
      </div>

      {/* right side: quick action icons */}
      <div className="flex items-center gap-1">
        {/* check-in quick action */}
        <button
          onClick={() => navigate('/circle')}
          aria-label="Check-in"
          className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition"
        >
          <Plus size={20} />
        </button>

        {/* journal quick action */}
        <button
          onClick={() => navigate('/journal')}
          aria-label="Journal"
          className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition"
        >
          <BookOpen size={20} />
        </button>

        {/* share mood (placeholder for mood circle) */}
        <button
          
          aria-label="Share Mood"
          className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition"
        >
          <Share2 size={20} />
        </button> 

        {/* logout */}
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
        
      </div>
    </motion.header>
  )
}