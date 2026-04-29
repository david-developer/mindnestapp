import { useState } from 'react'
import { useAuth } from "../context/AuthContext"
import Header from '../components/dashboard/Header'
import BottomNav from '../components/dashboard/BottomNav'
import MoodCheckIn from '../components/dashboard/MoodCheckIn'
import WeeklySparkline from '../components/dashboard/WeeklySparkline'
import ProgressRewards from '../components/dashboard/ProgressRewards'
import ResourcesHelp from '../components/dashboard/ResourcesHelp'
import AIReflection from '../components/dashboard/AIReflection'
import CrisisCard from '../components/dashboard/CrisisCard'
import CounselorNudge from '../components/dashboard/CounselorNudge'

export default function Dashboard() {
  const { user } = useAuth()

  // shared reflection state
  const [reflection, setReflection] = useState(null)
  const [isCrisis, setIsCrisis] = useState(false)
  const [isReflectionLoading, setIsReflectionLoading] = useState(false)

  // refresh counter - increments after each check-in
  // any component that depends on it re-fetches its data
  const [refreshKey, setRefreshKey] = useState(0)

  const handleReflectionResult = ({ reflection, isCrisis, loading }) => {
    if (loading !== undefined) setIsReflectionLoading(loading)
    if (reflection !== undefined) setReflection(reflection)
    if (isCrisis !== undefined) setIsCrisis(isCrisis)
  }

  // called by MoodCheckIn after a successful check-in
  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBFBFD' }}>
      <Header user={user} refreshKey={refreshKey} />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-4">
        <MoodCheckIn
          user={user}
          onReflectionResult={handleReflectionResult}
          onCheckinSuccess={triggerRefresh}
        />

        {isCrisis && <CrisisCard />}
        {!isCrisis && (reflection || isReflectionLoading) && (
          <AIReflection reflection={reflection} loading={isReflectionLoading} />
        )}

        <CounselorNudge refreshKey={refreshKey} />

        <WeeklySparkline refreshKey={refreshKey} />
        <ProgressRewards refreshKey={refreshKey} />
        <ResourcesHelp />
      </main>

      <BottomNav />
    </div>
  )
}