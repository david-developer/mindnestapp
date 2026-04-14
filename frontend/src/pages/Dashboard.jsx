import { useAuth } from "../context/AuthContext";
import Header from '../components/dashboard/Header'
import BottomNav from '../components/dashboard/BottomNav'
import MoodCheckIn from '../components/dashboard/MoodCheckIn'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    // overall page background using design system color

    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#FBFBFD'}}>

    {/* Sticly header*/}
    <Header user={user} />

    {/* Main scrollable content */}
    <main className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-4">
      <MoodCheckIn user={user} />
    </main>

    {/*fixed bottom navigation bar */}
    <BottomNav />
  </div>
  )
}