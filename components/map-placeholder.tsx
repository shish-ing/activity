'use client'

import { useEffect, useRef, useState } from 'react'
import type { Place } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Maximize2, Sparkles } from 'lucide-react'
import { isPlaceClosedByAdmin, isPlaceCurrentlyOpen } from '@/lib/admin-storage'
import { getAppLang, t, tPlaceName, type AppLang } from '@/lib/i18n'

type MapPlaceholderProps = {
  places: Place[]
  activeId: string | null
  onHover: (id: string | null) => void
  startLocation?: string
  routeMode?: 'straight' | 'navigation'
  selectedSegment?: number | null
  customPinPair?: [number, number] | null
  customStartPin?: number | null
  setCustomStartPin?: (pin: number | null) => void
  onSelectCustomPair?: (pair: [number, number]) => void
  onResetAll?: () => void
}

function getStartLocationCoords(startLocName?: string, firstPlace?: Place): { lat: number; lng: number; name: string } {
  const loc = startLocName || firstPlace?.name || '전주 한옥마을'
  if (loc.includes('전주역')) return { lat: 35.8490, lng: 127.1615, name: '전주역' }
  if (loc.includes('터미널')) return { lat: 35.8360, lng: 127.1320, name: '전주고속버스터미널' }
  if (loc.includes('전북대')) return { lat: 35.8470, lng: 127.1290, name: '전북대학교' }
  if (loc.includes('서신')) return { lat: 35.8300, lng: 127.1180, name: '서신동' }
  if (loc.includes('효자') || loc.includes('도청')) return { lat: 35.8170, lng: 127.1010, name: '전북도청/효자동' }
  if (loc.includes('송천') || loc.includes('에코')) return { lat: 35.8670, lng: 127.1350, name: '송천동/에코시티' }
  if (loc.includes('혁신') || loc.includes('만성')) return { lat: 35.8340, lng: 127.0650, name: '혁신도시' }
  if (loc.includes('객사') || loc.includes('객리단길')) return { lat: 35.8178, lng: 127.1442, name: '전주 객사' }

  if (firstPlace?.lat && firstPlace?.lng) {
    return { lat: firstPlace.lat - 0.0015, lng: firstPlace.lng - 0.0015, name: loc }
  }
  return { lat: 35.8133, lng: 127.1492, name: '전주 한옥마을' }
}

export function MapPlaceholder({
  places,
  activeId,
  onHover,
  startLocation,
  routeMode: externalRouteMode,
  selectedSegment: externalSelectedSegment,
  customPinPair: externalCustomPinPair,
  customStartPin: externalCustomStartPin,
  setCustomStartPin: externalSetCustomStartPin,
  onSelectCustomPair,
  onResetAll,
}: MapPlaceholderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const myLocationMarkerRef = useRef<any>(null)
  const polylineRef = useRef<any>(null)
  const navPolylinesRef = useRef<any[]>([])
  
  const isMapInitializedRef = useRef<boolean>(false)
  const prevPlacesKeyRef = useRef<string>('')
  const [lang, setLang] = useState<AppLang>('ko')

  useEffect(() => {
    setLang(getAppLang())
    const handleLangChange = () => setLang(getAppLang())
    window.addEventListener('jeonju_lang_changed', handleLangChange)
    window.addEventListener('storage', handleLangChange)
    return () => {
      window.removeEventListener('jeonju_lang_changed', handleLangChange)
      window.removeEventListener('storage', handleLangChange)
    }
  }, [])

  // 🔵 내 실시간 위치 (0초 즉시 초기화 & 백그라운드 GPS 갱신)
  const [myLocation, setMyLocation] = useState<{
    lat: number
    lng: number
    isGps: boolean
    name: string
  }>(() => {
    const loc = getStartLocationCoords(startLocation, places[0])
    return { ...loc, isGps: false }
  })

  useEffect(() => {
    let isMounted = true
    const fallbackLoc = getStartLocationCoords(startLocation, places[0])
    setMyLocation({ ...fallbackLoc, isGps: false })

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!isMounted) return
            setMyLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              isGps: true,
              name: '현재 실시간 GPS',
            })
          },
          () => {},
          { enableHighAccuracy: false, timeout: 1500, maximumAge: 30000 }
        )
      } catch (e) {}
    }

    return () => {
      isMounted = false
    }
  }, [startLocation, places])

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

  // OSRM 병렬 고속 길찾기 API 호출 (직선 좌표 0초 즉시 선표시 ➔ OSRM 병렬 로딩)
  useEffect(() => {
    if (places.length < 2) return

    let isMounted = true
    const controller = new AbortController()

    async function fetchOsrmRoutesParallel() {
      const routesMap: Record<string, [number, number][]> = {}
      const promises: Promise<void>[] = []

      // 1) 모든 순차 구간 0초 직선 좌표 즉시 세팅
      for (let i = 0; i < places.length - 1; i++) {
        const from = places[i]
        const to = places[i + 1]
        const fromLat = from.lat || 35.8133 + (from.mapY - 50) * 0.0002
        const fromLng = from.lng || 127.1492 + (from.mapX - 30) * 0.0002
        const toLat = to.lat || 35.8133 + (to.mapY - 50) * 0.0002
        const toLng = to.lng || 127.1492 + (to.mapX - 30) * 0.0002
        const key = `${i + 1}-${i + 2}`

        routesMap[key] = [[fromLat, fromLng], [toLat, toLng]]

        const p = fetch(
          `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`,
          { signal: controller.signal }
        )
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const coords = data?.routes?.[0]?.geometry?.coordinates
            if (coords && coords.length > 0) {
              routesMap[key] = coords.map((c: [number, number]) => [c[1], c[0]])
            }
          })
          .catch(() => {})

        promises.push(p)
      }

      // 2) 임의 핀 쌍 경로
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

          routesMap[customKey] = [[fromLat, fromLng], [toLat, toLng]]

          const p = fetch(
            `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`,
            { signal: controller.signal }
          )
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              const coords = data?.routes?.[0]?.geometry?.coordinates
              if (coords && coords.length > 0) {
                routesMap[customKey] = coords.map((c: [number, number]) => [c[1], c[0]])
              }
            })
            .catch(() => {})

          promises.push(p)
        }
      }

      // 0초에 1차 직선 라인 즉시 표출
      if (isMounted) {
        setOsrmRoutes({ ...routesMap })
      }

      // 1초 타임아웃 제한으로 병렬 로딩 완료 후 정밀 곡선 라인으로 교체
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1000))
      await Promise.race([Promise.all(promises), timeoutPromise])

      if (isMounted) {
        setOsrmRoutes({ ...routesMap })
      }
    }

    fetchOsrmRoutesParallel()

    return () => {
      isMounted = false
      controller.abort()
    }
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

        const isClosedPin = !isPlaceCurrentlyOpen(place.name, place.operatingHours)
        const statusBadgeHtml = isClosedPin
          ? ' <span style="color:#ef4444; font-weight:bold;">(🔴 영업종료·휴업)</span>'
          : ' <span style="color:#10b981; font-weight:bold;">(🟢 영업중)</span>'

        marker.bindTooltip(
          `<b>${place.order}번. ${place.name}</b>${statusBadgeHtml}${
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

      // ─── 3. 🔵 내 위치 (GPS 실시간 위치 또는 출발지 기준) 마커 생성 ───
      if (myLocationMarkerRef.current) {
        myLocationMarkerRef.current.remove()
        myLocationMarkerRef.current = null
      }

      if (myLocation) {
        const myIconHtml = `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0px; border-radius: 50%; background: rgba(37, 99, 235, 0.35); border: 2px solid #3b82f6;"></div>
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: #2563eb;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              font-weight: 900;
              box-shadow: 0 0 14px rgba(37, 99, 235, 0.9);
              border: 3px solid #ffffff;
              z-index: 2;
            ">
              🔵
            </div>
          </div>
        `

        const myIcon = L.divIcon({
          html: myIconHtml,
          className: 'custom-my-location-marker',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        })

        const myMarker = L.marker([myLocation.lat, myLocation.lng], { icon: myIcon, zIndexOffset: 1000 }).addTo(map)
        myMarker.bindTooltip(
          `<b>🔵 내 위치</b> (${myLocation.isGps ? '실시간 GPS 연동' : '출발지 기준: ' + myLocation.name})`,
          { direction: 'top', offset: [0, -18] }
        )
        myLocationMarkerRef.current = myMarker
      }

      // 최초 1회만 카메라 자동 맞춤
      const isPlacesChanged = prevPlacesKeyRef.current !== placesKey
      if (routeLatLngs.length > 0 && (!isMapInitializedRef.current || isPlacesChanged)) {
        const bounds = L.latLngBounds(routeLatLngs)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
        isMapInitializedRef.current = true
        prevPlacesKeyRef.current = placesKey
      }
    })
  }, [places, activeId, onHover, placesKey, routeMode, selectedSegment, customPinPair, customStartPin, osrmRoutes, myLocation])

  const handleFlyToMyLocation = () => {
    if (mapRef.current && myLocation) {
      mapRef.current.flyTo([myLocation.lat, myLocation.lng], 16, { duration: 1.2 })
    }
  }

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
            className="text-amber-950 hover:bg-amber-500/50 px-1.5 py-0.5 rounded-md font-bold cursor-pointer"
          >
            취소 ✕
          </button>
        </div>
      )}

      {/* ─── Leaflet 지도 캔버스 ─── */}
      <div className="relative h-full min-h-[460px] w-full overflow-hidden rounded-2xl border border-sky-200/80 bg-white shadow-xl flex-1">
        <div ref={containerRef} className="h-full w-full min-h-[460px] z-0" />

        {/* 좌측 상단: 내 위치 버튼 */}
        {myLocation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFlyToMyLocation}
            className="absolute top-3 left-3 z-10 h-8 gap-1.5 text-xs font-bold text-blue-900 bg-white/95 border-blue-300 hover:bg-blue-50 shadow-md backdrop-blur-md rounded-xl cursor-pointer"
            title="현재 내 위치로 시점 이동"
          >
            <span className="relative flex size-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-blue-600"></span>
            </span>
            <span>🔵 {t('내 위치', 'My Location', lang)} ({myLocation.isGps ? 'GPS' : tPlaceName(myLocation.name, lang)})</span>
          </Button>
        )}

        {/* 우측 하단: 전체 코스 보기 리셋 버튼 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetAll}
          className="absolute bottom-3 right-3 z-10 h-8 gap-1.5 text-xs font-bold text-slate-800 bg-white/95 border-slate-300 hover:bg-slate-100 shadow-md backdrop-blur-md rounded-xl cursor-pointer"
        >
          <Maximize2 className="size-3.5 text-amber-600" />
          <span>🎯 {t('전체 코스 보기', 'View All Spots', lang)}</span>
        </Button>
      </div>
    </div>
  )
}
