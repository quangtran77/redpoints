import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { title, description, type, location, coordinates } = data

    // Validate required fields
    if (!title || !description || !type || !location || !coordinates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        type,
        location,
        longitude: coordinates[0],
        latitude: coordinates[1],
        user: {
          connect: {
            email: session.user.email
          }
        }
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 