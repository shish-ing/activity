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

      // 기존 마커 및 경로선 완전히 제거
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

      // 1. 숫자마다 직선(Polyline 경로선)만 선명하게 연결!
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

      // 2. 글자(명칭) 완전히 제거! 오직 원형 숫자 핀(1, 2, 3...)과 경로선만 표시
      places.forEach((place, idx) => {
        const [lat, lng] = routeLatLngs[idx]
        const isActive = activeId === place.id

        // 오직 깔끔한 동그라미 숫자 핀 (글자 텍스트 완전 제거)
        const iconHtml = `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${isActive ? '#f59e0b' : '#0f172a'};
            color: ${isActive ? '#0f172a' : '#ffffff'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            font-weight: 900;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            border: 3px solid ${isActive ? '#ffffff' : '#f59e0b'};
            transform: ${isActive ? 'scale(1.3)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            ${place.order}
          </div>
        `

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-number-only-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

        // 마커에 툴팁으로만 호버 시 명칭 간략 노출 (지도 자체에는 글자 0개!)
        marker.bindTooltip(`<b>${place.order}번. ${place.name}</b>`, {
          direction: 'top',
          offset: [0, -16],
        })

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
        <span>🗺️ 인터랙티브 경로 지도 (숫자 핀 & 경로선 표시)</span>
      </div>
    </div>
  )
}
