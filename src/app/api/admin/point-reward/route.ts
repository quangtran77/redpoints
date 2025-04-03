import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth-options'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

// Create new point reward version
export async function POST(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Parse request body
    const { amount, startDate } = await request.json()

    if (!amount || !startDate) {
      return new NextResponse('Thiếu thông tin', { status: 400 })
    }

    // End all previous versions
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
        amount,
        startDate: new Date(startDate)
      }
    })

    return NextResponse.json(newVersion)
  } catch (error) {
    console.error('Error in POST /api/admin/point-reward:', error)
    return new NextResponse('Có lỗi xảy ra khi tạo phiên bản điểm thưởng', { status: 500 })
  }
}

// Get current active version
export async function GET() {
  try {
    const currentVersion = await prisma.pointRewardVersion.findFirst({
      where: {
        endDate: null
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    if (!currentVersion) {
      return new NextResponse('Chưa có cấu hình điểm thưởng', { status: 404 })
    }

    return NextResponse.json(currentVersion)
  } catch (error) {
    console.error('Error in GET /api/admin/point-reward:', error)
    return new NextResponse('Có lỗi xảy ra khi lấy thông tin điểm thưởng', { status: 500 })
  }
} 