"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"

const appleGlass = "bg-white/10 backdrop-blur-[40px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials. Please try again.")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-white bg-[#020617] selection:bg-blue-500 selection:text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-700/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                <ShieldCheck size={32} className="text-slate-900" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">IT CORE</h1>
            </div>
            <p className="text-sm text-white/40 font-bold tracking-wider">Helpdesk Management System</p>
          </div>

          {/* Login Form */}
          <div className={`${appleGlass} p-10 rounded-[40px]`}>
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-sm text-white/40 font-semibold">Sign in to access your dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-200 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                    placeholder="admin@manzaneque.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-xs text-white/30 font-bold">Test Credentials</p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-white/50 font-mono">admin@manzaneque.com</p>
                  <p className="text-xs text-white/50 font-mono">password123</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">
              IT Helpdesk System &copy; 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
