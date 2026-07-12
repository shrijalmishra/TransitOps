import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, CheckCircle2, Truck, Route, Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      await login(email.trim(), password, remember)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please check your credentials.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.2fr_1fr] bg-[#070B17] relative overflow-hidden font-sans">
      
      {/* Background Layers for entire page */}
      <div className="absolute inset-0 z-0">
        {/* Soft radial gradients / Blue aurora glow */}
        <div className="absolute top-[-20%] left-[-10%] h-[70vh] w-[70vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60vh] w-[60vw] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* LEFT SIDE: Brand & Identity */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 lg:p-16 xl:p-24 z-10">
        
        {/* Abstract Transport Map Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-5">
          <svg viewBox="0 0 800 800" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
            <path d="M100,100 Q400,300 700,100 T700,700 Q400,500 100,700 T100,100" />
            <circle cx="100" cy="100" r="8" fill="currentColor" />
            <circle cx="700" cy="100" r="8" fill="currentColor" />
            <circle cx="700" cy="700" r="8" fill="currentColor" />
            <circle cx="100" cy="700" r="8" fill="currentColor" />
            <circle cx="400" cy="400" r="12" fill="currentColor" />
            <path d="M100,700 L400,400 L700,100" strokeDasharray="none" strokeWidth="1" />
            <path d="M100,100 L400,400 L700,700" strokeDasharray="none" strokeWidth="1" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Truck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">TransitOps</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
            Smart Fleet <br /> Management
          </h1>
          
          <div className="space-y-4 mb-16">
            {[
              'Vehicles',
              'Drivers',
              'Trips',
              'Maintenance',
              'Analytics'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-slate-300 text-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Statistics */}
        <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/10">
          <div>
            <div className="text-3xl font-bold text-white mb-1">324</div>
            <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Truck className="h-4 w-4" /> Vehicles
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">98</div>
            <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Route className="h-4 w-4" /> Active Trips
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">96%</div>
            <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Utilization
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="relative flex items-center justify-center p-6 sm:p-12 lg:p-16 z-10 bg-[#070B17]/50 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none border-l border-white/5">
        
        <div className="w-full max-w-[440px]">
          
          {/* Glass Card */}
          <div 
            className="rounded-[24px] p-8 sm:p-10 relative overflow-hidden"
            style={{ 
              backgroundColor: 'rgba(18, 25, 40, 0.55)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.45)'
            }}
          >
            <div className="mb-10 text-center lg:text-left">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">TransitOps</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Fleet Management Platform</h2>
              <p className="text-[15px] text-slate-400">
                Welcome back. Sign in to continue managing your fleet.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-400 animate-fade-in text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="group relative flex items-center">
                  <Mail className="absolute left-4 h-[18px] w-[18px] text-slate-400 transition-colors group-focus-within:text-blue-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-[15px] text-white placeholder:text-slate-500 transition-all focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  />
                </div>

                <div className="group relative flex items-center">
                  <Lock className="absolute left-4 h-[18px] w-[18px] text-slate-400 transition-colors group-focus-within:text-blue-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-12 text-[15px] text-white placeholder:text-slate-500 transition-all focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 text-slate-400 transition-colors hover:text-blue-400"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 focus:ring-offset-transparent transition-all"
                  />
                  Remember me
                </label>
                <Link to="#" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-[15px] font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-700 hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center lg:text-left">
              <p className="text-xs text-slate-500">
                Secure enterprise access. Protected by RBAC.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
