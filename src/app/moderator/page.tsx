'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Report, ReportStatus } from '@prisma/client'
import { Form, Button, Table, Spinner, Pagination } from 'react-bootstrap'
import ReportDetail from '@/components/ReportDetail'

interface ReportWithUser extends Report {
  user: {
    name: string
    email: string
    image: string | null
  }
  reportType: {
    name: string
    icon: string | null
  }
}

interface ReportType {
  id: string
  name: string
  description: string | null
  icon: string | null
}

export default function ModeratorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<ReportWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | ''>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedReportType, setSelectedReportType] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [reportTypes, setReportTypes] = useState<ReportType[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReport, setSelectedReport] = useState<ReportWithUser | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session.user.role !== 'MODERATOR') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    fetchReportTypes()
    fetchReports()
  }, [selectedStatus, selectedCity, selectedDistrict, selectedReportType, searchQuery, currentPage])

  const fetchReportTypes = async () => {
    try {
      const res = await fetch('/api/report-types')
      if (res.ok) {
        const data = await res.json()
        setReportTypes(data)
      }
    } catch (error) {
      console.error('Error fetching report types:', error)
    }
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedCity) params.append('city', selectedCity)
      if (selectedDistrict) params.append('district', selectedDistrict)
      if (selectedReportType) params.append('reportTypeId', selectedReportType)
      if (searchQuery) params.append('search', searchQuery)
      params.append('page', currentPage.toString())
      params.append('limit', '10')

      const res = await fetch(`/api/moderator/all?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        console.log('Report data:', data.reports[0]?.reportType)
        setReports(data.reports)
        setTotalPages(data.pagination.totalPages)
        
        // Update cities and districts lists
        const uniqueCities = Array.from(new Set(data.reports.map((r: Report) => r.city).filter(Boolean)))
        setCities(uniqueCities as string[])
        
        const uniqueDistricts = Array.from(
          new Set(data.reports.map((r: Report) => r.district).filter(Boolean))
        )
        setDistricts(uniqueDistricts as string[])
      } else {
        setError('Không thể tải danh sách báo cáo')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      setError('Có lỗi xảy ra khi tải danh sách báo cáo')
    } finally {
      setLoading(false)
    }
  }

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

      if (res.ok) {
        fetchReports()
        setSelectedReport(null)
        setRejectionReason('')
      } else {
        setError('Không thể cập nhật trạng thái báo cáo')
      }
    } catch (error) {
      console.error('Error updating report status:', error)
      setError('Có lỗi xảy ra khi cập nhật trạng thái báo cáo')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getIconClasses = (iconString: string | null) => {
    if (!iconString) return '';
    const [iconName, color] = iconString.split(':');
    return `bi ${iconName} ${color ? `text-${color}` : ''}`;
  }

  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Quản lý báo cáo</h1>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | '')}
                >
                  <option value="">Tất cả</option>
                  <option value={ReportStatus.PENDING}>Chờ duyệt</option>
                  <option value={ReportStatus.APPROVED}>Đã duyệt</option>
                  <option value={ReportStatus.REJECTED}>Từ chối</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Loại báo cáo</Form.Label>
                <Form.Select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  {reportTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Thành phố</Form.Label>
                <Form.Select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    setSelectedDistrict('')
                  }}
                >
                  <option value="">Tất cả</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Quận/Huyện</Form.Label>
                <Form.Select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedCity}
                >
                  <option value="">Tất cả</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-12">
              <Form.Group>
                <Form.Label>Tìm kiếm</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tiêu đề hoặc mô tả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Form.Group>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="table-responsive">
        <Table striped hover>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Người báo cáo</th>
              <th>Địa chỉ</th>
              <th>Bản đồ</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <Spinner animation="border" size="sm" /> Đang tải...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  Không có báo cáo nào
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="fw-bold">{report.title}</div>
                    <div className="text-muted small">{report.description}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div style={{ width: '32px', textAlign: 'center' }}>
                        <i className={`${getIconClasses(report.reportType.icon)} fs-5`}></i>
                      </div>
                      <span>{report.reportType.name}</span>
                    </div>
                  </td>
                  <td>
                    <div>{report.user.name}</div>
                    <div className="text-muted small">{report.user.email}</div>
                  </td>
                  <td>
                    <div>{report.address}</div>
                    <div className="text-muted small">
                      {report.district}, {report.city}
                    </div>
                  </td>
                  <td>
                    <a
                      href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-geo-alt me-1"></i>
                      Xem bản đồ
                    </a>
                  </td>
                  <td>
                    <span
                      className={`badge bg-${
                        report.status === 'PENDING'
                          ? 'warning'
                          : report.status === 'APPROVED'
                          ? 'success'
                          : 'danger'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Xem
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetail
          report={selectedReport}
          onClose={() => {
            setSelectedReport(null)
            setRejectionReason('')
          }}
          onUpdateStatus={(status) => handleUpdateStatus(selectedReport.id, status)}
        />
      )}
    </div>
  )
} 