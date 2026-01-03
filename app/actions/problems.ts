"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

interface CreateProblemResult {
  success: boolean
  problemId?: string
  error?: string
}

export async function createProblem(formData: FormData): Promise<CreateProblemResult> {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const priority = formData.get("priority") as "low" | "medium" | "high" | "critical"
    const problemTypeId = formData.get("problemTypeId") as string
    const equipmentId = formData.get("equipmentId") as string
    const reporterId = formData.get("reporterId") as string

    // Validate required fields
    if (!title || !priority || !problemTypeId || !reporterId) {
      return {
        success: false,
        error: "Missing required fields",
      }
    }

    // Get problem type to calculate SLA times
    const problemType = await prisma.problemType.findUnique({
      where: { id: problemTypeId },
    })

    if (!problemType) {
      return {
        success: false,
        error: "Invalid problem type",
      }
    }

    // Get the last problem number to generate a new one
    const lastProblem = await prisma.problem.findFirst({
      orderBy: { createdAt: "desc" },
      select: { problemNumber: true },
    })

    // Generate problem number (format: PRB-YYYY-XXXX)
    const year = new Date().getFullYear()
    let problemNumber = `PRB-${year}-0001`

    if (lastProblem?.problemNumber) {
      const lastNumber = parseInt(lastProblem.problemNumber.split("-")[2] || "0")
      const newNumber = (lastNumber + 1).toString().padStart(4, "0")
      problemNumber = `PRB-${year}-${newNumber}`
    }

    // Calculate SLA due dates
    const now = new Date()
    const slaResponseDue = problemType.slaResponseTime
      ? new Date(now.getTime() + problemType.slaResponseTime * 60000) // minutes to milliseconds
      : null

    const slaResolutionDue = problemType.slaResolutionTime
      ? new Date(now.getTime() + problemType.slaResolutionTime * 60000)
      : null

    // Create the problem
    const problem = await prisma.problem.create({
      data: {
        problemNumber,
        title,
        description: description || null,
        priority,
        status: "open",
        reporterId,
        problemTypeId,
        equipmentId: equipmentId || null,
        reportedAt: now,
        slaResponseDue,
        slaResolutionDue,
        slaBreached: false,
      },
    })

    // Create initial status history entry
    await prisma.problemStatusHistory.create({
      data: {
        problemId: problem.id,
        oldStatus: null,
        newStatus: "open",
        changedAt: now,
        changedBy: reporterId,
        changeReason: "Problem reported",
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tableName: "Problem",
        recordId: problem.id,
        action: "CREATE",
        userId: reporterId,
        changes: {
          title,
          priority,
          status: "open",
        },
      },
    })

    // Revalidate the problems page
    revalidatePath("/dashboard/problems")

    return {
      success: true,
      problemId: problem.id,
    }
  } catch (error) {
    console.error("Error creating problem:", error)
    return {
      success: false,
      error: "Failed to create problem. Please try again.",
    }
  } finally {
    await prisma.$disconnect()
  }
}

export async function updateProblemStatus(
  problemId: string,
  newStatus: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    })

    if (!problem) {
      return { success: false, error: "Problem not found" }
    }

    // Update problem status
    await prisma.problem.update({
      where: { id: problemId },
      data: { status: newStatus as any },
    })

    // Create status history entry
    await prisma.problemStatusHistory.create({
      data: {
        problemId,
        oldStatus: problem.status,
        newStatus: newStatus as any,
        changedAt: new Date(),
        changedBy: userId,
        changeReason: reason || `Status changed to ${newStatus}`,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tableName: "Problem",
        recordId: problemId,
        action: "UPDATE",
        userId,
        changes: {
          status: { from: problem.status, to: newStatus },
        },
      },
    })

    revalidatePath("/dashboard/problems")
    revalidatePath(`/dashboard/problems/${problemId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating problem status:", error)
    return { success: false, error: "Failed to update status" }
  } finally {
    await prisma.$disconnect()
  }
}

export async function assignProblem(
  problemId: string,
  specialistId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update problem with assigned specialist
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        assignedSpecialistId: specialistId,
        status: "assigned",
      },
    })

    // Create status history
    await prisma.problemStatusHistory.create({
      data: {
        problemId,
        oldStatus: "open",
        newStatus: "assigned",
        changedAt: new Date(),
        changedBy: userId,
        changeReason: `Assigned to specialist`,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tableName: "Problem",
        recordId: problemId,
        action: "UPDATE",
        userId,
        changes: {
          assignedSpecialistId: specialistId,
          status: "assigned",
        },
      },
    })

    revalidatePath("/dashboard/problems")
    revalidatePath(`/dashboard/problems/${problemId}`)

    return { success: true }
  } catch (error) {
    console.error("Error assigning problem:", error)
    return { success: false, error: "Failed to assign problem" }
  } finally {
    await prisma.$disconnect()
  }
}

export async function deleteProblem(
  problemId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Soft delete the problem
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tableName: "Problem",
        recordId: problemId,
        action: "DELETE",
        userId,
        changes: {
          deletedAt: new Date().toISOString(),
        },
      },
    })

    revalidatePath("/dashboard/problems")

    return { success: true }
  } catch (error) {
    console.error("Error deleting problem:", error)
    return { success: false, error: "Failed to delete problem" }
  } finally {
    await prisma.$disconnect()
  }
}
