import { useAuth } from "../../context/AuthContext"
import { Plus, BookOpen, Share2, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

// returns greeting based on current time of day
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Morning"
  if (hour < 17) return "Afternoon"
  return "Evening"
}

export default function Header({ user, streak = 0 }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  // get just the first name for the greeting
  const firstName = user?.name?.split(' ')[0] || 'Friend'

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
        <button
          onClick={logout}
          aria-label="Logout"
          className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
        </button>
      </div>
    </motion.header>
  )
}