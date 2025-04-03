'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { ReportStatus } from '@prisma/client'
import { Spinner } from 'react-bootstrap'

interface Report {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  address: string | null
  city: string | null
  district: string | null
  status: ReportStatus
  createdAt: string
  reportType: {
    id: string
    name: string
    icon: string | null
  }
  user: {
    name: string | null
    email: string
  }
  rejectionReason?: string
}

function getMapUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}

export default function ModeratorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'ALL'>('ALL')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user?.role !== 'MODERATOR') {
      router.push('/')
      return
    }

    fetchReports()
  }, [status, session, router])

  const fetchReports = async () => {
    try {
      const url = new URL('/api/moderator', window.location.origin)
      if (selectedStatus !== 'ALL') {
        url.searchParams.append('status', selectedStatus)
      }
      if (selectedCity) {
        url.searchParams.append('city', selectedCity)
      }
      if (selectedDistrict) {
        url.searchParams.append('district', selectedDistrict)
      }

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch reports')
      }

      const data = await res.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Có lỗi xảy ra khi tải danh sách báo cáo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [selectedStatus, selectedCity, selectedDistrict])

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus) => {
    try {
      const res = await fetch(`/api/moderator/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: newStatus === ReportStatus.REJECTED ? rejectionReason : undefined
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update report status')
      }

      toast.success('Đã cập nhật trạng thái báo cáo')
      fetchReports()
      setSelectedReportId(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error updating report status:', error)
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái báo cáo')
    }
  }

  const cities = Array.from(new Set(reports.map(report => report.city).filter(Boolean)))
  const districts = Array.from(new Set(
    reports
      .filter(report => !selectedCity || report.city === selectedCity)
      .map(report => report.district)
      .filter(Boolean)
  ))

  if (status === 'loading' || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  if (!session || session.user.role !== 'MODERATOR') {
    return null
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h4 mb-4">Quản lý báo cáo</h1>

              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label">Lọc theo trạng thái</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'ALL')}
                  >
                    <option value="ALL">Tất cả</option>
                    <option value={ReportStatus.PENDING}>Chờ duyệt</option>
                    <option value={ReportStatus.APPROVED}>Đã duyệt</option>
                    <option value={ReportStatus.REJECTED}>Từ chối</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Lọc theo thành phố</label>
                  <select
                    className="form-select"
                    value={selectedCity || ''}
                    onChange={(e) => setSelectedCity(e.target.value || null)}
                  >
                    <option value="">Tất cả</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Lọc theo quận</label>
                  <select
                    className="form-select"
                    value={selectedDistrict || ''}
                    onChange={(e) => setSelectedDistrict(e.target.value || null)}
                  >
                    <option value="">Tất cả</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '200px' }}>Tiêu đề</th>
                      <th style={{ minWidth: '150px' }}>Loại</th>
                      <th style={{ minWidth: '300px' }}>Địa chỉ</th>
                      <th style={{ minWidth: '100px' }}>Bản đồ</th>
                      <th style={{ minWidth: '150px' }}>Người báo cáo</th>
                      <th style={{ minWidth: '120px' }}>Trạng thái</th>
                      <th style={{ minWidth: '150px' }}>Ngày tạo</th>
                      <th style={{ minWidth: '150px' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <div className="fw-medium">{report.title}</div>
                          <div className="text-muted small">{report.description}</div>
                        </td>
                        <td>
                          {report.reportType.icon && (
                            <span className="me-1">{report.reportType.icon}</span>
                          )}
                          {report.reportType.name}
                        </td>
                        <td>
                          <div>{report.address || 'Chưa có địa chỉ'}</div>
                          {(report.district || report.city) && (
                            <div className="text-muted small">
                              {[report.district, report.city].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </td>
                        <td>
                          <a
                            href={getMapUrl(report.latitude, report.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-geo-alt me-1"></i>
                            Xem bản đồ
                          </a>
                        </td>
                        <td>
                          <div>{report.user.name || 'Người dùng'}</div>
                          <div className="text-muted small">{report.user.email}</div>
                        </td>
                        <td>
                          <div className={`badge ${
                            report.status === 'PENDING' ? 'bg-warning' :
                            report.status === 'APPROVED' ? 'bg-success' :
                            'bg-danger'
                          }`}>
                            {report.status === 'PENDING' && 'Chờ duyệt'}
                            {report.status === 'APPROVED' && 'Đã duyệt'}
                            {report.status === 'REJECTED' && 'Từ chối'}
                          </div>
                          {report.status === 'REJECTED' && report.rejectionReason && (
                            <div className="text-muted small mt-1">
                              {report.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</div>
                          <div className="text-muted small">
                            {new Date(report.createdAt).toLocaleTimeString('vi-VN')}
                          </div>
                        </td>
                        <td>
                          {report.status === 'PENDING' && (
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleUpdateStatus(report.id, 'APPROVED')}
                              >
                                Duyệt
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => setSelectedReportId(report.id)}
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {reports.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <div className="mb-3">
                      <i className="bi bi-inbox fs-1"></i>
                    </div>
                    <p>Chưa có báo cáo nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedReportId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Lý do từ chối</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedReportId(null)
                    setRejectionReason('')
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="rejectionReason" className="form-label">Lý do</label>
                  <textarea
                    className="form-control"
                    id="rejectionReason"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedReportId(null)
                    setRejectionReason('')
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    if (selectedReportId) {
                      handleUpdateStatus(selectedReportId, ReportStatus.REJECTED)
                    }
                  }}
                  disabled={!rejectionReason}
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 