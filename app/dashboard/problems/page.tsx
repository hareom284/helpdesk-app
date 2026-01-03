import { PrismaClient } from "@prisma/client"
import { Filter, Search, ChevronRight, AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const prisma = new PrismaClient()

const appleGlass = "bg-white/10 backdrop-blur-[40px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    open: "bg-blue-400/20 text-blue-200 border-blue-400/30",
    assigned: "bg-purple-400/20 text-purple-200 border-purple-400/30",
    in_progress: "bg-orange-400/20 text-orange-200 border-orange-400/30",
    awaiting_user: "bg-yellow-400/20 text-yellow-200 border-yellow-400/30",
    resolved: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30",
    closed: "bg-slate-400/20 text-slate-200 border-slate-400/30",
    cancelled: "bg-red-400/20 text-red-200 border-red-400/30",
  }
  return styles[status] || "bg-white/10 text-white border-white/20"
}

const getPriorityBadge = (priority: string) => {
  const styles: Record<string, string> = {
    low: "bg-gray-400/20 text-gray-200",
    medium: "bg-blue-400/20 text-blue-200",
    high: "bg-orange-400/20 text-orange-200",
    critical: "bg-red-400/20 text-red-200",
  }
  return styles[priority] || "bg-white/10 text-white"
}

export default async function ProblemsPage() {
  const problems = await prisma.problem.findMany({
    where: { deletedAt: null },
    include: {
      reporter: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      assignedSpecialist: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      problemType: {
        select: {
          name: true,
        },
      },
      equipment: {
        select: {
          equipmentMake: true,
          equipmentModel: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: problems.length,
    open: problems.filter((p) => p.status === "open").length,
    inProgress: problems.filter((p) => p.status === "in_progress").length,
    critical: problems.filter((p) => p.priority === "critical" && p.status !== "resolved").length,
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`${appleGlass} p-5 rounded-3xl`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-1">
                Total Problems
              </p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-400/30">
              <AlertCircle size={20} className="text-blue-200" />
            </div>
          </div>
        </div>

        <div className={`${appleGlass} p-5 rounded-3xl`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-1">
                Open
              </p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stats.open}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-400/30">
              <AlertCircle size={20} className="text-purple-200" />
            </div>
          </div>
        </div>

        <div className={`${appleGlass} p-5 rounded-3xl`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-1">
                In Progress
              </p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stats.inProgress}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-orange-500/20 border border-orange-400/30">
              <Clock size={20} className="text-orange-200" />
            </div>
          </div>
        </div>

        <div className={`${appleGlass} p-5 rounded-3xl`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-1">
                Critical
              </p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stats.critical}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-red-500/20 border border-red-400/30">
              <AlertCircle size={20} className="text-red-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${appleGlass} p-6 rounded-[28px] flex flex-wrap gap-4 items-center`}>
        <div className="flex items-center gap-2 text-white/40">
          <Filter size={18} />
          <span className="text-sm font-bold">Filters:</span>
        </div>
        <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm font-semibold text-white hover:bg-white/20 transition-all">
          All Status
        </button>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 transition-all">
          All Priority
        </button>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/10 transition-all">
          All Types
        </button>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.map((problem) => (
          <Link
            key={problem.id}
            href={`/dashboard/problems/${problem.id}`}
            className={`${appleGlass} p-6 rounded-[32px] hover:bg-white/15 cursor-pointer transition-all duration-500 group block`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-mono text-white/30">{problem.problemNumber}</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${problem.priority === "critical" ? "bg-red-500" : problem.priority === "high" ? "bg-orange-500" : "bg-blue-400"}`}></div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${getPriorityBadge(problem.priority)}`}>
                  {problem.priority}
                </span>
              </div>
            </div>

            <h4 className="font-bold text-white text-lg leading-tight mb-4 group-hover:text-blue-200 transition-colors">
              {problem.title}
            </h4>

            {problem.description && (
              <p className="text-sm text-white/50 mb-4 line-clamp-2">{problem.description}</p>
            )}

            <div className="space-y-2 mb-4">
              {problem.reporter && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/30">Reporter:</span>
                  <span className="text-white/70 font-semibold">
                    {problem.reporter.firstName} {problem.reporter.lastName}
                  </span>
                </div>
              )}
              {problem.assignedSpecialist && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/30">Assigned:</span>
                  <span className="text-white/70 font-semibold">
                    {problem.assignedSpecialist.firstName} {problem.assignedSpecialist.lastName}
                  </span>
                </div>
              )}
              {problem.problemType && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/30">Type:</span>
                  <span className="text-white/70 font-semibold">{problem.problemType.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadge(problem.status)}`}>
                {problem.status.replace("_", " ")}
              </span>
              <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {problems.length === 0 && (
        <div className={`${appleGlass} p-12 rounded-[32px] text-center`}>
          <AlertCircle size={48} className="mx-auto mb-4 text-white/20" />
          <h3 className="text-xl font-bold text-white mb-2">No Problems Found</h3>
          <p className="text-white/40">There are no problems in the system yet.</p>
        </div>
      )}
    </div>
  )
}
