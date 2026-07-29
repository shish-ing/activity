'use client'

import { useEffect, useRef, useState } from 'react'
import type { Place } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Compass, Maximize2, Navigation, Route, Sparkles, X } from 'lucide-react'
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
  const [routeMode, setRouteMode] = useState<'straight' | 'navigation'>('navigation')

  // 2. 특정 순차 구간 필터 (null: 전체 코스 보기, 1: 1번➔2번, 2: 2번➔3번 ...)
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)

  // 3. 🎯 핵심: 지도에서 임의로 선택한 2개 핀 경로 (예: 1번➔5번 선택 시 [1, 5])
  const [customPinPair, setCustomPinPair] = useState<[number, number] | null>(null)
  const [customStartPin, setCustomStartPin] = useState<number | null>(null)
  const customStartPinRef = useRef<number | null>(null)

  // 4. 구간 선택 드롭다운 열림/닫힘 상태
  const [isSegmentOpen, setIsSegmentOpen] = useState<boolean>(false)

  // OSRM 네비게이션 경로 좌표 캐시 (구간 키 ➔ latLngs)
  const [osrmRoutes, setOsrmRoutes] = useState<Record<string, [number, number][]>>({})

  // 장소 구성 고유 식별키
  const placesKey = places.map((p) => p.id).join(',')

  // OSRM 실시간 도로 길찾기 API 호출 (순차 구간 및 임의 핀 쌍 경로)
  useEffect(() => {
    if (places.length < 2) return

    async function fetchOsrmRoutes() {
      const routesMap: Record<string, [number, number][]> = {}

      // 1) 순차 구간 (1-2, 2-3 ...)
      for (let i = 0; i < places.length - 1; i++) {
        const from = places[i]
        const to = places[i + 1]
        const fromLat = from.lat || 35.8133 + (from.mapY - 50) * 0.0002
        const fromLng = from.lng || 127.1492 + (from.mapX - 30) * 0.0002
        const toLat = to.lat || 35.8133 + (to.mapY - 50) * 0.0002
        const toLng = to.lng || 127.1492 + (to.mapX - 30) * 0.0002

        const key = `${i + 1}-${i + 2}`

        try {
          const url = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
          const res = await fetch(url)
          if (res.ok) {
            const data = await res.json()
            const coords = data.routes?.[0]?.geometry?.coordinates
            if (coords && coords.length > 0) {
              routesMap[key] = coords.map((c: [number, number]) => [c[1], c[0]])
              continue
            }
          }
        } catch (e) {
          console.warn(`OSRM Route error for ${key}:`, e)
        }

        routesMap[key] = [[fromLat, fromLng], [toLat, toLng]]
      }

      // 2) 임의 핀 쌍 경로 (customPinPair가 지정된 경우)
      if (customPinPair) {
        const [pinA, pinB] = customPinPair
        const from = places[pinA - 1]
        const to = places[pinB - 1]
        if (from && to) {
          const fromLat = from.lat || 35.8133 + (from.mapY - 50) * 0.0002
          const fromLng = from.lng || 127.1492 + (from.mapX - 30) * 0.0002
          const toLat = to.lat || 35.8133 + (to.mapY - 50) * 0.0002
          const toLng = to.lng || 127.1492 + (to.mapX - 30) * 0.0002

          const customKey = `custom-${pinA}-${pinB}`

          try {
            const url = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
            const res = await fetch(url)
            if (res.ok) {
              const data = await res.json()
              const coords = data.routes?.[0]?.geometry?.coordinates
              if (coords && coords.length > 0) {
                routesMap[customKey] = coords.map((c: [number, number]) => [c[1], c[0]])
              }
            }
          } catch (e) {
            console.warn(`OSRM Custom Pair error for ${customKey}:`, e)
          }

          if (!routesMap[customKey]) {
            routesMap[customKey] = [[fromLat, fromLng], [toLat, toLng]]
          }
        }
      }

      setOsrmRoutes(routesMap)
    }

    fetchOsrmRoutes()
  }, [places, placesKey, customPinPair])

  // 전체 화면 카메라 맞춤 및 임의 선택 해제
  function handleResetAll() {
    setSelectedSegment(null)
    setCustomPinPair(null)
    setCustomStartPin(null)
    customStartPinRef.current = null
    setIsSegmentOpen(false)

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
    })
  }

  // 순차 구간 선택
  function handleSelectSegment(segIdx: number | null) {
    setSelectedSegment(segIdx)
    setCustomPinPair(null)
    setCustomStartPin(null)
    customStartPinRef.current = null
    setIsSegmentOpen(false)

    if (segIdx === null) {
      handleResetAll()
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

      const segBounds = L.latLngBounds([[fromLat, fromLng], [toLat, toLng]])
      mapRef.current.fitBounds(segBounds, { padding: [80, 80], maxZoom: 17 })
    })
  }

  // 🎯 임의 2개 핀 쌍 직접 선택 (예: 1번➔5번)
  function handleSelectCustomPair(pair: [number, number]) {
    setCustomPinPair(pair)
    setSelectedSegment(null)
    setCustomStartPin(null)
    customStartPinRef.current = null
    setIsSegmentOpen(false)

    const fromPlace = places[pair[0] - 1]
    const toPlace = places[pair[1] - 1]
    if (!fromPlace || !toPlace || !mapRef.current) return

    let L: any
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule
      const fromLat = fromPlace.lat || 35.8133 + (fromPlace.mapY - 50) * 0.0002
      const fromLng = fromPlace.lng || 127.1492 + (fromPlace.mapX - 30) * 0.0002
      const toLat = toPlace.lat || 35.8133 + (toPlace.mapY - 50) * 0.0002
      const toLng = toPlace.lng || 127.1492 + (toPlace.mapX - 30) * 0.0002

      const pairBounds = L.latLngBounds([[fromLat, fromLng], [toLat, toLng]])
      mapRef.current.fitBounds(pairBounds, { padding: [80, 80], maxZoom: 17 })
    })
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    let L: any
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule

      // 지도 객체 초기화
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

      // 기존 마커 및 선 레이어 정리
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

      // ─── 1. 경로선 그리기 (임의 2개 핀 선택 > 순차 구간 > 전체 모드) ───
      if (customPinPair) {
        // 🎯 [임의 2개 핀 선택 모드: 예 1번➔5번]
        const [pinA, pinB] = customPinPair
        const customKey = `custom-${pinA}-${pinB}`
        const points = osrmRoutes[customKey] || [routeLatLngs[pinA - 1], routeLatLngs[pinB - 1]]

        const customPolyline = L.polyline(points, {
          color: '#2563eb', // 시원한 네비게이션 파란선
          weight: 7,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map)

        navPolylinesRef.current.push(customPolyline)
      } else if (selectedSegment !== null) {
        // [특정 순차 구간 선택 모드: 예 2번➔3번]
        const idx = selectedSegment - 1
        const key = `${selectedSegment}-${selectedSegment + 1}`
        const points = routeMode === 'navigation'
          ? (osrmRoutes[key] || [routeLatLngs[idx], routeLatLngs[idx + 1]])
          : [routeLatLngs[idx], routeLatLngs[idx + 1]]

        const segPolyline = L.polyline(points, {
          color: '#2563eb',
          weight: 7,
          dashArray: routeMode === 'straight' ? '8, 8' : undefined,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map)

        navPolylinesRef.current.push(segPolyline)
      } else {
        // [전체 코스 모드]
        if (routeMode === 'straight') {
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
          // [실제 도로 네비게이션 모드]
          for (let i = 0; i < places.length - 1; i++) {
            const key = `${i + 1}-${i + 2}`
            const roadPoints = osrmRoutes[key] || [routeLatLngs[i], routeLatLngs[i + 1]]

            const navPolyline = L.polyline(roadPoints, {
              color: '#2563eb',
              weight: 5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map)

            navPolylinesRef.current.push(navPolyline)
          }
        }
      }

      // ─── 2. 숫자 핀 마커 그리기 & 클릭 이벤트 연결 ───
      places.forEach((place, idx) => {
        const [lat, lng] = routeLatLngs[idx]
        const isActive = activeId === place.id

        // 핀 강조 조건 (임의 핀 선택 / 순차 구간 선택 / 1차 클릭 출발 스팟)
        const isCustomSelectedSpot = customPinPair !== null && (place.order === customPinPair[0] || place.order === customPinPair[1])
        const isSegmentSpot = selectedSegment !== null && (place.order === selectedSegment || place.order === selectedSegment + 1)
        const isStartPinSpot = customStartPin !== null && place.order === customStartPin

        const isHighlighted = isCustomSelectedSpot || isSegmentSpot || isStartPinSpot
        const isDimmed = (customPinPair !== null && !isCustomSelectedSpot) || (selectedSegment !== null && !isSegmentSpot)

        const iconHtml = `
          <div style="
            width: ${isHighlighted ? '38px' : '32px'};
            height: ${isHighlighted ? '38px' : '32px'};
            border-radius: 50%;
            background: ${isActive ? '#f59e0b' : isStartPinSpot ? '#eab308' : isHighlighted ? '#2563eb' : '#0f172a'};
            color: ${isActive ? '#0f172a' : '#ffffff'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isHighlighted ? '17px' : '15px'};
            font-weight: 900;
            box-shadow: ${isHighlighted ? '0 0 16px rgba(37,99,235,0.9)' : '0 4px 10px rgba(0,0,0,0.4)'};
            border: 3px solid ${isActive ? '#ffffff' : isStartPinSpot ? '#fef08a' : isHighlighted ? '#60a5fa' : '#f59e0b'};
            transform: ${isActive ? 'scale(1.3)' : isHighlighted ? 'scale(1.2)' : 'scale(1)'};
            opacity: ${isDimmed ? '0.3' : '1'};
            transition: all 0.25s ease;
            cursor: pointer;
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
            isStartPinSpot
              ? ' <span style="color:#eab308; font-weight:bold;">(🎯 출발 선택됨 - 도착 핀 클릭!)</span>'
              : isHighlighted
              ? ' <span style="color:#2563eb; font-weight:bold;">(선택 경로 스팟)</span>'
              : ''
          }`,
          {
            direction: 'top',
            offset: [0, -18],
          },
        )

        // 마커 클릭 시 1번 핀 -> 5번 핀 등 임의 선택 로직!
        marker.on('click', () => {
          if (customStartPinRef.current === null) {
            // 첫 번째 핀 클릭
            customStartPinRef.current = place.order
            setCustomStartPin(place.order)
            setSelectedSegment(null)
            setCustomPinPair(null)
          } else {
            // 두 번째 핀 클릭 ➔ 1번 ➔ 5번 직통 최적 도로 길찾기!
            const startPin = customStartPinRef.current
            const endPin = place.order
            if (startPin !== endPin) {
              handleSelectCustomPair([startPin, endPin])
            } else {
              setCustomStartPin(null)
              customStartPinRef.current = null
            }
          }
        })

        marker.on('mouseover', () => onHover(place.id))
        marker.on('mouseout', () => onHover(null))

        markersRef.current[place.id] = marker
      })

      // 최초 1회만 카메라 자동 맞춤
      const isPlacesChanged = prevPlacesKeyRef.current !== placesKey
      if (routeLatLngs.length > 0 && (!isMapInitializedRef.current || isPlacesChanged)) {
        const bounds = L.latLngBounds(routeLatLngs)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
        isMapInitializedRef.current = true
        prevPlacesKeyRef.current = placesKey
      }
    })
  }, [places, activeId, onHover, placesKey, routeMode, selectedSegment, customPinPair, customStartPin, osrmRoutes])

  // 선택 상태 표시 텍스트
  const currentSegmentText = customPinPair
    ? `🎯 ${customPinPair[0]}번 ➔ ${customPinPair[1]}번 (${places[customPinPair[0] - 1]?.name} ➔ ${places[customPinPair[1] - 1]?.name})`
    : selectedSegment !== null
    ? `📍 ${selectedSegment}번 ➔ ${selectedSegment + 1}번 (${places[selectedSegment - 1]?.name} ➔ ${places[selectedSegment]?.name})`
    : customStartPin !== null
    ? `📍 ${customStartPin}번 출발 선택됨! (도착할 핀 클릭)`
    : `🌐 전체 ${places.length}개 코스`

  return (
    <div className="relative h-full min-h-[460px] w-full overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-xl">
      {/* ─── 지도 위 100% 안쪽에 상단 컨트롤 오버레이 배치 (스크롤 시 절대 가려지지 않음!) ─── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky-200/90 bg-white/95 p-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <Button
            type="button"
            size="sm"
            onClick={() => setRouteMode('straight')}
            className={cn(
              'h-8 px-2.5 text-xs font-bold rounded-lg transition-all gap-1 cursor-pointer',
              routeMode === 'straight'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60',
            )}
          >
            <Route className="size-3.5 text-amber-400" />
            <span>📏 직선</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setRouteMode('navigation')}
            className={cn(
              'h-8 px-2.5 text-xs font-bold rounded-lg transition-all gap-1 cursor-pointer',
              routeMode === 'navigation'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60',
            )}
          >
            <Navigation className="size-3.5 text-sky-200" />
            <span>🚗 🗺️ 도로 길찾기</span>
          </Button>
        </div>

        {/* 🧭 구간 선택 드롭다운 트리거 버튼 (지도 내 상단 배치) */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsSegmentOpen((prev) => !prev)}
            className={cn(
              'h-8 px-3 text-xs font-bold rounded-xl gap-1.5 transition-all shadow-xs cursor-pointer border',
              customPinPair || selectedSegment !== null
                ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow-blue-500/20'
                : customStartPin !== null
                ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-600',
            )}
          >
            <Compass className="size-3.5" />
            <span className="truncate max-w-[140px] sm:max-w-[210px]">{currentSegmentText}</span>
            {isSegmentOpen ? <ChevronUp className="size-3.5 ml-0.5" /> : <ChevronDown className="size-3.5 ml-0.5" />}
          </Button>

          {(customPinPair || selectedSegment !== null || customStartPin !== null) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              className="h-8 px-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border-slate-300 rounded-xl"
              title="전체 코스 보기로 해제"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ─── 핀 직접 선택 안내 뱃지 (지도에서 1번 핀 클릭 시 노출) ─── */}
      {customStartPin !== null && (
        <div className="absolute top-16 left-3 right-3 z-20 flex items-center justify-between rounded-xl bg-amber-400 text-slate-950 border border-amber-300 px-3 py-1.5 text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-amber-900" />
            📍 {customStartPin}번 ({places[customStartPin - 1]?.name}) 선택됨! 도착할 핀(예: 5번)을 지도에서 눌러주세요!
          </span>
          <button
            type="button"
            onClick={() => {
              setCustomStartPin(null)
              customStartPinRef.current = null
            }}
            className="text-amber-950 hover:bg-amber-500/50 px-1.5 py-0.5 rounded-md font-bold"
          >
            취소 ✕
          </button>
        </div>
      )}

      {/* ─── 펼쳐지는 드롭다운 메뉴 (지도 위로 오버레이) ─── */}
      {isSegmentOpen && (
        <div className="absolute top-15 left-3 right-3 z-30 max-h-[360px] overflow-y-auto rounded-2xl border border-sky-300 bg-white/98 p-3.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="size-4 text-amber-500" />
              구간선택 (지도 핀 2개 직접 클릭 OR 아래 목록 선택)
            </span>
            <button
              type="button"
              onClick={() => setIsSegmentOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-0.5"
            >
              닫기 ✕
            </button>
          </div>

          <div className="grid gap-2">
            {/* 전체 코스 보기 옵션 */}
            <button
              type="button"
              onClick={handleResetAll}
              className={cn(
                'flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer',
                selectedSegment === null && customPinPair === null
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🌐</span>
                <span>전체 {places.length}개 코스 한눈에 보기</span>
              </div>
              {selectedSegment === null && customPinPair === null && <CheckCircle2 className="size-4 text-slate-950" />}
            </button>

            {/* 인기 추천 임의 핀 쌍 프리셋 (예: 1번➔5번 직통) */}
            {places.length >= 5 && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2 space-y-1.5">
                <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                  <Navigation className="size-3.5 text-blue-600" /> 🎯 주요 임의 직통 경로 (1번➔5번 등) 바로보기:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectCustomPair([1, 5])}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1',
                      customPinPair?.[0] === 1 && customPinPair?.[1] === 5
                        ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                        : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-100',
                    )}
                  >
                    <span>1번 ➔ 5번 ({places[0]?.name} ➔ {places[4]?.name})</span>
                  </button>

                  {places.length >= 8 && (
                    <button
                      type="button"
                      onClick={() => handleSelectCustomPair([2, 8])}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1',
                        customPinPair?.[0] === 2 && customPinPair?.[1] === 8
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                          : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-100',
                      )}
                    >
                      <span>2번 ➔ 8번</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 순차 구간 목록 (1번➔2번, 2번➔3번...) */}
            <div className="space-y-1 pt-1">
              <p className="text-[11px] font-bold text-slate-500">📍 순차 구간별 보기:</p>
              {places.slice(0, -1).map((fromP, idx) => {
                const segNum = idx + 1
                const toP = places[idx + 1]
                const isSelected = selectedSegment === segNum && customPinPair === null

                return (
                  <button
                    key={`dropdown-seg-${segNum}`}
                    type="button"
                    onClick={() => handleSelectSegment(segNum)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black',
                        isSelected ? 'bg-white text-blue-700' : 'bg-slate-900 text-white'
                      )}>
                        {segNum}
                      </span>
                      <span className="truncate">{fromP.name}</span>
                      <ArrowRight className={cn('size-3.5 shrink-0', isSelected ? 'text-blue-200' : 'text-slate-400')} />
                      <span className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black',
                        isSelected ? 'bg-white text-blue-700' : 'bg-slate-900 text-white'
                      )}>
                        {segNum + 1}
                      </span>
                      <span className="truncate">{toP.name}</span>
                    </div>

                    {isSelected && <CheckCircle2 className="size-4 text-white shrink-0 ml-2" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Leaflet 지도 캔버스 ─── */}
      <div ref={containerRef} className="h-full w-full min-h-[460px] z-0" />

      {/* 하단 전체 코스 보기 리셋 버튼 */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleResetAll}
        className="absolute bottom-3 right-3 z-10 h-8 gap-1.5 text-xs font-bold text-slate-800 bg-white/95 border-slate-300 hover:bg-slate-100 shadow-md backdrop-blur-md rounded-xl cursor-pointer"
      >
        <Maximize2 className="size-3.5 text-amber-600" />
        <span>🎯 전체 코스 보기</span>
      </Button>
    </div>
  )
}
