import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from './AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password, displayName)
        // After registration, log in to get tokens
        await login(email, password)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(isRegister ? 'Registration failed' : 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <LogIn className="w-12 h-12 text-blue-500 mb-3" />
          <h1 className="text-2xl font-bold text-white">MyApp</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRegister ? 'Create an account' : 'Sign in to continue'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-3 py-2 rounded">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-400 text-white rounded text-sm font-medium transition-colors"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  )
}
