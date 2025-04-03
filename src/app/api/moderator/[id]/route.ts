import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/auth-options'

type RouteContext = {
  params: {
    id: string
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()
    const { status, rejectionReason } = data

    const report = await prisma.report.update({
      where: {
        id: context.params.id
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 