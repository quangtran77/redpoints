import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const user = await prisma.user.update({
      where: {
        email: 'thuythunghi@gmail.com'
      },
      data: {
        image: 'https://lh3.googleusercontent.com/a/ACg8ocJXRPRXBZvGZqVHQF_OvBF1bBZxTz_NlH_KQYHQGGsK=s96-c'
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user image:', error)
    return new NextResponse('Có lỗi xảy ra khi cập nhật ảnh người dùng', { status: 500 })
  }
} 