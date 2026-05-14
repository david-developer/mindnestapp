import { useState } from 'react'
import { useAuth } from "../context/AuthContext"
import Header from '../components/dashboard/Header'
import BottomNav from '../components/dashboard/BottomNav'
import InstallPrompt from '../components/InstallPrompt'
import MoodCheckIn from '../components/dashboard/MoodCheckIn'
import WeeklySparkline from '../components/dashboard/WeeklySparkline'
import ProgressRewards from '../components/dashboard/ProgressRewards'
import ResourcesHelp from '../components/dashboard/ResourcesHelp'
import AIReflection from '../components/dashboard/AIReflection'
import CrisisCard from '../components/dashboard/CrisisCard'
import CounselorNudge from '../components/dashboard/CounselorNudge'
import MoodCircle from '../components/dashboard/MoodCircle'

export default function Dashboard() {
  const { user } = useAuth()

  // shared reflection state
  const [reflection, setReflection] = useState(null)
const [isCrisis, setIsCrisis] = useState(false)
const [isReflectionLoading, setIsReflectionLoading] = useState(false)
// keep context from the check-in so AIReflection can save a full entry
const [reflectionContext, setReflectionContext] = useState({
  note: '',
  moodValue: null,
  tags: [],
})

  // refresh counter - increments after each check-in
  // any component that depends on it re-fetches its data
  const [refreshKey, setRefreshKey] = useState(0)

  const handleReflectionResult = ({ reflection, isCrisis, loading, context }) => {
    if (loading !== undefined) setIsReflectionLoading(loading)
    if (reflection !== undefined) setReflection(reflection)
    if (isCrisis !== undefined) setIsCrisis(isCrisis)
    if (context) setReflectionContext(context)
  }

  // called by MoodCheckIn after a successful check-in
  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBFBFD' }}>
      <Header user={user} refreshKey={refreshKey} />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-4">
        <InstallPrompt />
        <MoodCheckIn
          user={user}
          onReflectionResult={handleReflectionResult}
          onCheckinSuccess={triggerRefresh}
        />

        {isCrisis && <CrisisCard />}
        {!isCrisis && (reflection || isReflectionLoading) && (
          <AIReflection
          reflection={reflection}
          loading={isReflectionLoading}
          userNote={reflectionContext.note}
          moodValue={reflectionContext.moodValue}
          selectedTags={reflectionContext.tags}
        />
      )}

        <CounselorNudge refreshKey={refreshKey} />

        <WeeklySparkline refreshKey={refreshKey} />
        <ProgressRewards refreshKey={refreshKey} />
        <MoodCircle refreshKey={refreshKey} />
        <ResourcesHelp />
      </main>

      <BottomNav />
    </div>
  )
}