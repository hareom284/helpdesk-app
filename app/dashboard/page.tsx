import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { Ticket, Clock, CheckCircle2, AlertCircle, Command, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

const prisma = new PrismaClient()

const appleGlass = "bg-white/10 backdrop-blur-[40px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    open: "bg-blue-400/20 text-blue-200 border-blue-400/30",
    assigned: "bg-purple-400/20 text-purple-200 border-purple-400/30",
    in_progress: "bg-orange-400/20 text-orange-200 border-orange-400/30",
    resolved: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30",
    closed: "bg-slate-400/20 text-slate-200 border-slate-400/30",
  }
  return styles[status] || "bg-white/10 text-white border-white/20"
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  href?: string
}

const StatCard = ({ title, value, icon: Icon, color, href }: StatCardProps) => {
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      <div
        className={`p-3 rounded-2xl bg-${color}-500/20 border border-${color}-400/30 text-${color}-200 group-hover:scale-110 transition-transform duration-700`}
      >
        <Icon size={20} />
      </div>
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={`${appleGlass} p-5 rounded-3xl group cursor-pointer transition-all duration-500 hover:bg-white/[0.15] hover:scale-[1.02] active:scale-95 block`}
      >
        {content}
      </Link>
    )
  }

  return (
    <div
      className={`${appleGlass} p-5 rounded-3xl group transition-all duration-500 hover:bg-white/[0.15]`}
    >
      {content}
    </div>
  )
}

export default async function DashboardPage() {
  const session = await auth()

  // Fetch statistics
  const [totalProblems, openProblems, inProgressProblems, resolvedProblems, totalUsers, recentProblems] = await Promise.all([
    prisma.problem.count({ where: { deletedAt: null } }),
    prisma.problem.count({ where: { status: "open", deletedAt: null } }),
    prisma.problem.count({ where: { status: "in_progress", deletedAt: null } }),
    prisma.problem.count({ where: { status: "resolved", deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, isActive: true } }),
    prisma.problem.findMany({
      where: { deletedAt: null },
      include: {
        reporter: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const urgentCount = await prisma.problem.count({
    where: {
      priority: "critical",
      status: { not: "resolved" },
      deletedAt: null,
    },
  })

  // Fetch active specialists
  const specialists = await prisma.user.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      userRoles: {
        some: {
          role: {
            name: "specialist",
          },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      department: {
        select: {
          name: true,
        },
      },
    },
    take: 5,
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Problems"
          value={openProblems}
          icon={Ticket}
          color="blue"
          href="/dashboard/problems"
        />
        <StatCard
          title="In Progress"
          value={inProgressProblems}
          icon={Clock}
          color="orange"
          href="/dashboard/problems"
        />
        <StatCard title="Resolved" value={resolvedProblems} icon={CheckCircle2} color="emerald" />
        <StatCard
          title="Urgent Action"
          value={urgentCount}
          icon={AlertCircle}
          color="red"
          href="/dashboard/problems"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Problems Table */}
        <div className={`${appleGlass} xl:col-span-2 rounded-[32px] overflow-hidden`}>
          <div className="p-6 px-8 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Command size={18} className="text-blue-400" />
              Live Incident Feed
            </h3>
            <Link
              href="/dashboard/problems"
              className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-black text-white/30">
                <tr>
                  <th className="px-8 py-4">Number</th>
                  <th className="px-8 py-4">Title</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentProblems.map((problem) => (
                  <tr
                    key={problem.id}
                    className="group cursor-pointer hover:bg-white/[0.03] transition-all"
                  >
                    <td className="px-8 py-5 text-xs font-mono text-white/50">
                      {problem.problemNumber}
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">
                        {problem.title}
                      </p>
                      <p className="text-xs text-white/30 mt-1">
                        {problem.reporter?.firstName} {problem.reporter?.lastName}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadge(
                          problem.status
                        )}`}
                      >
                        {problem.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} className="text-white/30" />
                    </td>
                  </tr>
                ))}
                {recentProblems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-white/30 italic">
                      No problems found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Available Specialists */}
        <div className={`${appleGlass} rounded-[32px] p-6 px-8`}>
          <h3 className="font-bold text-white mb-6 flex items-center gap-2">
            <Users size={18} className="text-indigo-400" />
            Available Specialists
          </h3>
          <div className="space-y-5">
            {specialists.map((specialist) => (
              <div key={specialist.id} className="flex items-center gap-4 group">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-200/10 to-white/20 border border-white/20 flex items-center justify-center font-bold text-white text-sm shadow-xl">
                    {specialist.firstName?.[0]}
                    {specialist.lastName?.[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#0f172a] rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white leading-tight">
                    {specialist.firstName} {specialist.lastName}
                  </p>
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-0.5">
                    {specialist.department?.name || "N/A"}
                  </p>
                </div>
              </div>
            ))}
            {specialists.length === 0 && (
              <p className="text-center text-white/30 italic py-8">No specialists available</p>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-white/5">
            <Link
              href="/dashboard/problems/new"
              className="block w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white text-center uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Report New Problem
            </Link>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className={`${appleGlass} p-8 rounded-[32px]`}>
        <h2 className="text-2xl font-black mb-2">
          Welcome back, {session?.user?.name || session?.user?.email}! 👋
        </h2>
        <p className="text-white/60">
          You have {openProblems} open problems and {inProgressProblems} in progress.
          {urgentCount > 0 && (
            <span className="text-red-300 font-bold">
              {" "}
              There are {urgentCount} urgent problems requiring immediate attention.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
