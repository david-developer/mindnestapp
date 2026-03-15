import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom' // Link = React Router's anchor tag
import { useAuth } from '../context/AuthContext' // gives us the login function
import API from '../api/axios' // our configured axios instance

export default function Login() {
  // controlled inputs — React tracks every keystroke
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('') // holds error message to show user
  const [loading, setLoading] = useState(false) // disables button during request

  const { login } = useAuth() // login() saves token + user to localStorage
  const navigate = useNavigate() // programmatically redirect after login

  const handleSubmit = async (e) => {
    e.preventDefault() // stops page from refreshing on form submit
    setLoading(true)
    setError('')

    try {
      // send credentials to backend
      const res = await API.post('/auth/login', { email, password })
      // save token and user in context + localStorage
      login(res.data.token, res.data.user)
      // redirect to dashboard on success
      navigate('/dashboard')
    } catch (err) {
      // show backend error message or fallback
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false) // re-enable button regardless of outcome
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-700 mb-2">MindNest 🌿</h1>
        <p className="text-gray-500 mb-6">Welcome back</p>

        {/* Only renders if there is an error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // update state on every keystroke
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="you@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="••••••••"
              required
            />
          </div>

          {/* disabled while loading to prevent duplicate requests */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Link navigates without page reload */}
        <p className="text-sm text-center text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}