'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Spinner from '@/components/Spinner'

interface PointRewardVersion {
  id: string
  amount: number
  startDate: string
  endDate: string | null
}

export default function PointRewardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentVersion, setCurrentVersion] = useState<PointRewardVersion | null>(null)
  const [amount, setAmount] = useState('')
  const [startDate, setStartDate] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/point-reward')
        if (!res.ok) {
          throw new Error('Failed to fetch point reward version')
        }

        const data = await res.json()
        setCurrentVersion(data)
      } catch (error) {
        console.error('Error fetching point reward version:', error)
        toast.error('Có lỗi xảy ra khi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/point-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseInt(amount),
          startDate
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create point reward version')
      }

      const newVersion = await res.json()
      setCurrentVersion(newVersion)
      setAmount('')
      setStartDate('')
      toast.success('Đã tạo phiên bản điểm thưởng mới')
    } catch (error) {
      console.error('Error creating point reward version:', error)
      toast.error('Có lỗi xảy ra khi tạo phiên bản điểm thưởng')
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Quản lý điểm thưởng</h1>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Phiên bản hiện tại</h5>
                {currentVersion ? (
                  <div>
                    <p className="mb-1">
                      <strong>Số điểm:</strong> {currentVersion.amount}
                    </p>
                    <p className="mb-1">
                      <strong>Ngày bắt đầu:</strong>{' '}
                      {new Date(currentVersion.startDate).toLocaleDateString('vi-VN')}
                    </p>
                    {currentVersion.endDate && (
                      <p className="mb-0">
                        <strong>Ngày kết thúc:</strong>{' '}
                        {new Date(currentVersion.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted mb-0">Chưa có cấu hình điểm thưởng</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Tạo phiên bản mới</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="amount" className="form-label">
                      Số điểm thưởng
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="1"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="startDate" className="form-label">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Tạo phiên bản mới
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 