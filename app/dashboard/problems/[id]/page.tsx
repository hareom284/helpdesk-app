import { PrismaClient } from "@prisma/client"
import { ChevronRight, User, Monitor, AlertCircle, Clock, Check, Trash2, FileText } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

const prisma = new PrismaClient()

const appleGlass = "bg-white/10 backdrop-blur-[40px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
const appleGlassDark = "bg-black/20 backdrop-blur-[40px] border border-white/10 shadow-2xl"

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

interface PageProps {
  params: {
    id: string
  }
}

export default async function ProblemDetailPage({ params }: PageProps) {
  const problem = await prisma.problem.findUnique({
    where: { id: params.id },
    include: {
      reporter: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          department: { select: { name: true } },
        },
      },
      assignedSpecialist: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      initialOperator: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      problemType: true,
      equipment: true,
      calls: {
        include: {
          reporter: { select: { firstName: true, lastName: true } },
          operator: { select: { firstName: true, lastName: true } },
        },
        orderBy: { callDatetime: "desc" },
      },
      resolution: {
        include: {
          resolvedByUser: { select: { firstName: true, lastName: true } },
        },
      },
      statusHistory: {
        orderBy: { changedAt: "desc" },
        take: 10,
      },
      attachments: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!problem) {
    notFound()
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 max-w-7xl mx-auto">
      <div className={`${appleGlass} p-10 rounded-[40px] relative overflow-hidden`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <Link
            href="/dashboard/problems"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition-all hover:bg-white/10"
          >
            <ChevronRight className="rotate-180" size={16} /> Back to Problems
          </Link>
          <div className="flex gap-3">
            <button className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500 hover:text-white transition-all">
              <Trash2 size={18} />
            </button>
            {problem.status !== "resolved" && (
              <button className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-2">
                <Check size={16} /> Mark Resolved
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-10">
            {/* Problem Info */}
            <div>
              <p className="text-[11px] font-black tracking-[0.4em] text-blue-400 uppercase mb-3">
                {problem.problemNumber}
              </p>
              <h1 className="text-5xl font-black leading-tight tracking-tight text-white mb-6">
                {problem.title}
              </h1>
              <div className="flex gap-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(problem.status)}`}>
                  {problem.status.replace("_", " ")}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                  {problem.priority} priority
                </span>
              </div>
            </div>

            {/* Description */}
            {problem.description && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                <h3 className="text-sm font-black text-white/40 uppercase tracking-wider mb-3">
                  Description
                </h3>
                <p className="text-white/80 leading-relaxed">{problem.description}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Reporter */}
              <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">
                  Reporter
                </p>
                <p className="font-bold text-white">
                  {problem.reporter?.firstName} {problem.reporter?.lastName}
                </p>
                <p className="text-xs text-white/30 mt-1">{problem.reporter?.email}</p>
                <p className="text-xs text-white/30 tracking-tight">
                  {problem.reporter?.department?.name}
                </p>
              </div>

              {/* Equipment */}
              {problem.equipment && (
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">
                    Equipment
                  </p>
                  <p className="font-bold text-white">
                    {problem.equipment.equipmentMake} {problem.equipment.equipmentModel}
                  </p>
                  <p className="text-[10px] font-mono text-white/20 mt-1">
                    #{problem.equipment.serialNumber}
                  </p>
                </div>
              )}

              {/* Problem Type */}
              {problem.problemType && (
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">
                    Problem Type
                  </p>
                  <p className="font-bold text-white">{problem.problemType.name}</p>
                  {problem.problemType.description && (
                    <p className="text-xs text-white/40 mt-2">{problem.problemType.description}</p>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">
                  Timeline
                </p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-white/30">Reported:</span>{" "}
                    <span className="text-white/70">
                      {new Date(problem.reportedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {problem.resolvedAt && (
                    <div>
                      <span className="text-white/30">Resolved:</span>{" "}
                      <span className="text-white/70">
                        {new Date(problem.resolvedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Calls History */}
            {problem.calls.length > 0 && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-[32px]">
                <h3 className="text-sm font-black text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={16} />
                  Call History ({problem.calls.length})
                </h3>
                <div className="space-y-4">
                  {problem.calls.map((call) => (
                    <div
                      key={call.id}
                      className="p-4 bg-white/5 border border-white/5 rounded-2xl"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-blue-300">
                          {call.callType.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-xs text-white/30">
                          {new Date(call.callDatetime).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 mb-2">{call.callNotes}</p>
                      <div className="text-xs text-white/30">
                        Operator: {call.operator.firstName} {call.operator.lastName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            {problem.resolution && (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px]">
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Check size={16} />
                  Resolution
                </h3>
                <p className="text-white/80 mb-4">{problem.resolution.resolutionDescription}</p>
                <div className="text-xs text-white/40">
                  Resolved by: {problem.resolution.resolvedByUser.firstName}{" "}
                  {problem.resolution.resolvedByUser.lastName} on{" "}
                  {new Date(problem.resolution.resolutionDatetime).toLocaleString()}
                </div>
                {problem.resolution.userSatisfaction && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/20">
                    <span className="text-xs text-white/40">User Satisfaction: </span>
                    <span className="text-emerald-300 font-bold">
                      {problem.resolution.userSatisfaction}/5
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className={`${appleGlassDark} rounded-[40px] p-8 sticky top-6`}>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 text-blue-400">
                Assignment
              </h4>

              {/* Assigned Specialist */}
              {problem.assignedSpecialist ? (
                <div className="mb-8">
                  <p className="text-xs text-white/30 mb-3">Assigned Specialist</p>
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-bold">
                      {problem.assignedSpecialist.firstName[0]}
                      {problem.assignedSpecialist.lastName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {problem.assignedSpecialist.firstName}{" "}
                        {problem.assignedSpecialist.lastName}
                      </p>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                        Specialist
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 text-center py-10 opacity-30 italic">
                  No specialist assigned
                </div>
              )}

              <button className="w-full py-4 bg-white text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                Assign To Me
              </button>

              {/* SLA Information */}
              {(problem.slaResponseDue || problem.slaResolutionDue) && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 text-orange-400">
                    SLA Targets
                  </h4>
                  <div className="space-y-3">
                    {problem.slaResponseDue && (
                      <div>
                        <p className="text-xs text-white/30 mb-1">Response Due</p>
                        <p className="text-sm text-white/80">
                          {new Date(problem.slaResponseDue).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {problem.slaResolutionDue && (
                      <div>
                        <p className="text-xs text-white/30 mb-1">Resolution Due</p>
                        <p className="text-sm text-white/80">
                          {new Date(problem.slaResolutionDue).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {problem.slaBreached && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs font-bold text-red-300">⚠️ SLA Breached</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
