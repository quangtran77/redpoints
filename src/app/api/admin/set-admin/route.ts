import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  try {
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

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: Role.ADMIN }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error setting admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 