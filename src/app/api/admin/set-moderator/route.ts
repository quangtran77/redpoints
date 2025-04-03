import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session)

    if (!session?.user?.id) {
      console.log('No session or user id found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    console.log('Admin user:', admin)

    if (!admin || admin.role !== Role.ADMIN) {
      console.log('User is not admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === Role.ADMIN) {
      return NextResponse.json({ error: 'Cannot modify admin role' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: user.role === Role.MODERATOR ? Role.DRIVER : Role.MODERATOR
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error setting moderator:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 