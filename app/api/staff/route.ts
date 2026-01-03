import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/staff - Get all staff
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffType = searchParams.get('type')

    const staff = await prisma.staff.findMany({
      where: {
        ...(staffType ? { staffType: staffType as any } : {}),
        isActive: true,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    return NextResponse.json({ staff, count: staff.length })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

// POST /api/staff - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      departmentId,
      staffType,
    } = body

    const staff = await prisma.staff.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        departmentId,
        staffType,
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json({ staff }, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}
