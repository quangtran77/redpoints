import { useState } from 'react'
import { Report, ReportStatus } from '@prisma/client'
import { Modal, Button } from 'react-bootstrap'
import Image from 'next/image'

interface ReportDetailProps {
  report: Report & {
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
  onClose: () => void
  onUpdateStatus: (status: ReportStatus) => void
}

export default function ReportDetail({ report, onClose, onUpdateStatus }: ReportDetailProps) {
  const [rejectionReason, setRejectionReason] = useState('')

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết báo cáo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-md-6">
            <h5>Thông tin báo cáo</h5>
            <p><strong>Tiêu đề:</strong> {report.title}</p>
            <p><strong>Mô tả:</strong> {report.description}</p>
            <p><strong>Loại báo cáo:</strong> {report.reportType.name}</p>
            <p><strong>Trạng thái:</strong> 
              <span className={`badge bg-${report.status === 'PENDING' ? 'warning' : 
                report.status === 'APPROVED' ? 'success' : 'danger'} ms-2`}>
                {report.status}
              </span>
            </p>
            {report.rejectionReason && (
              <p><strong>Lý do từ chối:</strong> {report.rejectionReason}</p>
            )}
          </div>
          <div className="col-md-6">
            <h5>Thông tin vị trí</h5>
            <p><strong>Địa chỉ:</strong> {report.address}</p>
            <p><strong>Quận/Huyện:</strong> {report.district}</p>
            <p><strong>Thành phố:</strong> {report.city}</p>
            <div className="mt-3">
              <a
                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary"
              >
                <i className="bi bi-geo-alt me-1"></i>
                Xem bản đồ
              </a>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <h5>Hình ảnh</h5>
            {report.images && report.images.length > 0 ? (
              <div className="position-relative" style={{ height: '300px' }}>
                <Image
                  src={report.images[0]}
                  alt="Report image"
                  fill
                  className="object-fit-cover rounded"
                />
              </div>
            ) : (
              <p>Không có hình ảnh</p>
            )}
          </div>
          <div className="col-md-6">
            <h5>Thông tin người báo cáo</h5>
            <div className="d-flex align-items-center">
              {report.user.image && (
                <Image
                  src={report.user.image}
                  alt={report.user.name}
                  width={50}
                  height={50}
                  className="rounded-circle me-3"
                />
              )}
              <div>
                <p className="mb-0"><strong>{report.user.name}</strong></p>
                <p className="text-muted mb-0">{report.user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {report.status === 'PENDING' && (
          <div className="mt-4">
            <h5>Kiểm duyệt</h5>
            <div className="mb-3">
              <label className="form-label">Lý do từ chối (nếu có)</label>
              <textarea
                className="form-control"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối nếu cần"
              />
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="success"
                onClick={() => onUpdateStatus(ReportStatus.APPROVED)}
              >
                <i className="bi bi-check-circle me-1"></i>
                Duyệt
              </Button>
              <Button
                variant="danger"
                onClick={() => onUpdateStatus(ReportStatus.REJECTED)}
                disabled={!rejectionReason}
              >
                <i className="bi bi-x-circle me-1"></i>
                Từ chối
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  )
} 