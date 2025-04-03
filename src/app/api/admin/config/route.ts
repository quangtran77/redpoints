import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth-options'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== Role.ADMIN) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Get current active version
    const currentVersion = await prisma.pointRewardVersion.findFirst({
      where: {
        endDate: null
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // Get all versions
    const versions = await prisma.pointRewardVersion.findMany({
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json({
      pointReward: currentVersion?.amount || 0,
      versions
    })
  } catch (error) {
    console.error('Error in GET /api/admin/config:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== Role.ADMIN) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { pointReward } = await request.json()

    if (typeof pointReward !== 'number' || pointReward < 0) {
      return new NextResponse('Invalid point reward value', { status: 400 })
    }

    // End current active version
    await prisma.pointRewardVersion.updateMany({
      where: {
        endDate: null
      },
      data: {
        endDate: new Date()
      }
    })

    // Create new version
    const newVersion = await prisma.pointRewardVersion.create({
      data: {
        amount: pointReward,
        startDate: new Date()
      }
    })

    return NextResponse.json(newVersion)
  } catch (error) {
    console.error('Error in POST /api/admin/config:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 