/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion'
import { AlertCircle, Phone, MessageCircle, MessageSquare, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'


// hardcoded crisis resources - Turkish national lines
const CRISIS_LINES = [
    {
        id: 'crisis-call',
        title: 'Emergency / Ambulance',
        description: '112 - 24/7 medical emergency',
        action: 'call',
        target: '112',
        icon: Phone,
    },
    {
        id: 'crisis-social',
        title: 'Social Support Line',
        description: '183 - Family, Women & Child Support',
        action: 'call',
        target: '183',
        icon: Phone,
    },
    {
        id: 'crisis-text',
        title: 'Crisis Text Line',
        description: 'Free, 24/7 text support',
        action: 'sms',
        target: '741741',
        icon: MessageSquare,
    },
]

const ADDITIONAL_RESOURCES = [
    { id: 'selfcare', label: 'Self-Care Tips', href: '#' },
    { id: 'articles', label: 'Mental Health Articles', href: '#' },
    { id: 'forums', label: 'Community Forums', href: '#' },
]

  
export default function ResourcesHelp() {
    const navigate = useNavigate() 

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transitions={{ duratio: 0.4, delay:0.6 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
            <div
                className="rounded-xl p-4 mb-4"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2' }}
            >
                <div>      
                  <p className="text-sm text-gray-600 mb-3">
                    Want to talk to someone? Our counselors are here to help.
                  </p>
        

                  <button
        
                  onClick={() => navigate('/counselors')}
                  className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 mb-4"
                  style={{ background: 'linear-gradient(135deg, #3AA76D, #88C0F7)' }}
                  >
                  <MessageCircle size={18} />
                  Talk to a Counselor
                  </button>
                </div>
                <div className="flex items-start gap-2 mb-3">
                  
                    <Phone size={18} style={{ color: '#ef4444' }} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm" style={{ color: '#253244' }}>
                            In Crisis?
                        </p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            If you're in immediate danger or having thoughts of self-harm,
                            please reach out for help right away.
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                  {CRISIS_LINES.map((line) => {
                    const Icon = line.icon
                    const href = line.action === 'call' ? `tel:${line.target}` : `sms:${line.target}`
            
                    return (
                      <a
                        key={line.id}
                        href={href}
                        className="flex items-center justify-between gap-3 bg-white rounded-lg p-3 hover:bg-gray-50 transition"
                      >
                      <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#253244' }}>
                      {line.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {line.description}
                        </p>
                      </div>
                      <div
                      className="shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: '#ef4444' }}
                      >
                  <Icon size={18} />
                </div>
              </a>
            )
          })}
        </div>
      </div>
      

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          Additional Resources
        </p>

        <div className="space-y-1">
        {ADDITIONAL_RESOURCES.map((resource) => (
            <a
              key={resource.id}
              href={resource.href}
              className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-lg transition"
            >
              <span className="text-sm font-medium" style={{ color: '#253244' }}>
                {resource.label}
              </span>
              <ExternalLink size={14} className="text-gray-400" />
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}