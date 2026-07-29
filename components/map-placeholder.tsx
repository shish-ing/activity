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
  // 상단 스티키 헤더 바에서 조작할 때 전달받는 제어 프로퍼티 (선택 사항)
  routeMode?: 'straight' | 'navigation'
  selectedSegment?: number | null
  customPinPair?: [number, number] | null
  customStartPin?: number | null
  setCustomStartPin?: (pin: number | null) => void
  onSelectCustomPair?: (pair: [number, number]) => void
  onResetAll?: () => void
  showInternalControls?: boolean
}

export function MapPlaceholder({
  places,
  activeId,
  onHover,
  routeMode: externalRouteMode,
  selectedSegment: externalSelectedSegment,
  customPinPair: externalCustomPinPair,
  customStartPin: externalCustomStartPin,
  setCustomStartPin: externalSetCustomStartPin,
  onSelectCustomPair,
  onResetAll,
  showInternalControls = false,
}: MapPlaceholderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const polylineRef = useRef<any>(null)
  const navPolylinesRef = useRef<any[]>([])
  
  const isMapInitializedRef = useRef<boolean>(false)
  const prevPlacesKeyRef = useRef<string>('')

  // 내부 모드 상태 (외부 프로퍼티가 안넘어올 경우 폴백)
  const [internalRouteMode, setInternalRouteMode] = useState<'straight' | 'navigation'>('navigation')
  const [internalSelectedSegment, setInternalSelectedSegment] = useState<number | null>(null)
  const [internalCustomPinPair, setInternalCustomPinPair] = useState<[number, number] | null>(null)
  const [internalCustomStartPin, setInternalCustomStartPin] = useState<number | null>(null)

  const routeMode = externalRouteMode ?? internalRouteMode
  const selectedSegment = externalSelectedSegment !== undefined ? externalSelectedSegment : internalSelectedSegment
  const customPinPair = externalCustomPinPair !== undefined ? externalCustomPinPair : internalCustomPinPair
  const customStartPin = externalCustomStartPin !== undefined ? externalCustomStartPin : internalCustomStartPin

  const customStartPinRef = useRef<number | null>(customStartPin)
  useEffect(() => {
    customStartPinRef.current = customStartPin
  }, [customStartPin])

  // OSRM 네비게이션 경로 좌표 캐시 (구간 키 ➔ latLngs)
  const [osrmRoutes, setOsrmRoutes] = useState<Record<string, [number, number][]>>({})

  // 장소 구성 고유 식별키
  const placesKey = places.map((p) => p.id).join(',')

  // OSRM 실시간 도로 길찾기 API 호출
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

  // 전체 화면 카메라 맞춤 및 리셋
  function handleResetAll() {
    if (onResetAll) {
      onResetAll()
    } else {
      setInternalSelectedSegment(null)
      setInternalCustomPinPair(null)
      setInternalCustomStartPin(null)
    }
    customStartPinRef.current = null

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

  // 🎯 임의 2개 핀 쌍 직접 선택 (예: 1번➔5번)
  function handleSelectCustomPair(pair: [number, number]) {
    if (onSelectCustomPair) {
      onSelectCustomPair(pair)
    } else {
      setInternalCustomPinPair(pair)
      setInternalSelectedSegment(null)
      setInternalCustomStartPin(null)
    }
    customStartPinRef.current = null

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

      // ─── 1. 경로선 그리기 (routeMode === 'straight' vs routeMode === 'navigation') ───
      if (routeMode === 'straight') {
        // [📏 간결한 직선 동선 모드]
        if (customPinPair) {
          const [pinA, pinB] = customPinPair
          const startPt = routeLatLngs[pinA - 1]
          const endPt = routeLatLngs[pinB - 1]
          if (startPt && endPt) {
            polylineRef.current = L.polyline([startPt, endPt], {
              color: '#f59e0b',
              weight: 6,
              dashArray: '8, 8',
              opacity: 1.0,
              lineJoin: 'round',
            }).addTo(map)
          }
        } else if (selectedSegment !== null) {
          const idx = selectedSegment - 1
          if (routeLatLngs[idx] && routeLatLngs[idx + 1]) {
            polylineRef.current = L.polyline([routeLatLngs[idx], routeLatLngs[idx + 1]], {
              color: '#f59e0b',
              weight: 6,
              dashArray: '8, 8',
              opacity: 1.0,
              lineJoin: 'round',
            }).addTo(map)
          }
        } else {
          if (routeLatLngs.length > 1) {
            polylineRef.current = L.polyline(routeLatLngs, {
              color: '#f59e0b',
              weight: 5,
              dashArray: '8, 8',
              opacity: 0.9,
              lineJoin: 'round',
            }).addTo(map)
          }
        }
      } else {
        // [🚗 🗺️ 실제 도로 길찾기 네비게이션 모드]
        if (customPinPair) {
          const [pinA, pinB] = customPinPair
          const customKey = `custom-${pinA}-${pinB}`
          const points = osrmRoutes[customKey] || [routeLatLngs[pinA - 1], routeLatLngs[pinB - 1]]

          const customPolyline = L.polyline(points, {
            color: '#2563eb',
            weight: 7,
            opacity: 1.0,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map)

          navPolylinesRef.current.push(customPolyline)
        } else if (selectedSegment !== null) {
          const idx = selectedSegment - 1
          const key = `${selectedSegment}-${selectedSegment + 1}`
          const points = osrmRoutes[key] || [routeLatLngs[idx], routeLatLngs[idx + 1]]

          const segPolyline = L.polyline(points, {
            color: '#2563eb',
            weight: 7,
            opacity: 1.0,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map)

          navPolylinesRef.current.push(segPolyline)
        } else {
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
            if (externalSetCustomStartPin) {
              externalSetCustomStartPin(place.order)
            } else {
              setInternalCustomStartPin(place.order)
            }
            customStartPinRef.current = place.order
          } else {
            // 두 번째 핀 클릭 ➔ 1번 ➔ 5번 직통 최적 도로 길찾기!
            const startPin = customStartPinRef.current
            const endPin = place.order
            if (startPin !== endPin) {
              handleSelectCustomPair([startPin, endPin])
            } else {
              if (externalSetCustomStartPin) {
                externalSetCustomStartPin(null)
              } else {
                setInternalCustomStartPin(null)
              }
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

  return (
    <div className="relative h-full min-h-[460px] w-full flex flex-col gap-2">
      {/* ─── 핀 직접 선택 안내 뱃지 (지도에서 1번 핀 클릭 시 노출) ─── */}
      {customStartPin !== null && (
        <div className="rounded-xl bg-amber-400 text-slate-950 border border-amber-300 px-3 py-2 text-xs font-bold shadow-md flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-amber-900" />
            📍 {customStartPin}번 ({places[customStartPin - 1]?.name}) 선택됨! 도착할 핀(예: 5번)을 지도에서 눌러주세요!
          </span>
          <button
            type="button"
            onClick={() => {
              if (externalSetCustomStartPin) externalSetCustomStartPin(null)
              else setInternalCustomStartPin(null)
              customStartPinRef.current = null
            }}
            className="text-amber-950 hover:bg-amber-500/50 px-1.5 py-0.5 rounded-md font-bold"
          >
            취소 ✕
          </button>
        </div>
      )}

      {/* ─── Leaflet 지도 캔버스 ─── */}
      <div className="relative h-full min-h-[460px] w-full overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-xl flex-1">
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
    </div>
  )
}
