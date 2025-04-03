import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ReportStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ReportStatus | null
    const city = searchParams.get('city')
    const district = searchParams.get('district')
    const reportTypeId = searchParams.get('reportTypeId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (city) where.city = city
    if (district) where.district = district
    if (reportTypeId) where.reportTypeId = reportTypeId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.report.count({ where })

    // Get reports with pagination
    const reports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
        reportType: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    console.log('Reports with types:', reports[0]?.reportType) // Log first report's type

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải danh sách báo cáo' },
      { status: 500 }
    )
  }
} 