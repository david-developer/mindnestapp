import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import API from "../api/axios"

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [date_of_birth, setDateOfBirth] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await API.post('/auth/signup', { name, email, password, date_of_birth })
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-stone-50 flex flex-col justify-center px-6 py-12 sm:px-12 md:bg-stone-100 md:items-center">
      
      <div className="w-full flex-1 flex flex-col justify-center max-w-sm mx-auto md:bg-white md:px-10 md:py-12 md:rounded-[2rem] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:flex-none">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 mt-4 md:mt-0">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Join MindNest
          </h1>
          <p className="text-sm text-stone-500 mt-2 text-center">
            Start your mental wellbeing journey today.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-6 text-sm flex items-start" role="alert">
            <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700 ml-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full appearance-none rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-stone-900 placeholder-stone-400 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all sm:text-sm shadow-sm"
              placeholder="Jane Doe"
              required
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700 ml-1" htmlFor="email">
              University Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full appearance-none rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-stone-900 placeholder-stone-400 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all sm:text-sm shadow-sm"
              placeholder="you@university.edu"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700 ml-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full appearance-none rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-stone-900 placeholder-stone-400 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all sm:text-sm shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Date of Birth Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700 ml-1" htmlFor="dob">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              value={date_of_birth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="block w-full appearance-none rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-stone-900 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all sm:text-sm shadow-sm"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 mt-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Privacy Note */}
        <p className="mt-5 text-center text-xs text-stone-400">
          Your wellbeing data is stored securely and privately.
        </p>

        {/* Footer */}
        <div className="mt-6 text-center pb-8 md:pb-0">
          <p className="text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}