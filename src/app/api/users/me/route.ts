import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session email:', session?.user?.email)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    if (user.isBlocked) {
      return new NextResponse('Tài khoản của bạn đã bị khóa', { status: 403 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error in GET /api/users/me:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 