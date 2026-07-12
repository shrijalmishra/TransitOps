import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Dispatcher')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      // The backend login currently uses email and password.
      // We pass remember to AuthContext.
      await login(email.trim(), password, remember)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please check your credentials and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in relative overflow-hidden">
      
      {/* Decorative background orbs for extra premium feel just for login */}
      <div className="absolute -left-[10%] top-[20%] h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute -right-[10%] bottom-[20%] h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative w-full max-w-[440px]">
        
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
            <svg
              className="h-8 w-8 text-slate-950"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Sign in to your account</h1>
          <p className="mt-2 text-sm text-slate-400">Enter your credentials to continue</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-400 animate-fade-in">
                {error}
              </div>
            )}

            <Input
              id="email"
              type="email"
              label="EMAIL"
              autoComplete="email"
              placeholder="you@transitops.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="PASSWORD"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-[38px] text-slate-500 transition-colors hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Select
              id="role"
              label="ROLE (RBAC)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'Fleet Manager', label: 'Fleet Manager' },
                { value: 'Dispatcher', label: 'Dispatcher' },
                { value: 'Safety Officer', label: 'Safety Officer' },
                { value: 'Financial Analyst', label: 'Financial Analyst' },
              ]}
            />

            <div className="flex items-center justify-between pt-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-slate-900/50 text-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-0 focus:ring-offset-transparent transition-all"
                />
                Remember me
              </label>
              <Link to="#" className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="mt-4 w-full" size="lg">
              Sign In
            </Button>

          </form>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="mb-3 text-sm font-medium text-slate-400">Access is scoped by role after login:</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Fleet Manager &rarr; Fleet, Maintenance</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Dispatcher &rarr; Dashboard, Trips</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Safety Officer &rarr; Drivers, Compliance</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Financial Analyst &rarr; Fuel &amp; Expenses, Analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
