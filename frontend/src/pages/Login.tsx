import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bus, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    try {
      await login(email, password, remember)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
            <Bus className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-slate-100">TransitOps</h1>
          <p className="mt-1 text-sm text-slate-400">
            Fleet & Transit Operations Management
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          <h2 className="mb-6 text-lg font-semibold text-slate-100">Sign in to your account</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@transitops.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
              />
              Remember me
            </label>
          </div>

          <Button type="submit" loading={loading} className="mt-6 w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} TransitOps. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login
