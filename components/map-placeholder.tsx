'use client'

import { useEffect, useRef } from 'react'
import type { Place } from '@/lib/mock-data'

type MapPlaceholderProps = {
  places: Place[]
  activeId: string | null
  onHover: (id: string | null) => void
}

export function MapPlaceholder({
  places,
  activeId,
  onHover,
}: MapPlaceholderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const polylineRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    let L: any
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule

      // 지도 객체가 생성되지 않았다면 초기화
      if (!mapRef.current && containerRef.current) {
        const initialLat = places[0]?.lat || 35.8133
        const initialLng = places[0]?.lng || 127.1492

        const map = L.map(containerRef.current, {
          center: [initialLat, initialLng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: true,
        })

        // 네이버 지도 스타일의 선명하고 또렷한 실시간 지형 타일 (Voyager/OpenStreetMap)
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            maxZoom: 19,
          },
        ).addTo(map)

        mapRef.current = map
      }

      const map = mapRef.current
      if (!map) return

      // 기존 마커 및 경로선 제거
      Object.values(markersRef.current).forEach((marker: any) => marker.remove())
      markersRef.current = {}
      if (polylineRef.current) {
        polylineRef.current.remove()
        polylineRef.current = null
      }

      // 위경도 좌표 리스트 (좌표가 없는 경우 맵 오프셋으로 변환)
      const routeLatLngs: [number, number][] = places.map((p) => {
        const lat = p.lat || 35.8133 + (p.mapY - 50) * 0.0002
        const lng = p.lng || 127.1492 + (p.mapX - 30) * 0.0002
        return [lat, lng]
      })

      // 1. 숫자마다 직선(Polyline 경로선)을 연결시켜 다음 경로가 어디인지 한눈에 보이게 연결!
      if (routeLatLngs.length > 1) {
        const polyline = L.polyline(routeLatLngs, {
          color: '#f59e0b', // 선명한 주황-금빛 경로선
          weight: 5,
          dashArray: '8, 8',
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(map)

        polylineRef.current = polyline
      }

      // 2. 순서 번호 마커 아이콘 및 팝업/이벤트 등록
      places.forEach((place, idx) => {
        const [lat, lng] = routeLatLngs[idx]
        const isActive = activeId === place.id

        // 네이버 지도 감성의 마커 핀 태그
        const iconHtml = `
          <div style="
            display: flex;
            align-items: center;
            gap: 5px;
            background: ${isActive ? '#f59e0b' : '#0f172a'};
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2px solid ${isActive ? '#ffffff' : '#f59e0b'};
            white-space: nowrap;
            transform: ${isActive ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            <span style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${isActive ? '#ffffff' : '#f59e0b'};
              color: ${isActive ? '#0f172a' : '#ffffff'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 900;
            ">${place.order}</span>
            <span>${place.name}</span>
          </div>
        `

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-interactive-marker',
          iconSize: [130, 38],
          iconAnchor: [35, 19],
        })

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

        marker.on('mouseover', () => onHover(place.id))
        marker.on('mouseout', () => onHover(null))

        markersRef.current[place.id] = marker
      })

      // 모든 코스 장소가 한 화면에 딱 들어오도록 지도 영역 자동 조절
      if (routeLatLngs.length > 0) {
        const bounds = L.latLngBounds(routeLatLngs)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
      }
    })
  }, [places, activeId, onHover])

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div ref={containerRef} className="h-full w-full min-h-[420px] z-0" />
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-xl bg-background/90 border border-border px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur shadow-sm">
        <span>🗺️ 인터랙티브 경로 지도 (드래그/확대·축소 & 경로선 연결)</span>
      </div>
    </div>
  )
}
