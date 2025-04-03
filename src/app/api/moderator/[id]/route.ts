import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/auth-options'

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'MODERATOR') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
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

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in PATCH /api/moderator/[id]:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 