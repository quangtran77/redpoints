import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth-options'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const users = await prisma.user.findMany()

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return new NextResponse('Có lỗi xảy ra khi tải danh sách người dùng', { status: 500 })
  }
} 