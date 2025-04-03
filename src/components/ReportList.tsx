'use client'

import { ReportStatus } from '@prisma/client'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useState, useMemo } from 'react'
import { Report } from '@/types'

interface ReportListProps {
  reports: Report[]
  showFilters?: boolean
  onUpdateStatus?: (reportId: string, status: ReportStatus, rejectionReason?: string) => Promise<void>
}

const statusColors = {
  PENDING: 'text-warning',
  APPROVED: 'text-success',
  REJECTED: 'text-danger'
}

const statusText = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối'
}

// Hàm trích xuất thành phố và quận từ địa chỉ
const extractLocation = (report: Report) => {
  return {
    city: report.city || '',
    district: report.district || ''
  }
}

// Hàm tạo link Google Maps
const createMapLink = (latitude: number, longitude: number) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}

export default function ReportList({ reports, showFilters = false, onUpdateStatus }: ReportListProps) {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL')
  const [cityFilter, setCityFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  // Get unique cities and districts
  const cities = useMemo(() => {
    const uniqueCities = new Set<string>()
    reports.forEach(r => {
      if (r.city) uniqueCities.add(r.city)
    })
    return Array.from(uniqueCities).sort()
  }, [reports])

  const districts = useMemo(() => {
    const uniqueDistricts = new Set<string>()
    reports
      .filter(r => !cityFilter || r.city === cityFilter)
      .forEach(r => {
        if (r.district) uniqueDistricts.add(r.district)
      })
    return Array.from(uniqueDistricts).sort()
  }, [reports, cityFilter])

  // Filter reports based on search and filters
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = searchQuery === '' || 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.district || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCity = cityFilter === '' || r.city === cityFilter
      const matchesDistrict = districtFilter === '' || r.district === districtFilter
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
      
      return matchesSearch && matchesCity && matchesDistrict && matchesStatus
    })
  }, [reports, searchQuery, cityFilter, districtFilter, statusFilter])

  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    if (!onUpdateStatus) return
    
    if (newStatus === 'REJECTED' && !rejectionReason) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    await onUpdateStatus(reportId, newStatus, newStatus === 'REJECTED' ? rejectionReason : undefined)
    setSelectedReport(null)
    setRejectionReason('')
  }

  if (!reports.length) {
    return (
      <div className="text-center py-4">
        <div className="text-muted mb-3">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h6>Chưa có báo cáo nào</h6>
        <p className="text-muted small">Hãy tạo báo cáo đầu tiên của bạn</p>
      </div>
    )
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Tìm kiếm theo tiêu đề, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'ALL')}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
        <div className="col-auto">
          <select
            className="form-select form-select-sm"
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value)
              setDistrictFilter('')
            }}
          >
            <option value="">Tất cả thành phố</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <select
            className="form-select form-select-sm"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            disabled={!cityFilter}
          >
            <option value="">Tất cả quận/huyện</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: '140px' }}>Trạng thái</th>
              <th>Tiêu đề</th>
              <th>Địa chỉ</th>
              <th style={{ width: '180px' }}>Thời gian</th>
              <th style={{ width: '120px' }} className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <svg className={`me-1 ${statusColors[report.status]}`} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {report.status === 'PENDING' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : report.status === 'APPROVED' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      )}
                    </svg>
                    <small className={statusColors[report.status]}>
                      {statusText[report.status]}
                    </small>
                    {report.status === 'REJECTED' && report.rejectionReason && (
                      <button
                        className="btn btn-link btn-sm p-0 ms-2 text-muted"
                        onClick={() => {
                          setSelectedReport(report.id)
                          setRejectionReason(report.rejectionReason || '')
                        }}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <div>{report.title}</div>
                  <small className="text-muted">{report.description}</small>
                </td>
                <td>
                  <div>{report.address || 'Không có địa chỉ'}</div>
                  <small className="text-muted">
                    {report.city}
                    {report.district && ` - ${report.district}`}
                  </small>
                </td>
                <td>
                  <small className="text-muted">
                    {format(new Date(report.createdAt), "d MMMM yyyy 'lúc' HH:mm", { locale: vi })}
                  </small>
                </td>
                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    {onUpdateStatus && report.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'APPROVED')}
                          className="btn btn-link btn-sm p-0 text-success"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReport(report.id)
                            setRejectionReason('')
                          }}
                          className="btn btn-link btn-sm p-0 text-danger"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    <a
                      href={createMapLink(report.latitude, report.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link btn-sm p-0"
                    >
                      Xem bản đồ
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div className="text-center py-3 text-muted border-top">
            <small>Không tìm thấy báo cáo nào</small>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {selectedReport && (
        <>
          <div 
            className="modal-backdrop fade show" 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040
            }}
            onClick={() => {
              setSelectedReport(null)
              setRejectionReason('')
            }}
          />
          <div 
            className="modal fade show" 
            tabIndex={-1} 
            role="dialog" 
            aria-modal="true"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1050
            }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {reports.find(r => r.id === selectedReport)?.status === 'REJECTED' 
                      ? 'Lý do từ chối' 
                      : 'Từ chối báo cáo'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setSelectedReport(null)
                      setRejectionReason('')
                    }}
                  />
                </div>
                <div className="modal-body">
                  {reports.find(r => r.id === selectedReport)?.status === 'REJECTED' ? (
                    <p className="mb-0">{rejectionReason}</p>
                  ) : (
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Nhập lý do từ chối..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedReport(null)
                      setRejectionReason('')
                    }}
                  >
                    {reports.find(r => r.id === selectedReport)?.status === 'REJECTED' ? 'Đóng' : 'Hủy'}
                  </button>
                  {reports.find(r => r.id === selectedReport)?.status !== 'REJECTED' && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleStatusUpdate(selectedReport, 'REJECTED')}
                    >
                      Xác nhận
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 