'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { toast } from 'react-hot-toast'
import { Spinner } from 'react-bootstrap'
import { components } from 'react-select'
import Map from '@/components/Map'
import Select from 'react-select'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface ReportType {
  id: string
  name: string
  description: string | null
  icon: string | null
}

export default function ReportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [location, setLocation] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reportTypes, setReportTypes] = useState<ReportType[]>([])
  const [selectedReportType, setSelectedReportType] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isLoadingReportTypes, setIsLoadingReportTypes] = useState(true)

  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        console.log('Fetching report types...')
        const response = await fetch('/api/report-types')
        if (!response.ok) {
          throw new Error('Failed to fetch report types')
        }
        const data = await response.json()
        console.log('API Response:', data)
        setReportTypes(data)
        if (data.length > 0) {
          console.log('Setting initial report type:', data[0])
          setSelectedReportType(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching report types:', error)
        toast.error('Không thể tải danh sách loại báo cáo')
      } finally {
        setIsLoadingReportTypes(false)
      }
    }

    fetchReportTypes()
  }, [])

  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === 'unauthenticated') {
        router.push('/auth/signin')
        return
      }

      if (!session?.user?.email) return

      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) {
          const error = await res.text()
          if (res.status === 403) {
            toast.error(error)
            router.push('/')
            return
          }
          throw new Error(error)
        }
      } catch (error) {
        console.error('Error checking user status:', error)
        toast.error('Có lỗi xảy ra khi kiểm tra trạng thái tài khoản')
        router.push('/')
      }
    }

    checkUserStatus()
  }, [status, session, router])

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

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates([longitude, latitude])
          setIsLoadingLocation(false)
          toast.success('Đã lấy vị trí hiện tại của bạn')
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Không thể lấy vị trí của bạn. Vui lòng chọn vị trí trên bản đồ.')
          setIsLoadingLocation(false)
        }
      )
    } else {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị')
      setIsLoadingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!coordinates) {
      toast.error('Vui lòng chọn vị trí trên bản đồ')
      return
    }

    if (!selectedReportType) {
      toast.error('Vui lòng chọn loại báo cáo')
      return
    }

    try {
      setLoading(true)
      const [longitude, latitude] = coordinates

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          reportTypeId: selectedReportType,
          latitude,
          longitude
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        if (res.status === 403) {
          toast.error(error)
          router.push('/')
          return
        }
        throw new Error(error)
      }

      await res.json()
      toast.success('Đã gửi báo cáo thành công')
      router.push('/')
    } catch (error) {
      console.error('Error creating report:', error)
      toast.error('Có lỗi xảy ra khi gửi báo cáo')
    } finally {
      setLoading(false)
    }
  }

  const reportTypeOptions = reportTypes.map(type => {
    console.log('Creating option for report type:', type)
    return {
      value: type.id,
      label: type.name,
      icon: type.icon,
      description: type.description
    }
  })

  const getIconClasses = (iconString: string | null) => {
    if (!iconString) return '';
    const [iconName, color] = iconString.split(':');
    return `bi ${iconName} ${color ? `text-${color}` : ''}`;
  }

  const Option = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="d-flex align-items-center">
          <div style={{ width: '32px', textAlign: 'center' }}>
            <i className={`${getIconClasses(props.data.icon)} fs-5`}></i>
          </div>
          <span>{props.data.label}</span>
        </div>
      </components.Option>
    )
  }

  const SingleValue = (props: any) => {
    return (
      <components.SingleValue {...props}>
        <div className="d-flex align-items-center">
          <div style={{ width: '32px', textAlign: 'center' }}>
            <i className={`${getIconClasses(props.data.icon)} fs-5`}></i>
          </div>
          <span>{props.data.label}</span>
        </div>
      </components.SingleValue>
    )
  }

  if (status === 'loading' || isLoadingReportTypes) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h4 mb-4">Tạo báo cáo mới</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Tiêu đề</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Ổ gà lớn trên đường Nguyễn Trãi"
                    required
                  />
                  <div className="form-text">Mô tả ngắn gọn về vấn đề bạn muốn báo cáo</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Mô tả chi tiết</label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="VD: Ổ gà rộng khoảng 1m, sâu 20cm, gây nguy hiểm cho người tham gia giao thông, đặc biệt vào ban đêm..."
                    required
                  />
                  <div className="form-text">Mô tả chi tiết về vị trí, mức độ nghiêm trọng và các thông tin khác</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="reportType" className="form-label">Loại cảnh báo</label>
                  <Select
                    id="reportType"
                    value={reportTypeOptions.find(option => option.value === selectedReportType)}
                    onChange={(option) => setSelectedReportType(option?.value || '')}
                    options={reportTypeOptions}
                    placeholder="Chọn loại cảnh báo"
                    isSearchable={false}
                    components={{ Option, SingleValue }}
                    required
                  />
                  {selectedReportType && (
                    <div className="form-text">
                      {reportTypes.find(t => t.id === selectedReportType)?.description}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label d-flex justify-content-between align-items-center">
                    <span>Vị trí</span>
                    <button 
                      type="button" 
                      className="btn btn-outline-primary btn-sm"
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang lấy vị trí...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-geo-alt me-2"></i>
                          Lấy vị trí hiện tại
                        </>
                      )}
                    </button>
                  </label>
                  <div ref={mapContainer} className="border rounded" style={{ height: '400px' }} />
                  {location && (
                    <div className="form-text">
                      Đã chọn vị trí: {location}
                    </div>
                  )}
                  <div className="form-text">Chọn vị trí trên bản đồ hoặc sử dụng vị trí hiện tại của bạn</div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi báo cáo'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 