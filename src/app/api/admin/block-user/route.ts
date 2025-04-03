import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth-options'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    if (user.role === 'ADMIN') {
      return new NextResponse('Cannot block admin users', { status: 403 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        isBlocked: !user.isBlocked,
        // If user is being blocked and they are a moderator, remove their moderator role
        role: user.isBlocked ? user.role : (user.role === 'MODERATOR' ? 'DRIVER' : user.role)
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error in POST /api/admin/block-user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 