import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import API from "../api/axios"

export default function Signup() {
    const [name, setName]= useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [date_of_birth, setDateOfBirth] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    
    const handleSubmit = async (e) => {
        e.preventDefault() //stops page from refreshing on form submit
        setLoading(true)
        setError('')

        try {
            const res = await API.post('/auth/signup', { name, email, password, date_of_birth})
            login(res.data.token, res.data.user)
            navigate('/dashboard')
        }   catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        }   finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-green-700 mb-2">MindNest</h1>
                <p className="text-gray-500 mb-6">Create Your Account</p>

                {/*Only renders if theres an error */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                        </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder=" First name Last Name"
                            required
                        
                        />
                    </div>

                    <div>
                        <label className="block text-sm font medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} //updates state on every keystroke
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 "
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

                    <div>
                        <label className="block text-sm font medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input 
                            type="date"
                            value={date_of_birth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Date of Birth"
                            required
                        />
                    </div>

                    

                    {/* Disabled while loading to prevent duplicate requests */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading? 'Creating account..': 'Sign Up'}

                    </button>
                </form>

                {/* Link navigates without page reload */}
                <p className="text-sm text-center text-gray-500 mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 font-medium hover:underline">
                        Login
                    </Link>
                </p>
                
            </div>
        </div>
    )

}