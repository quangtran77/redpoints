import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth-options'
import prisma from '@/lib/prisma'
import { ReportCategory } from '@prisma/client'

// Types for city and district data
type CityData = {
  districts: string[];
  counties?: string[];
  towns?: string[];
  cities?: string[];
}

type CityMap = {
  [key: string]: CityData;
}

// Function to get address from coordinates using Mapbox Geocoding API
async function getAddressFromCoordinates(longitude: number, latitude: number) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&language=vi&types=address,place,neighborhood,locality,district`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch address')
    }

    const data = await response.json()
    
    if (!data.features?.length) {
      return {
        address: null,
        city: null,
        district: null
      }
    }

    // Get full address from the first feature
    const address = data.features[0].place_name
    const addressParts = address.split(', ')

    // Define administrative units for major cities
    const cityData: CityMap = {
      'Hà Nội': {
        districts: [
          'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Tây Hồ',
          'Cầu Giấy', 'Thanh Xuân', 'Hoàng Mai', 'Long Biên',
          'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hà Đông'
        ],
        counties: [
          'Ba Vì', 'Chương Mỹ', 'Đan Phượng', 'Đông Anh', 'Gia Lâm',
          'Hoài Đức', 'Mê Linh', 'Mỹ Đức', 'Phú Xuyên', 'Phúc Thọ',
          'Quốc Oai', 'Sóc Sơn', 'Thạch Thất', 'Thanh Oai', 'Thanh Trì',
          'Thường Tín', 'Ứng Hòa'
        ],
        towns: ['Sơn Tây']
      },
      'Hồ Chí Minh': {
        districts: [
          'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7',
          'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12', 'Bình Tân',
          'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú'
        ],
        counties: [
          'Bình Chánh', 'Cần Giờ', 'Củ Chi', 'Hóc Môn', 'Nhà Bè'
        ],
        cities: ['Thủ Đức']
      }
    }

    let city: string | null = null
    let district: string | null = null

    // Find city first
    if (addressParts.includes('Hà Nội')) {
      city = 'Hà Nội'
    } else if (addressParts.some((part: string) => 
      part.includes('Hồ Chí Minh') || part === 'TP. HCM' || part === 'TPHCM'
    )) {
      city = 'Hồ Chí Minh'
    }

    // If we found a city, look for its administrative units
    if (city) {
      const cityInfo = cityData[city]
      // Look through address parts for matches
      for (const part of addressParts) {
        // Check districts
        const matchedDistrict = cityInfo.districts.find((d: string) => {
          if (city === 'Hồ Chí Minh' && d.startsWith('Quận ')) {
            // Match variations of district numbers
            const num = d.replace('Quận ', '')
            return part === d || 
                   part === num || 
                   part === `Q.${num}` || 
                   part === `Q${num}`
          }
          return part.includes(d)
        })

        if (matchedDistrict) {
          district = matchedDistrict
          break
        }

        // Check counties (huyện)
        const matchedCounty = cityInfo.counties?.find((c: string) => 
          part.includes(c) || part.includes(`Huyện ${c}`)
        )
        if (matchedCounty) {
          district = `Huyện ${matchedCounty}`
          break
        }

        // Check towns (thị xã) for Hanoi
        if (city === 'Hà Nội') {
          const matchedTown = cityInfo.towns?.find((t: string) => 
            part.includes(t) || part.includes(`Thị xã ${t}`)
          )
          if (matchedTown) {
            district = `Thị xã ${matchedTown}`
            break
          }
        }

        // Check cities for HCMC (Thủ Đức)
        if (city === 'Hồ Chí Minh') {
          const matchedCity = cityInfo.cities?.find((c: string) => 
            part.includes(c) || part.includes(`TP ${c}`) || part.includes(`Thành phố ${c}`)
          )
          if (matchedCity) {
            district = `TP ${matchedCity}`
            break
          }
        }
      }
    }

    // Log the extracted information
    console.log('Extracted address info:', {
      address,
      city,
      district,
      addressParts
    })

    return {
      address,
      city,
      district
    }
  } catch (error) {
    console.error('Error getting address:', error)
    return {
      address: null,
      city: null,
      district: null
    }
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('No session or email')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('Session email:', session.user.email)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('User not found for email:', session.user.email)
      return new NextResponse('User not found', { status: 404 })
    }

    console.log('Found user:', { id: user.id, email: user.email, role: user.role })

    const reports = await prisma.report.findMany({
      where: {
        userId: user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('Found reports:', JSON.stringify(reports, null, 2))

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error in GET /api/reports:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
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

    const data = await request.json()
    const { title, description, reportTypeId, latitude, longitude } = data

    if (!title || !description || !reportTypeId || !latitude || !longitude) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Kiểm tra loại báo cáo có tồn tại
    const reportType = await prisma.reportType.findUnique({
      where: { id: reportTypeId }
    })

    if (!reportType) {
      return new NextResponse('Invalid report type', { status: 400 })
    }

    // Extract address, city and district from coordinates
    const { address, city, district } = await getAddressFromCoordinates(longitude, latitude)

    const report = await prisma.report.create({
      data: {
        title,
        description,
        reportTypeId,
        latitude,
        longitude,
        address,
        city,
        district,
        userId: user.id
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error in POST /api/reports:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 