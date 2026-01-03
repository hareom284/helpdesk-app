"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Ticket,
  Users,
  Monitor,
  ShieldCheck,
  PlusCircle,
  Search,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react"
import { Session } from "next-auth"

const appleGlass = "bg-white/10 backdrop-blur-[40px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"

interface SidebarItemProps {
  icon: React.ElementType
  label: string
  href: string
  active: boolean
  onClick: () => void
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 group relative ${
      active
        ? "bg-white/15 text-white shadow-inner border border-white/20"
        : "text-white/50 hover:text-white hover:bg-white/5"
    }`}
  >
    <div
      className={`transition-all duration-500 ${
        active ? "scale-110" : "group-hover:scale-105 opacity-60 group-hover:opacity-100"
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span
      className={`text-[13px] font-semibold tracking-wide transition-all ${
        active ? "opacity-100" : "opacity-80 group-hover:opacity-100"
      }`}
    >
      {label}
    </span>
    {active && (
      <div className="absolute left-0 w-1 h-4 bg-white rounded-full translate-x-[-2px]"></div>
    )}
  </button>
)

interface DashboardLayoutClientProps {
  children: React.ReactNode
  session: Session
}

export default function DashboardLayoutClient({ children, session }: DashboardLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigate = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  const navigationItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Ticket, label: "Problems", href: "/dashboard/problems" },
    { icon: PlusCircle, label: "New Problem", href: "/dashboard/problems/new" },
    { icon: Users, label: "Users", href: "/dashboard/users" },
    { icon: Monitor, label: "Equipment", href: "/dashboard/equipment" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ]

  const user = session.user
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0].toUpperCase()

  return (
    <div className="h-screen relative overflow-hidden font-sans text-white bg-[#020617] selection:bg-blue-500 selection:text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[160px] animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-700/10 rounded-full blur-[140px] animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar - Desktop */}
        <aside className="w-72 p-6 flex-col hidden lg:flex fixed left-0 top-0 h-screen z-30">
          <div className={`${appleGlass} flex-1 rounded-[36px] p-8 flex flex-col`}>
            <div
              className="flex items-center gap-3 mb-14 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <ShieldCheck size={24} className="text-slate-900" />
              </div>
              <h1 className="text-lg font-black tracking-tight text-white">IT CORE</h1>
            </div>

            <nav className="space-y-1.5 flex-1">
              {navigationItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={pathname === item.href}
                  onClick={() => navigate(item.href)}
                />
              ))}
            </nav>

            <div className="mt-auto space-y-3">
              <div className="p-5 bg-white/5 rounded-[28px] border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate">{user.name || user.email}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">
                    {user.roles?.[0] || "User"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 hover:bg-red-500/20 transition-all text-sm font-bold"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <button
          className={`${appleGlass} fixed top-6 left-6 z-50 p-3 rounded-2xl lg:hidden`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className={`${appleGlass} w-72 h-full p-8 flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center gap-3 mb-14 cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <ShieldCheck size={24} className="text-slate-900" />
                </div>
                <h1 className="text-lg font-black tracking-tight text-white">IT CORE</h1>
              </div>

              <nav className="space-y-1.5 flex-1">
                {navigationItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={pathname === item.href}
                    onClick={() => navigate(item.href)}
                  />
                ))}
              </nav>

              <div className="mt-auto space-y-3">
                <div className="p-5 bg-white/5 rounded-[28px] border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-sm">
                    {initials}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold truncate">{user.name || user.email}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">
                      {user.roles?.[0] || "User"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 hover:bg-red-500/20 transition-all text-sm font-bold"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen lg:ml-72">
          <header
            className={`${appleGlass} h-20 rounded-[28px] px-8 flex items-center justify-between m-6 mb-0 fixed top-0 right-6 left-6 lg:left-[312px] z-20`}
          >
            <div className="flex-1 lg:ml-0 ml-16">
              <h2 className="text-lg font-black tracking-tight uppercase">
                {navigationItems.find((item) => item.href === pathname)?.label || "Dashboard"}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`${appleGlass} p-1.5 px-4 rounded-2xl hidden md:flex items-center gap-2 border-white/10`}
              >
                <Search size={16} className="text-white/30" />
                <input
                  className="bg-transparent text-sm outline-none border-none placeholder-white/20 w-40 md:w-64"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className={`${appleGlass} p-3 rounded-2xl relative hover:bg-white/15 transition-all`}
              >
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
            </div>
          </header>

          <section className="flex-1 overflow-y-auto p-6 mt-20">{children}</section>
        </main>
      </div>
    </div>
  )
}
