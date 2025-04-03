'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Report } from '@prisma/client'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

type ReportWithUser = Report & {
  user: {
    name: string | null
    image: string | null
  }
  reportType: {
    name: string
    icon: string | null
  }
}

export default function ReportDetail() {
  const params = useParams()
  const [report, setReport] = useState<ReportWithUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch report')
        }
        const data = await response.json()
        setReport(data)
      } catch (err) {
        setError('Không thể tải thông tin báo cáo')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [params.id])

  useEffect(() => {
    if (!report) return

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [report.longitude, report.latitude],
      zoom: 15
    })

    new mapboxgl.Marker()
      .setLngLat([report.longitude, report.latitude])
      .addTo(map)

    return () => map.remove()
  }, [report])

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Không tìm thấy báo cáo'}
        </div>
        <Link href="/" className="btn btn-outline-danger">
          Quay lại trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/" className="text-decoration-none">
                  Trang chủ
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Chi tiết báo cáo
              </li>
            </ol>
          </nav>

          <div className="card">
            {report.images && report.images.length > 0 && (
              <div className="row g-0">
                {report.images.map((image, index) => (
                  <div key={index} className="col-6">
                    <img
                      src={image}
                      alt={`Ảnh ${index + 1}`}
                      className="img-fluid"
                      style={{ height: '300px', width: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <span className="fs-4 me-2">
                  {report.reportType.icon ? (
                    <i className={`bi ${report.reportType.icon}`}></i>
                  ) : (
                    '📌'
                  )}
                </span>
                <span className="badge bg-danger">{report.reportType.name}</span>
                <small className="text-muted ms-auto">
                  {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                </small>
              </div>
              
              <h1 className="card-title h3">{report.title}</h1>
              <p className="card-text">{report.description}</p>

              <div className="mt-3">
                <small className="text-muted">
                  Tọa độ: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                </small>
              </div>

              <div className="d-flex align-items-center mt-4">
                {report.user.image ? (
                  <img
                    src={report.user.image}
                    alt={report.user.name || ''}
                    width={32}
                    height={32}
                    className="rounded-circle me-2"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-secondary me-2" 
                    style={{ width: '32px', height: '32px' }}
                  ></div>
                )}
                <div>
                  <p className="mb-0 fw-bold">{report.user.name || 'Ẩn danh'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Vị trí trên bản đồ</h5>
              <div id="map" style={{ height: '400px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 