import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: {
        id: params.id
      },
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

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải thông tin báo cáo' },
      { status: 500 }
    )
  }
} 