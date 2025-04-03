import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'MODERATOR') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const data = await request.json()
    const { status, rejectionReason } = data

    const report = await prisma.report.update({
      where: {
        id: params.id
      },
      data: {
        status,
        rejectionReason,
        moderatorId: user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        reportType: true
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error in PATCH /api/moderator/[id]:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 