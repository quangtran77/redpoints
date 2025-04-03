import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, context: any) {
  try {
    const { id } = context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu ID báo cáo' },
        { status: 400 }
      )
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      )
    }

    return NextResponse.json(report, { status: 200 })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải thông tin báo cáo' },
      { status: 500 }
    )
  }
}