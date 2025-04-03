'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Spinner from '@/components/Spinner'
import ReportList from '@/components/ReportList'
import { Report } from '@/types'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, pointsRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/points')
        ])

        if (!reportsRes.ok) {
          throw new Error('Failed to fetch reports')
        }

        const reportsData = await reportsRes.json()
        setReports(reportsData)

        if (pointsRes.ok) {
          const pointsData = await pointsRes.json()
          setTotalPoints(pointsData.total)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Có lỗi xảy ra khi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-vh-100 bg-light">
        <div className="container py-5">
          <div className="text-center mx-auto" style={{ maxWidth: '600px' }}>
            <h1 className="display-4 mb-4">
              Cùng xây dựng một cộng đồng giao thông <span className="text-danger">an toàn hơn</span>
            </h1>
            <p className="lead mb-5">
              Chia sẻ thông tin về các điểm nguy hiểm trên đường, giúp mọi người di chuyển an toàn và nhận điểm thưởng hấp dẫn.
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="btn btn-danger btn-lg rounded-pill px-5 py-3 shadow-sm"
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Points Card */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm h-100 bg-danger text-white">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title h4 mb-2">Điểm thưởng của bạn</h5>
                  <p className="card-text h2 mb-0">
                    {totalPoints} <small>điểm</small>
                  </p>
                </div>
                <div className="bg-white bg-opacity-25 rounded-circle p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* New Report Button Card */}
          <div className="col-md-4">
            <div 
              onClick={() => router.push('/report')}
              className="card border-0 shadow-sm h-100 cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body text-center d-flex flex-column justify-content-center">
                <div className="bg-danger bg-opacity-10 rounded-circle p-3 d-inline-flex justify-content-center align-items-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-danger">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h5 className="card-title mb-2">Tạo báo cáo mới</h5>
                <p className="card-text text-muted small">Chia sẻ thông tin về các điểm nguy hiểm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-4">Lịch sử báo cáo</h5>
            <ReportList reports={reports} />
          </div>
        </div>
      </div>
    </div>
  )
} 