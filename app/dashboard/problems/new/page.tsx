import { PrismaClient } from "@prisma/client"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { NewProblemForm } from "@/components/NewProblemForm"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

const appleGlass = "bg-white/10 backdrop-blur-[40px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"

export default async function NewProblemPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Fetch problem types and equipment for the form
  const [problemTypes, equipment] = await Promise.all([
    prisma.problemType.findMany({
      where: {
        isActive: true,
        deletedAt: null
      },
      orderBy: { name: "asc" },
    }),
    prisma.equipment.findMany({
      where: {
        status: "active",
        deletedAt: null
      },
      orderBy: { equipmentMake: "asc" },
      select: {
        id: true,
        equipmentMake: true,
        equipmentModel: true,
        serialNumber: true,
        assetTag: true,
      },
    }),
  ])

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto">
      <div className={`${appleGlass} p-10 rounded-[40px] relative overflow-hidden`}>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/problems"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition-all hover:bg-white/10 w-fit mb-6"
          >
            <ChevronRight className="rotate-180" size={16} /> Back to Problems
          </Link>

          <h1 className="text-5xl font-black leading-tight tracking-tight text-white mb-3">
            Report New Problem
          </h1>
          <p className="text-white/40 text-sm">
            Describe the issue you're experiencing and we'll get it resolved
          </p>
        </div>

        {/* Form */}
        <NewProblemForm
          problemTypes={problemTypes}
          equipment={equipment}
          userId={session.user.id}
        />
      </div>
    </div>
  )
}
