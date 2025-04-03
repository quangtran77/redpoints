import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Fetching report types from database...')
    const reportTypes = await prisma.reportType.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    console.log('Found report types:', JSON.stringify(reportTypes, null, 2))

    if (!reportTypes || reportTypes.length === 0) {
      console.log('No report types found in database')
    }

    return NextResponse.json(reportTypes)
  } catch (error) {
    console.error('Error fetching report types:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 