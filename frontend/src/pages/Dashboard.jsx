import { useAuth } from "../context/AuthContext"
import Header from '../components/dashboard/Header'
import BottomNav from '../components/dashboard/BottomNav'
import MoodCheckIn from '../components/dashboard/MoodCheckIn'
import WeeklySparkline from "../components/dashboard/WeeklySparkline"
import ProgressRewards from "../components/dashboard/ProgressRewards"

export default function Dashboard() {
  const { user } = useAuth()

  return (
    // overall page background using design system color
    <div className="min-h-screen" style={{ backgroundColor: '#FBFBFD' }}>

      {/* sticky header with streak placeholder */}
      <Header user={user} />

      {/* main scrollable content */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-4">
        <MoodCheckIn user={user} />
        <WeeklySparkline />
        <ProgressRewards />
      </main>

      {/* fixed bottom navigation bar */}
      <BottomNav />
    </div>
  )
}