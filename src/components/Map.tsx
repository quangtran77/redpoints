'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapProps {
  onSelectLocation: (coordinates: [number, number]) => void
  initialCoordinates?: [number, number] | null
}

export default function Map({ onSelectLocation, initialCoordinates }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Khởi tạo bản đồ với vị trí mặc định là Hà Nội
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCoordinates || [105.8342, 21.0278], // Sử dụng vị trí ban đầu nếu có, nếu không thì mặc định là Hà Nội
      zoom: 13
    })

    // Thêm các controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(new mapboxgl.FullscreenControl())

    // Thêm marker
    marker.current = new mapboxgl.Marker({
      draggable: true
    })

    if (initialCoordinates) {
      marker.current.setLngLat(initialCoordinates).addTo(map.current)
      onSelectLocation(initialCoordinates)
    }

    // Xử lý sự kiện click trên bản đồ
    map.current.on('click', (e) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat]
      marker.current?.setLngLat(coordinates).addTo(map.current!)
      onSelectLocation(coordinates)
    })

    // Xử lý sự kiện kéo marker
    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat()
      if (lngLat) {
        const coordinates: [number, number] = [lngLat.lng, lngLat.lat]
        onSelectLocation(coordinates)
      }
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [initialCoordinates, onSelectLocation])

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
} 