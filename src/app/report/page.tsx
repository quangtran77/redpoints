'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function ReportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const [location, setLocation] = useState('')
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Initialize map when modal opens
  useEffect(() => {
    const modal = document.getElementById('mapModal')
    if (!modal) return

    const initializeMap = () => {
      if (!map.current && mapContainer.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [105.8342, 21.0278], // Hanoi coordinates
          zoom: 12
        })

        // Add navigation control
        map.current.addControl(new mapboxgl.NavigationControl())

        // Add geolocate control
        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true
          })
        )

        // Add click handler
        map.current.on('click', (e) => {
          const { lng, lat } = e.lngLat

          // Update or create marker
          if (marker.current) {
            marker.current.setLngLat([lng, lat])
          } else {
            marker.current = new mapboxgl.Marker()
              .setLngLat([lng, lat])
              .addTo(map.current!)
          }

          // Reverse geocoding to get location name
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
            .then(response => response.json())
            .then(data => {
              if (data.features && data.features.length > 0) {
                setLocation(data.features[0].place_name)
                setCoordinates([lng, lat])
              }
            })
        })
      }

      // Force map resize when modal is shown
      setTimeout(() => {
        if (map.current) {
          map.current.resize()
        }
      }, 100)
    }

    modal.addEventListener('shown.bs.modal', initializeMap)
    return () => {
      modal.removeEventListener('shown.bs.modal', initializeMap)
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="container">
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log({
      location,
      coordinates
    })
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3 text-center mb-4">Báo cáo điểm nguy hiểm</h1>
              
              <form className="needs-validation" noValidate onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Tiêu đề</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    placeholder="VD: Ổ gà lớn trên đường..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Mô tả chi tiết</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Mô tả chi tiết về điểm nguy hiểm..."
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Vị trí</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      value={location}
                      placeholder="Chọn vị trí trên bản đồ..."
                      required
                      readOnly
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#mapModal"
                    >
                      Chọn vị trí
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="type" className="form-label">Loại cảnh báo</label>
                  <select className="form-select" id="type" name="type" required>
                    <option value="">Chọn loại cảnh báo...</option>
                    <option value="road_damage">Hư hỏng đường</option>
                    <option value="construction">Công trình đang thi công</option>
                    <option value="traffic">Điểm hay ùn tắc</option>
                    <option value="accident">Điểm hay tai nạn</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-danger">
                    Gửi báo cáo
                  </button>
                  <Link href="/" className="btn btn-light">
                    Quay lại
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <div className="modal fade" id="mapModal" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Chọn vị trí trên bản đồ</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-0">
              <div ref={mapContainer} style={{ width: '100%', height: '500px' }}></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                data-bs-dismiss="modal"
                disabled={!coordinates}
              >
                Xác nhận vị trí
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 