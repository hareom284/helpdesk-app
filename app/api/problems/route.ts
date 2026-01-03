import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/problems - Get all problems
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const problems = await prisma.problem.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        caller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
          },
        },
        equipment: {
          select: {
            id: true,
            serialNumber: true,
            equipmentType: true,
          },
        },
        problemType: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedSpecialist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return NextResponse.json({ problems, count: problems.length })
  } catch (error) {
    console.error('Error fetching problems:', error)
    return NextResponse.json(
      { error: 'Failed to fetch problems' },
      { status: 500 }
    )
  }
}

// POST /api/problems - Create new problem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { callerId, equipmentId, problemTypeId, operatorId, priority } = body

    // Generate problem number
    const count = await prisma.problem.count()
    const problemNumber = `PRB-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    const problem = await prisma.problem.create({
      data: {
        problemNumber,
        callerId,
        equipmentId,
        problemTypeId,
        initialOperatorId: operatorId,
        priority: priority || 'medium',
        status: 'open',
      },
      include: {
        caller: true,
        equipment: true,
        problemType: true,
      },
    })

    return NextResponse.json({ problem }, { status: 201 })
  } catch (error) {
    console.error('Error creating problem:', error)
    return NextResponse.json(
      { error: 'Failed to create problem' },
      { status: 500 }
    )
  }
}
