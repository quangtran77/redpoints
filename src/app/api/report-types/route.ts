import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const reportTypes = await prisma.reportType.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(reportTypes)
  } catch (error) {
    console.error('Error fetching report types:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 