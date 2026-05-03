import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'

const STORAGE_KEY = 'mindnest_install_dismissed'

export default function InstallPrompt() {
  // the deferred install event from the browser
  const [installEvent, setInstallEvent] = useState(null)
  // whether to show the banner
  const [show, setShow] = useState(false)

  useEffect(() => {
    // user already dismissed? respect their choice forever
    if (localStorage.getItem(STORAGE_KEY) === 'true') return

    // listener for the browser's beforeinstallprompt event
    // this fires when the browser thinks the app can be installed
    const handler = (e) => {
      // prevent the default Chrome mini-infobar
      e.preventDefault()
      // save the event so we can trigger it later
      setInstallEvent(e)
      // wait 3 seconds before showing - don't bombard new users
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // also hide if app is already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShow(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return

    // show the native install prompt
    installEvent.prompt()

    // wait for user's choice
    const { outcome } = await installEvent.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted PWA install')
    }

    // either way, hide the banner and don't show again
    localStorage.setItem(STORAGE_KEY, 'true')
    setInstallEvent(null)
    setShow(false)
  }

  const handleDismiss = () => {
    // remember the dismissal forever
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
  }

  // don't render anything if not ready or already installed
  if (!show || !installEvent) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-4 shadow-md border-2 relative overflow-hidden"
        style={{
          backgroundColor: 'white',
          borderColor: '#3AA76D',
        }}
      >
        {/* decorative gradient blob */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
        />

        {/* dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="relative z-10 flex items-center gap-3 pr-6">
          {/* gradient icon bubble */}
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
          >
            <Smartphone size={22} className="text-white" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm" style={{ color: '#253244' }}>
              Install MindNest
            </p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5">
              Add to your home screen for quick check-ins.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleInstall}
            className="shrink-0 px-3 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
            style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
          >
            <Download size={14} />
            Install
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}