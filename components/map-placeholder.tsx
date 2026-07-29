'use client'

import { useEffect, useRef, useState } from 'react'
import type { Place } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { ArrowRight, Compass, Maximize2, Navigation, Route } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const navPolylinesRef = useRef<any[]>([])
  
  const isMapInitializedRef = useRef<boolean>(false)
  const prevPlacesKeyRef = useRef<string>('')

  // 1. 지도 경로 모드 ('straight': 간결한 최적 직선 동선, 'navigation': 실제 도로/도보 길찾기 네비게이션)
  const [routeMode, setRouteMode] = useState<'straight' | 'navigation'>('straight')

  // 2. 특정 구간 집중 필터 (null: 전체 코스 보기, 1: 1번➔2번, 2: 2번➔3번 ...)
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)

  // 실제 도로 OSRM 네비게이션 경로 좌표 캐시 (구간별 latLngs)
  const [osrmRoutes, setOsrmRoutes] = useState<Record<string, [number, number][]>>({})

  // 장소 구성 고유 식별키
  const placesKey = places.map((p) => p.id).join(',')

  // OSRM 실시간 도로 길찾기 API 호출 (실제 도로/도보 경로 연동)
  useEffect(() => {
    if (routeMode !== 'navigation' || places.length < 2) return

    async function fetchAllOsrmRoutes() {
      const routesMap: Record<string, [number, number][]> = {}

      for (let i = 0; i < places.length - 1; i++) {
        const from = places[i]
        const to = places[i + 1]
        const fromLat = from.lat || 35.8133 + (from.mapY - 50) * 0.0002
        const fromLng = from.lng || 127.1492 + (from.mapX - 30) * 0.0002
        const toLat = to.lat || 35.8133 + (to.mapY - 50) * 0.0002
        const toLng = to.lng || 127.1492 + (to.mapX - 30) * 0.0002

        const key = `${i + 1}-${i + 2}`

        try {
          // OpenStreetMap OSRM Foot/Driving Routing Engine
          const url = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
          const res = await fetch(url)
          if (res.ok) {
            const data = await res.json()
            const coords = data.routes?.[0]?.geometry?.coordinates
            if (coords && coords.length > 0) {
              // GeoJSON [lng, lat] ➔ Leaflet [lat, lng] 변환
              routesMap[key] = coords.map((c: [number, number]) => [c[1], c[0]])
              continue
            }
          }
        } catch (e) {
          console.warn(`OSRM Route fetch error for segment ${key}:`, e)
        }

        // API 통신 실패 시 폴백 직선 좌표
        routesMap[key] = [
          [fromLat, fromLng],
          [toLat, toLng],
        ]
      }

      setOsrmRoutes(routesMap)
    }

    fetchAllOsrmRoutes()
  }, [places, routeMode, placesKey])

  // 수동 전체 코스 화면 맞춤 함수
  function handleFitBounds() {
    if (!mapRef.current || places.length === 0) return
    let L: any
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule
      const routeLatLngs: [number, number][] = places.map((p) => {
        const lat = p.lat || 35.8133 + (p.mapY - 50) * 0.0002
        const lng = p.lng || 127.1492 + (p.mapX - 30) * 0.0002
        return [lat, lng]
      })
      const bounds = L.latLngBounds(routeLatLngs)
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
      setSelectedSegment(null)
    })
  }

  // 특정 구간 선택 시 해당 2개 장소로 자동 줌인 카메라 이동
  function handleSelectSegment(segIdx: number | null) {
    setSelectedSegment(segIdx)

    if (segIdx === null) {
      handleFitBounds()
      return
    }

    const fromPlace = places[segIdx - 1]
    const toPlace = places[segIdx]

    if (!fromPlace || !toPlace || !mapRef.current) return

    let L: any
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule
      const fromLat = fromPlace.lat || 35.8133 + (fromPlace.mapY - 50) * 0.0002
      const fromLng = fromPlace.lng || 127.1492 + (fromPlace.mapX - 30) * 0.0002
      const toLat = toPlace.lat || 35.8133 + (toPlace.mapY - 50) * 0.0002
      const toLng = toPlace.lng || 127.1492 + (toPlace.mapX - 30) * 0.0002

      const segBounds = L.latLngBounds([
        [fromLat, fromLng],
        [toLat, toLng],
      ])

      // 선택한 구간의 시작점과 도착점 2개 장소만 포커싱하도록 줌인
      mapRef.current.fitBounds(segBounds, { padding: [80, 80], maxZoom: 17 })
    })
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    let L: any
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule

      // 지도 초기화
      if (!mapRef.current && containerRef.current) {
        const initialLat = places[0]?.lat || 35.8133
        const initialLng = places[0]?.lng || 127.1492

        const map = L.map(containerRef.current, {
          center: [initialLat, initialLng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: true,
        })

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

      // 기존 레이어 정리
      Object.values(markersRef.current).forEach((marker: any) => marker.remove())
      markersRef.current = {}
      if (polylineRef.current) {
        polylineRef.current.remove()
        polylineRef.current = null
      }
      navPolylinesRef.current.forEach((pl) => pl.remove())
      navPolylinesRef.current = []

      // 위경도 좌표 리스트
      const routeLatLngs: [number, number][] = places.map((p) => {
        const lat = p.lat || 35.8133 + (p.mapY - 50) * 0.0002
        const lng = p.lng || 127.1492 + (p.mapX - 30) * 0.0002
        return [lat, lng]
      })

      // ─── 1. 경로선 그리기 (직선 모드 vs 실제 네비게이션 도로 모드) ───
      if (routeMode === 'straight') {
        // [직선 모드]
        if (selectedSegment === null) {
          // 전체 경로 선명한 점선 표시
          if (routeLatLngs.length > 1) {
            polylineRef.current = L.polyline(routeLatLngs, {
              color: '#f59e0b',
              weight: 5,
              dashArray: '8, 8',
              opacity: 0.9,
              lineJoin: 'round',
            }).addTo(map)
          }
        } else {
          // 특정 구간 (예: 2번➔3번) 직선만 단독 표시 (경로 겹침 완전 방지!)
          const idx = selectedSegment - 1
          if (routeLatLngs[idx] && routeLatLngs[idx + 1]) {
            polylineRef.current = L.polyline(
              [routeLatLngs[idx], routeLatLngs[idx + 1]],
              {
                color: '#3b82f6', // 선택된 구간은 진한 파란색 하이라이트
                weight: 6,
                dashArray: '8, 8',
                opacity: 1.0,
                lineJoin: 'round',
              },
            ).addTo(map)
          }
        }
      } else {
        // [네비게이션 실제 도로 모드]
        for (let i = 0; i < places.length - 1; i++) {
          const segNum = i + 1
          // 특정 구간 선택 시 해당 구간이 아니면 무시 (겹침 방지!)
          if (selectedSegment !== null && selectedSegment !== segNum) {
            continue
          }

          const key = `${i + 1}-${i + 2}`
          const roadPoints = osrmRoutes[key] || [routeLatLngs[i], routeLatLngs[i + 1]]

          // 실제 도로 따라 이어지는 굵은 블루 네비게이션 라인
          const navPolyline = L.polyline(roadPoints, {
            color: selectedSegment === segNum ? '#2563eb' : '#3b82f6',
            weight: selectedSegment === segNum ? 7 : 5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map)

          navPolylinesRef.current.push(navPolyline)
        }
      }

      // ─── 2. 숫자 핀 마커 그리기 ───
      places.forEach((place, idx) => {
        const [lat, lng] = routeLatLngs[idx]
        const isActive = activeId === place.id
        const isSelectedSegmentSpot =
          selectedSegment !== null &&
          (place.order === selectedSegment || place.order === selectedSegment + 1)

        const isDimmed = selectedSegment !== null && !isSelectedSegmentSpot

        const iconHtml = `
          <div style="
            width: ${isSelectedSegmentSpot ? '38px' : '32px'};
            height: ${isSelectedSegmentSpot ? '38px' : '32px'};
            border-radius: 50%;
            background: ${isActive ? '#f59e0b' : isSelectedSegmentSpot ? '#2563eb' : '#0f172a'};
            color: ${isActive ? '#0f172a' : '#ffffff'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelectedSegmentSpot ? '17px' : '15px'};
            font-weight: 900;
            box-shadow: ${isSelectedSegmentSpot ? '0 0 15px rgba(37,99,235,0.8)' : '0 4px 10px rgba(0,0,0,0.4)'};
            border: 3px solid ${isActive ? '#ffffff' : isSelectedSegmentSpot ? '#60a5fa' : '#f59e0b'};
            transform: ${isActive ? 'scale(1.3)' : isSelectedSegmentSpot ? 'scale(1.15)' : 'scale(1)'};
            opacity: ${isDimmed ? '0.35' : '1'};
            transition: all 0.25s ease;
          ">
            ${place.order}
          </div>
        `

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-number-only-marker',
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        })

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

        marker.bindTooltip(
          `<b>${place.order}번. ${place.name}</b>${
            isSelectedSegmentSpot ? ' <span style="color:#2563eb;">(선택 구간 스팟)</span>' : ''
          }`,
          {
            direction: 'top',
            offset: [0, -18],
          },
        )

        marker.on('mouseover', () => onHover(place.id))
        marker.on('mouseout', () => onHover(null))

        markersRef.current[place.id] = marker
      })

      // 최초 장소 로딩 시 1회만 전체 카메라 맞춤
      const isPlacesChanged = prevPlacesKeyRef.current !== placesKey
      if (routeLatLngs.length > 0 && (!isMapInitializedRef.current || isPlacesChanged)) {
        const bounds = L.latLngBounds(routeLatLngs)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
        isMapInitializedRef.current = true
        prevPlacesKeyRef.current = placesKey
      }
    })
  }, [places, activeId, onHover, placesKey, routeMode, selectedSegment, osrmRoutes])

  return (
    <div className="relative flex flex-col gap-2.5 h-full w-full">
      {/* ─── 상단 컨트롤 1: 경로 모드 선택 버튼 (직선 동선 vs 실제 도로 네비게이션) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky-200/80 bg-white/95 p-2.5 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <Button
            type="button"
            size="sm"
            onClick={() => setRouteMode('straight')}
            className={cn(
              'h-8 px-3 text-xs font-bold rounded-lg transition-all gap-1.5 cursor-pointer',
              routeMode === 'straight'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60',
            )}
          >
            <Route className="size-3.5 text-amber-400" />
            <span>📏 간결한 직선 동선</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setRouteMode('navigation')}
            className={cn(
              'h-8 px-3 text-xs font-bold rounded-lg transition-all gap-1.5 cursor-pointer',
              routeMode === 'navigation'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60',
            )}
          >
            <Navigation className="size-3.5 text-sky-200" />
            <span>🚗 🗺️ 실제 도로 길찾기 경로</span>
          </Button>
        </div>

        {/* 전체 화면 리셋 버튼 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFitBounds}
          className="h-8 gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200 rounded-xl shadow-xs"
        >
          <Maximize2 className="size-3.5 text-amber-600" />
          <span>🎯 전체 코스 보기</span>
        </Button>
      </div>

      {/* ─── 상단 컨트롤 2: 특정 구간 전용 선택 바 (1번➔2번, 2번➔3번 ... 겹침 완전 방지!) ─── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1 text-xs">
        <span className="shrink-0 font-bold text-slate-700 flex items-center gap-1 mr-1">
          <Compass className="size-3.5 text-sky-600" />
          구간 선택:
        </span>

        <button
          type="button"
          onClick={() => handleSelectSegment(null)}
          className={cn(
            'shrink-0 px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer',
            selectedSegment === null
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
              : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-slate-100',
          )}
        >
          🌐 전체 {places.length}개 코스
        </button>

        {places.slice(0, -1).map((fromP, idx) => {
          const segNum = idx + 1
          const toP = places[idx + 1]
          const isSelected = selectedSegment === segNum

          return (
            <button
              key={`segment-${segNum}`}
              type="button"
              onClick={() => handleSelectSegment(segNum)}
              className={cn(
                'shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer text-xs',
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-white/90 text-slate-700 border-slate-200/90 hover:bg-slate-100',
              )}
            >
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-black">
                {segNum}
              </span>
              <span>{fromP.name}</span>
              <ArrowRight className="size-3 text-slate-400" />
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-black">
                {segNum + 1}
              </span>
              <span>{toP.name}</span>
            </button>
          )
        })}
      </div>

      {/* ─── 지도 캔버스 ─── */}
      <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-lg">
        <div ref={containerRef} className="h-full w-full min-h-[420px] z-0" />
      </div>
    </div>
  )
}
