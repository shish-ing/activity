'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowRight, Bus, Calendar, Car, CheckCircle2, Clock, Footprints, Heart, MapPin, Plus, RefreshCw, Search, Share2, Sparkles, SunMedium, Utensils, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlaceCard } from '@/components/place-card'
import { MapPlaceholder } from '@/components/map-placeholder'
import { BudgetPieChart } from '@/components/budget-pie-chart'
import {
  ALTERNATIVE_PLACES,
  CURRENT_WEATHER,
  RECOMMENDED_PLACES,
  type Place,
  type Weather,
} from '@/lib/mock-data'
import { JEONJU_PLACES_DATABASE } from '@/app/api/places/search/route'

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

// 위도/경도 또는 지도 좌표 기반 실질 지리적 거리 계산 함수
function getPlaceDistance(a: Place, b: Place): number {
  if (a.lat && a.lng && b.lat && b.lng) {
    const dLat = (a.lat - b.lat) * 111
    const dLng = (a.lng - b.lng) * 88
    return dLat * dLat + dLng * dLng
  }
  const dX = (a.mapX ?? 50) - (b.mapX ?? 50)
  const dY = (a.mapY ?? 50) - (b.mapY ?? 50)
  return dX * dX + dY * dY
}

// 모든 방문 장소에 대해 항상 3개의 맛집, 3개의 감성 카페, 3개의 대표 특산품을 풍성하게 보장하는 헬퍼 함수
function ensureThreeDiningAndCafes(place: Place): Place {
  const diningPool = [
    { name: '한국집 (전주 3대 비빔밥/미슐랭)', distance: '도보 3분 이내', menu: '미슐랭 육회비빔밥', naverMapUrl: 'https://map.naver.com/v5/search/전주한국집' },
    { name: '현대옥 한옥마을점', distance: '도보 4분 이내', menu: '남부시장식 콩나물국밥 & 수란', naverMapUrl: 'https://map.naver.com/v5/search/현대옥' },
    { name: '베테랑 칼국수', distance: '도보 3분 이내', menu: '들깨 칼국수 & 수제 만두', naverMapUrl: 'https://map.naver.com/v5/search/베테랑칼국수' },
    { name: '교동떡갈비', distance: '도보 4분 이내', menu: '숯불 떡갈비 정식', naverMapUrl: 'https://map.naver.com/v5/search/교동떡갈비' },
    { name: '조점례 남부시장 피순대', distance: '도보 5분 이내', menu: '50년 전통 피순대 & 순대국밥', naverMapUrl: 'https://map.naver.com/v5/search/조점례피순대' },
    { name: '한벽집 (전주천 노포)', distance: '도보 4분 이내', menu: '민물 매운탕', naverMapUrl: 'https://map.naver.com/v5/search/한벽집' },
    { name: '노벨반점 (전주 물짜장 원조)', distance: '도보 6분 이내', menu: '해물 퓨전 물짜장', naverMapUrl: 'https://map.naver.com/v5/search/노벨반점' },
    { name: '진미집 (연탄 돼지불고기 노포)', distance: '도보 7분 이내', menu: '연탄 불고기 & 김밥', naverMapUrl: 'https://map.naver.com/v5/search/전주진미집' },
    { name: '메르밀진미집', distance: '도보 6분 이내', menu: '전주 메밀소바 & 콩국수', naverMapUrl: 'https://map.naver.com/v5/search/메르밀진미집' },
    { name: '서학동 로컬 백반', distance: '도보 3분 이내', menu: '전라도 가정식 백반 정식', naverMapUrl: 'https://map.naver.com/v5/search/서학동백반' },
  ]

  const cafePool = [
    { name: '외할머니솜씨', distance: '도보 3분 이내', menu: '흑임자 팥빙수 & 인절미 구이', naverMapUrl: 'https://map.naver.com/v5/search/외할머니솜씨' },
    { name: '교동 다원', distance: '도보 2분 이내', menu: '전통 황차 & 잎차', naverMapUrl: 'https://map.naver.com/v5/search/교동다원' },
    { name: '전주 한옥마을 전통찻집', distance: '도보 4분 이내', menu: '진한 수제 쌍화차 & 유과', naverMapUrl: 'https://map.naver.com/v5/search/전주한옥마을전통찻집' },
    { name: '동문길 핸드드립 로스터리', distance: '도보 3분 이내', menu: '수제 핸드드립 커피 & 스콘', naverMapUrl: 'https://map.naver.com/v5/search/동문길카페' },
    { name: '서학동 사진관 갤러리 카페', distance: '도보 2분 이내', menu: '드립 커피 & 샌드위치', naverMapUrl: 'https://map.naver.com/v5/search/서학동사진관' },
    { name: '연화정 호수 뷰 한옥 카페', distance: '도보 2분 이내', menu: '말차 라떼 & 아인슈페너', naverMapUrl: 'https://map.naver.com/v5/search/연화정카페' },
    { name: '써니 카페 (팔복예술공장)', distance: '도보 1분 이내', menu: '시그니처 팔복 라떼 & 디저트', naverMapUrl: 'https://map.naver.com/v5/search/써니카페' },
    { name: '꼬지따뽕 (자만벽화마을)', distance: '도보 2분 이내', menu: '생과일 에이드 & 디저트', naverMapUrl: 'https://map.naver.com/v5/search/꼬지따뽕' },
  ]

  const specialtyPool = [
    { name: 'PNB 풍년제과 본점', distance: '도보 3분 이내', item: '전주 수제 오리지널 초코파이 & 붓세 선물세트', naverMapUrl: 'https://map.naver.com/v5/search/PNB풍년제과본점' },
    { name: '교동 한지공예관 / 한지체험관', distance: '도보 2분 이내', item: '천년 전통 수제 한지 등, 한지 붓글씨 노트 & 부채', naverMapUrl: 'https://map.naver.com/v5/search/전주한지공예관' },
    { name: '전주 전통 모주도가', distance: '도보 4분 이내', item: '8가지 한약재 수제 전통 모주 1L / 선물세트', naverMapUrl: 'https://map.naver.com/v5/search/전주모주' },
    { name: '외할머니솜씨 수제 찰떡', distance: '도보 3분 이내', item: '당일 방앗간 수제 인절미 & 흑임자 찰떡', naverMapUrl: 'https://map.naver.com/v5/search/외할머니솜씨' },
    { name: '서학동 작가 공예샵', distance: '도보 2분 이내', item: '서학동 예술마을 작가 수제 도자기 컵 & 악세서리', naverMapUrl: 'https://map.naver.com/v5/search/서학동공예' },
    { name: '전주 전통 합죽선 명인관', distance: '도보 4분 이내', item: '수제 합죽선 부채 & 캘리그라피 손부채', naverMapUrl: 'https://map.naver.com/v5/search/전주합죽선' },
    { name: '전주 팔복 수제 과일청/통조림', distance: '도보 5분 이내', item: '전주 과수원 수제 복숭아 잼 & 통조림 세트', naverMapUrl: 'https://map.naver.com/v5/search/전주특산품' },
  ]

  const existingDining = place.nearbyDining || []
  const diningNames = new Set(existingDining.map((d) => d.name))
  const finalDining = [...existingDining]

  for (const d of diningPool) {
    if (finalDining.length >= 3) break
    if (!diningNames.has(d.name)) {
      diningNames.add(d.name)
      finalDining.push(d)
    }
  }

  const existingCafes = place.nearbyCafes || []
  const cafeNames = new Set(existingCafes.map((c) => c.name))
  const finalCafes = [...existingCafes]

  for (const c of cafePool) {
    if (finalCafes.length >= 3) break
    if (!cafeNames.has(c.name)) {
      cafeNames.add(c.name)
      finalCafes.push(c)
    }
  }

  const existingSpecialties = place.nearbySpecialties || []
  const specialtyNames = new Set(existingSpecialties.map((s) => s.name))
  const finalSpecialties = [...existingSpecialties]

  for (const s of specialtyPool) {
    if (finalSpecialties.length >= 3) break
    if (!specialtyNames.has(s.name)) {
      specialtyNames.add(s.name)
      finalSpecialties.push(s)
    }
  }

  return {
    ...place,
    nearbyDining: finalDining.slice(0, 3),
    nearbyCafes: finalCafes.slice(0, 3),
    nearbySpecialties: finalSpecialties.slice(0, 3),
  }
}

export function ResultView() {
  const searchParams = useSearchParams()
  const rawMustVisit = searchParams.get('mustVisit')
  const time = searchParams.get('time') || '3h'
  const transport = searchParams.get('transport') || 'walk' // 'walk' | 'transit' | 'car'
  const weatherParam = searchParams.get('weather') || 'auto' // 'auto' | 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'
  const companionParam = searchParams.get('companion') || 'couple' // 'solo' | 'couple' | 'friends' | 'family' | 'kids' | 'pet'
  const rawBudget = searchParams.get('budget')
  const startLocationParam = searchParams.get('startLocation') || '전주 한옥마을'
  const startAddressParam = searchParams.get('startAddress') || ''

  const [places, setPlaces] = useState<Place[]>(RECOMMENDED_PLACES)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [shared, setShared] = useState(false)
  const [weather, setWeather] = useState<Weather>(CURRENT_WEATHER)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<string>('')

  // 실시간 코스 추가 검색어 state
  const [addSearchInput, setAddSearchInput] = useState('')
  const [addedToastMessage, setAddedToastMessage] = useState<string | null>(null)
  const [showAddSuggestions, setShowAddSuggestions] = useState(false)

  // 사용자 선택 예산 숫자 (원)
  const userBudgetLimit = useMemo(() => {
    if (!rawBudget) return 500000
    const num = Number(rawBudget)
    if (isNaN(num)) return 500000
    if (num === 1) return 10000
    if (num === 3) return 30000
    if (num === 5) return 50000
    return num
  }, [rawBudget])

  const budgetDisplayLabel = useMemo(() => {
    if (userBudgetLimit === 0) return '0원 (100% 무료 명소 전용 코스)'
    if (userBudgetLimit >= 500000) return '50만원 이상 (넉넉한 럭셔리 코스)'
    return `${(userBudgetLimit / 10000).toLocaleString('ko-KR')}만원 맞춤`
  }, [userBudgetLimit])

  // 실시간 코스 추가 검색어 매칭 후보군 (DB 실제 명소 100% 우선 및 네이버 지도 위치 확인)
  const addPlaceSuggestions = useMemo(() => {
    if (!addSearchInput.trim()) return []
    const query = addSearchInput.toLowerCase().trim()
    const currentPlaceNames = new Set(places.map((p) => p.name.toLowerCase()))

    const dbMatches = JEONJU_PLACES_DATABASE.filter(
      (p) =>
        !currentPlaceNames.has(p.name.toLowerCase()) &&
        (p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))),
    )

    if (dbMatches.length > 0) {
      return dbMatches
    }

    // 커스텀 장소 위치 매칭 (전북대/통집 -> 전북대 구정문 좌표, 효자/cgv -> 효자동 좌표 등)
    const isTongjip = query.includes('통집')
    const isJeonbukdae = query.includes('전북대')
    const isHyoja = query.includes('효자')
    const isSeoshin = query.includes('서신')
    const isSongcheon = query.includes('송천') || query.includes('에코')

    const customLat = (isTongjip || isJeonbukdae) ? 35.8485 : isHyoja ? 35.8115 : isSeoshin ? 35.8300 : isSongcheon ? 35.8670 : 35.8140
    const customLng = (isTongjip || isJeonbukdae) ? 127.1298 : isHyoja ? 127.1085 : isSeoshin ? 127.1180 : isSongcheon ? 127.1350 : 127.1510
    const customAddress = (isTongjip || isJeonbukdae)
      ? '전북 전주시 덕진구 명륜3길 18-6 (전북대 구정문 부근)'
      : isHyoja
        ? '전북 전주시 완산구 효자동 부근'
        : `전북 전주시 ${addSearchInput} 부근`

    const customSuggestion = {
      name: isTongjip ? '🍺 전북대 통집 (전주 대표 안주·계란말이 노포 주점)' : `${addSearchInput} (네이버 지도 연동 스팟)`,
      category: isTongjip ? '🍺 전북대 로컬 주점 노포' : '네이버 지도 연동 스팟',
      cost: isTongjip ? 15000 : 0,
      costLabel: isTongjip ? '안주 15,000원 대' : '입장료/이용료 개별 확인',
      walkMinutes: 5,
      reason: isTongjip
        ? '전북대학교 구정문 근처에 위치한 대표 주점 노포 통집입니다.'
        : `사용자께서 네이버 지도로 직접 검색하여 동선에 추가하신 스팟 '${addSearchInput}'입니다.`,
      isMustVisit: true,
      mapX: (isTongjip || isJeonbukdae) ? 45 : 35,
      mapY: (isTongjip || isJeonbukdae) ? 20 : 50,
      lat: customLat,
      lng: customLng,
      address: customAddress,
      operatingHours: isTongjip ? '16:00 - 02:00 (일요일 휴무)' : '10:00 - 23:00 (네이버 지도 참조)',
      tags: isTongjip ? ['#전북대통집', '#통집', '#계란말이맛집'] : ['#실시간코스추가', `#${addSearchInput}`, '#네이버지도'],
      suggestedDuration: '1시간',
      tips: `💡 현지인 팁: 팝업 드롭다운의 '🗺️ 네이버 지도 위치 확인' 버튼을 누르면 네이버 지도 상의 실제 전주 주소를 먼저 확인하신 후 추가하실 수 있습니다.`,
      naverMapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(isTongjip ? '전북대통집' : addSearchInput)}`,
    }

    return [customSuggestion]
  }, [addSearchInput, places])

  // 장소를 코스 중간에 추가하고 최단 순선 동선으로 전체 재정렬하는 함수
  function handleAddPlaceToItinerary(itemToInsert: Omit<Place, 'id' | 'order'> | Place) {
    setPlaces((prev) => {
      const currentNames = new Set(prev.map((p) => p.name.toLowerCase()))
      if (currentNames.has(itemToInsert.name.toLowerCase())) {
        return prev
      }

      const newSpot: Place = ensureThreeDiningAndCafes({
        ...itemToInsert,
        id: `added-${Date.now()}`,
        order: prev.length + 1,
        isMustVisit: true,
        reason: itemToInsert.reason || `결과 화면에서 새로 검색하여 동선에 추가된 장소입니다.`,
      })

      const combinedPool = [...prev, newSpot]

      const startPointAnchor: Place = {
        id: 'start-anchor',
        order: 0,
        name: startLocationParam,
        category: '출발지',
        cost: 0,
        costLabel: '0원',
        walkMinutes: 0,
        reason: '출발지',
        isMustVisit: false,
        mapX: 50,
        mapY: 50,
        lat: startLocationParam.includes('전주역')
          ? 35.8490
          : startLocationParam.includes('터미널')
            ? 35.8360
            : startLocationParam.includes('전북대')
              ? 35.8470
              : 35.8133,
        lng: startLocationParam.includes('전주역')
          ? 127.1615
          : startLocationParam.includes('터미널')
            ? 127.1320
            : startLocationParam.includes('전북대')
              ? 127.1290
              : 127.1492,
      }

      const unvisited = [...combinedPool]
      const reOptimized: Place[] = []

      let nearestToStartIdx = 0
      let minStartDist = Infinity
      for (let i = 0; i < unvisited.length; i++) {
        const dist = getPlaceDistance(startPointAnchor, unvisited[i])
        if (dist < minStartDist) {
          minStartDist = dist
          nearestToStartIdx = i
        }
      }

      let current = unvisited.splice(nearestToStartIdx, 1)[0]
      reOptimized.push(current)

      while (unvisited.length > 0) {
        let nearestIdx = 0
        let minDistance = Infinity

        for (let i = 0; i < unvisited.length; i++) {
          const dist = getPlaceDistance(current, unvisited[i])
          if (dist < minDistance) {
            minDistance = dist
            nearestIdx = i
          }
        }

        current = unvisited.splice(nearestIdx, 1)[0]
        reOptimized.push(current)
      }

      return reOptimized.map((place, idx) => {
        let travelMins = 0
        if (idx > 0) {
          const prevPlace = reOptimized[idx - 1]
          const distSq = getPlaceDistance(prevPlace, place)
          const approxKm = Math.sqrt(distSq)
          travelMins = Math.max(3, Math.round(approxKm * 8 + 2))
        }
        return ensureThreeDiningAndCafes({
          ...place,
          order: idx + 1,
          walkMinutes: travelMins,
        })
      })
    })

    setAddedToastMessage(`✨ '${itemToInsert.name}'이(가) 코스에 새로 추가되었으며, 최단 지리적 동선으로 전체 코스가 자동 재정렬되었습니다!`)
    setAddSearchInput('')
    setShowAddSuggestions(false)

    setTimeout(() => {
      setAddedToastMessage(null)
    }, 4500)
  }

  // 출발지에서 1번째 추천 장소까지 이동 시내버스 & 네이버 지도 길찾기 안내 연동
  const firstPlaceTransitInfo = useMemo(() => {
    if (!places || places.length === 0) return null
    const firstSpot = places[0]
    const locName = (startLocationParam + ' ' + startAddressParam).toLowerCase()

    // 1. CGV 효자 / 몰오브효자 / 효자동 3가
    if (locName.includes('cgv 효자') || locName.includes('cgv효자') || locName.includes('효자몰') || (locName.includes('효자') && locName.includes('cgv'))) {
      return {
        busRoute: '🚌 전주 시내버스 119번, 165번, 3-2번 (효자몰·CGV 정류장 승차)',
        boardStop: '효자몰·CGV 정류장 탑승 (도보 1분)',
        alightStop: `${firstSpot.name} 인근 (전동성당·한옥마을) 정류장 하차 (도보 3분)`,
        duration: '대중교통 약 24분 (시내버스 20분 + 도보 4분 · 약 5.8km)',
        carDuration: '자차/택시 차로 약 14분 (5.8km · 예상 택시비 약 7,500원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1085,35.8115,CGV효자몰/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 2. 효자동 / 전북도청
    if (locName.includes('효자') || locName.includes('도청')) {
      return {
        busRoute: '🚌 전주 시내버스 119번, 165번, 380번 탑승',
        boardStop: '전북도청·효자동 정류장 탑승',
        alightStop: `${firstSpot.name} 정류장 하차 (도보 3분)`,
        duration: '대중교통 약 26분 (시내버스 22분 + 도보 4분 · 약 6.2km)',
        carDuration: '자차/택시 차로 약 15분 (6.2km · 예상 택시비 약 8,000원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1010,35.8170,전북도청/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 3. 서신동 / 이마트 전주점
    if (locName.includes('서신')) {
      return {
        busRoute: '🚌 전주 시내버스 119번, 684번, 79번 탑승',
        boardStop: '서신동 주민센터/이마트 정류장 탑승',
        alightStop: `${firstSpot.name} 정류장 하차 (도보 2분)`,
        duration: '대중교통 약 20분 (시내버스 16분 + 도보 4분 · 약 4.5km)',
        carDuration: '자차/택시 차로 약 11분 (4.5km · 예상 택시비 약 6,200원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1180,35.8300,서신동/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 4. 송천동 / 에코시티
    if (locName.includes('송천') || locName.includes('에코')) {
      return {
        busRoute: '🚌 전주 시내버스 165번, 999번, 119번 탑승',
        boardStop: '송천주공 / 에코시티 정류장 탑승',
        alightStop: `${firstSpot.name} 정류장 하차 (도보 3분)`,
        duration: '대중교통 약 28분 (시내버스 24분 + 도보 4분 · 약 7.2km)',
        carDuration: '자차/택시 차로 약 16분 (7.2km · 예상 택시비 약 9,000원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1350,35.8670,송천동/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 5. 혁신도시 / 만성동
    if (locName.includes('혁신') || locName.includes('만성')) {
      return {
        busRoute: '🚌 전주 시내버스 165번, 72번, 73번 탑승',
        boardStop: '혁신도시 국민연금공단 정류장 탑승',
        alightStop: `${firstSpot.name} 정류장 하차 (도보 3분)`,
        duration: '대중교통 약 35분 (시내버스 30분 + 도보 5분 · 약 10.5km)',
        carDuration: '자차/택시 차로 약 20분 (10.5km · 예상 택시비 약 13,000원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.0650,35.8340,혁신도시/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 6. 삼천동 / 평화동
    if (locName.includes('삼천') || locName.includes('평화')) {
      return {
        busRoute: '🚌 전주 시내버스 119번, 1000번, 165번 탑승',
        boardStop: '삼천동/평화동 정류장 탑승',
        alightStop: `${firstSpot.name} 정류장 하차 (도보 3분)`,
        duration: '대중교통 약 18분 (시내버스 14분 + 도보 4분 · 약 3.8km)',
        carDuration: '자차/택시 차로 약 10분 (3.8km · 예상 택시비 약 5,500원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1250,35.7980,삼천동/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 7. 아중리 / 우아동
    if (locName.includes('아중') || locName.includes('우아')) {
      return {
        busRoute: '🚌 전주 시내버스 1000번, 103번 탑승',
        boardStop: '아중리 정류장 탑승',
        alightStop: `${firstSpot.name} 정류장 하차 (도보 2분)`,
        duration: '대중교통 약 16분 (시내버스 12분 + 도보 4분 · 약 4.1km)',
        carDuration: '자차/택시 차로 약 9분 (4.1km · 예상 택시비 약 5,800원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1720,35.8310,아중리/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 8. 팔복동 / 팔복예술공장
    if (locName.includes('팔복')) {
      return {
        busRoute: '🚌 전주 시내버스 380번, 350번 탑승',
        boardStop: '팔복예술공장 정류장 탑승',
        alightStop: `${firstSpot.name} 정류장 하차 (도보 3분)`,
        duration: '대중교통 약 29분 (시내버스 24분 + 도보 5분 · 약 7.8km)',
        carDuration: '자차/택시 차로 약 16분 (7.8km · 예상 택시비 약 9,500원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.0980,35.8560,팔복동/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 9. 전주역
    if (locName.includes('전주역')) {
      return {
        busRoute: '🚌 전주 명품 시내버스 1000번, 119번, 535번 탑승',
        boardStop: '전주역 첫마을마중길 정류장 탑승',
        alightStop: `${firstSpot.name} 인근 (전동성당·한옥마을) 하차 (도보 2분)`,
        duration: '대중교통 약 18분 (시내버스 14분 + 도보 4분 · 약 3.8km)',
        carDuration: '자차/택시 차로 약 12분 (3.8km · 예상 택시비 약 5,500원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1615,35.8490,전주역/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 10. 터미널
    if (locName.includes('터미널')) {
      return {
        busRoute: '🚌 전주 시내버스 165번, 79번, 1000번 탑승',
        boardStop: '고속버스터미널 정류장 탑승',
        alightStop: `${firstSpot.name} 정류장 하차 (도보 3분)`,
        duration: '대중교통 약 12분 (시내버스 9분 + 도보 3분 · 약 2.5km)',
        carDuration: '자차/택시 차로 약 7분 (2.5km · 예상 택시비 약 4,500원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1320,35.8360,전주고속버스터미널/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 11. 전북대
    if (locName.includes('전북대')) {
      return {
        busRoute: '🚌 전주 시내버스 165번, 684번, 999번 탑승',
        boardStop: '전북대 구정문 정류장 탑승',
        alightStop: `${firstSpot.name} 정류장 하차 (도보 2분)`,
        duration: '대중교통 약 15분 (시내버스 11분 + 도보 4분 · 약 3.1km)',
        carDuration: '자차/택시 차로 약 9분 (3.1km · 예상 택시비 약 5,000원)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1290,35.8470,전북대학교/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 12. 객사
    if (locName.includes('객사')) {
      return {
        busRoute: '🚌 전주 시내버스 1000번, 165번 탑승 (또는 도보 산책)',
        boardStop: '객사 정류장 탑승 (영화의거리 도보 8분)',
        alightStop: `${firstSpot.name} 하차 (도보 2분)`,
        duration: '대중교통 약 8분 (도보 이동 시 약 10분 · 약 1.2km)',
        carDuration: '자차/택시 차로 약 4분 (1.2km · 기본요금)',
        mapUrl: `https://map.naver.com/v5/directions/-/127.1435,35.8185,전주객사/127.1492,35.8133,${encodeURIComponent(firstSpot.name)}/-/transit?c=15,0,0,0,dh`,
      }
    }

    // 13. 한옥마을 내부 인접 출발 시
    if (locName.includes('한옥마을') || locName.includes('전동성당')) {
      return {
        busRoute: '🚶 한옥마을 중심 인접 도보 이동',
        boardStop: '출발지 출발',
        alightStop: `${firstSpot.name} 도착 (도보 3분~7분)`,
        duration: '도보 산책 약 4분~8분 이내',
        carDuration: '자차 차로 약 3분',
        mapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(firstSpot.name)}`,
      }
    }

    // 14. 임의 입력 주소 일반 시내버스 연동
    return {
      busRoute: `🚌 전주 시내버스 119번, 165번, 1000번 (${startLocationParam} 부근 승차)`,
      boardStop: `${startLocationParam} 인근 정류장 탑승`,
      alightStop: `${firstSpot.name} 인근 정류장 하차 (도보 3분)`,
      duration: `대중교통 약 20분~30분 소요 (시내버스 연동)`,
      carDuration: `자차/택시 차로 약 10분~15분 소요`,
      mapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(startLocationParam + ' ' + firstSpot.name)}`,
    }
  }, [places, startLocationParam, startAddressParam])

  // 동행 유형 안내 라벨
  const companionLabel = useMemo(() => {
    switch (companionParam) {
      case 'couple':
        return { text: '💑 연인/커플 맞춤 (로맨틱 데이트, 드라마 촬영지, 수제 공방 & 인스타 핫플 큐레이션)', icon: Heart }
      case 'friends':
        return { text: '👫 친구끼리 맞춤 (팔복예술공장, 스물다섯스물하나 한벽굴, 7080 레트로 체험 큐레이션)', icon: Sparkles }
      case 'kids':
        return { text: '🧸 아이 동반 맞춤 (전주 수목원 온실, 연화정 도서관, 수제 한지 체험 & 어진박물관 큐레이션)', icon: Sparkles }
      case 'pet':
        return { text: '🐾 반려동물 동반 맞춤 (전주 수목원, 천변 징검다리, 아중호수 수중 데크 산책로 큐레이션)', icon: Footprints }
      case 'family':
        return { text: '👨‍👩‍👧‍👦 가족 여행 맞춤 (성균관스캔들 전주향교, 팔복예술공장 & 역사 사적지 큐레이션)', icon: Sparkles }
      default:
        return { text: '🎒 나홀로 여행 맞춤 (고즈넉한 한벽굴, 전주천변 대나무길 & 아중호수 야경 힐링 큐레이션)', icon: Sparkles }
    }
  }, [companionParam])

  // 이동수단 라벨 & 아이콘 (도보 / 대중교통 / 자차 이동반경 명확 구별)
  const transportLabel = useMemo(() => {
    switch (transport) {
      case 'car':
        return { text: '🚗 자차 이동 전용 (팔복예술공장·수목원 등 전주 전역 드라이브 & 추천 주차장)', icon: Car }
      case 'transit':
        return { text: '🚌 대중교통 이동 전용 (시내버스 15분 내 중거리 스팟 & 정류장 안내)', icon: Bus }
      default:
        return { text: '🚶 도보 이동 전용 (걸어서 부담 없는 300m~800m 인접 산책로 코스)', icon: Footprints }
    }
  }, [transport])

  const TransportIcon = transportLabel.icon

  // 시간 옵션 텍스트 라벨
  const timeLabel = useMemo(() => {
    switch (time) {
      case '1h':
        return '1시간 (가볍게 코스 · 1곳)'
      case '3h':
        return '3시간 (여유로운 코스 · 3곳)'
      case 'half':
        return '반나절 (4~5시간 코스 · 5곳 스팟)'
      case 'full':
        return '하루 (전주 최단 순선 풀 코스 · 7곳)'
      case '2days':
        return '이틀 (1박 2일 일정 · 10곳 전주 최단 순선 코스)'
      case '3days':
        return '사흘 (2박 3일 일정 · 14곳 전주 풀 코스)'
      default:
        return '시간 맞춤 추천'
    }
  }, [time])

  // 선택된 날씨 옵션별 큐레이션 타이틀 및 가이드 메시지
  const weatherCareMessage = useMemo(() => {
    switch (weatherParam) {
      case 'wind':
        return {
          icon: '🥶',
          title: '🥶 한파·찬 바람 맞춤 큐레이션:',
          text: '매서운 찬 바람을 피할 수 있도록 쾌적한 실내 팔복예술공장, 수제 공방, 지하 어진박물관, 연화정 한옥 도서관 위주로 최단 순선 정렬되었습니다.',
          bannerColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
        }
      case 'snow':
        return {
          icon: '❄️',
          title: '❄️ 한옥 설경·눈 오는 날 큐레이션:',
          text: '하얀 눈이 내려앉은 고즈넉한 한벽굴, 전주향교, 팔복예술공장 온실을 감상하는 최단 순선 동선입니다.',
          bannerColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
        }
      case 'rain':
        return {
          icon: '☔',
          title: '☔ 비 오는 날 낭만 큐레이션:',
          text: '빗소리를 들으며 즐기는 팔복예술공장 실내 미술관, 실내 공방, 아중호수 수중 산책로 위주로 큐레이션되었습니다.',
          bannerColor: 'border-teal-500/40 bg-teal-500/10 text-teal-300',
        }
      case 'clear':
        return {
          icon: '☀️',
          title: '☀️ 폭염·더위 맞춤 큐레이션:',
          text: '무더위 땡볕 야외 언덕을 피하고, 시원한 팔복예술공장 온실, 실내 공방, 지하 어진박물관으로 배치되었습니다.',
          bannerColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        }
      case 'cloudy':
        return {
          icon: '☁️',
          title: '☁️ 선선한 날씨 맞춤 큐레이션:',
          text: '햇살이 선선해 전주 수목원, 한벽굴 드라마 촬영지, 자만벽화마을, 아중호수 야경 산책을 즐기기 딱 좋은 날씨입니다.',
          bannerColor: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
        }
      default:
        // auto
        return {
          icon: weather.emoji,
          title: `🛰️ 실시간 날씨(${weather.summary}) 큐레이션:`,
          text: '선택한 출발지 및 예산 슬라이더 범위 내에서 최적의 장소와 최단 순선 경로가 제공됩니다.',
          bannerColor: 'border-accent/40 bg-accent/10 text-accent',
        }
    }
  }, [weatherParam, weather])

  // 날씨 기반 폭염/우천/한파 실내 스팟 우선배치 여부
  const isIndoorPriority = useMemo(() => {
    return (
      weatherParam === 'wind' ||
      weatherParam === 'snow' ||
      weatherParam === 'rain' ||
      weatherParam === 'clear' ||
      weather.condition === 'rain' ||
      weather.detail.includes('30°C')
    )
  }, [weather, weatherParam])

  // 선택한 출발지, 남은 시간, 예산, 이동수단, 동행 유형, 날씨 및 최단 경로 정렬
  useEffect(() => {
    const mustVisitNames = rawMustVisit
      ? rawMustVisit
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    const generated: Place[] = []
    const addedNames = new Set<string>()
    let orderCounter = 1

    // 1. 사용자가 직접 검색/추가한 필수 방문지 먼저 추가
    mustVisitNames.forEach((name) => {
      const foundInDb = JEONJU_PLACES_DATABASE.find(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      )

      if (foundInDb && !addedNames.has(foundInDb.name.toLowerCase())) {
        addedNames.add(foundInDb.name.toLowerCase())
        const isOutdoorExtreme = isIndoorPriority && foundInDb.isIndoor === false
        generated.push(ensureThreeDiningAndCafes({
          ...foundInDb,
          id: `mv-${orderCounter}`,
          order: orderCounter++,
          isMustVisit: true,
          reason: `사용자께서 직접 검색하여 추가하신 필수 방문지 '${name}'입니다.`,
          warning: isOutdoorExtreme
            ? `⚠️ 악천후/한파 주의: 야외 땡볕 또는 찬 바람 구간입니다. 실내 공방/박물관 휴식을 병행하세요.`
            : foundInDb.warning,
        }))
      } else if (!addedNames.has(name.toLowerCase())) {
        addedNames.add(name.toLowerCase())
        generated.push(ensureThreeDiningAndCafes({
          id: `mv-custom-${orderCounter}`,
          order: orderCounter++,
          name: name,
          category: '검색 추가 · 명소',
          subCategory: 'spot',
          cost: 0,
          costLabel: '입장료/비용 확인',
          walkMinutes: 8,
          reason: `네이버 지도로 직접 검색하여 추가하신 필수 방문지 '${name}'입니다.`,
          isMustVisit: true,
          mapX: Math.floor(Math.random() * 50) + 25,
          mapY: Math.floor(Math.random() * 50) + 25,
          lat: 35.8140 + (Math.random() * 0.006 - 0.003),
          lng: 127.1510 + (Math.random() * 0.006 - 0.003),
          address: `전북 전주시 완산구 ${name} 부근`,
          operatingHours: '네이버 지도 참조',
          tags: ['#직접검색추가', '#필수방문지', '#네이버지도'],
          suggestedDuration: '45분',
          tips: `💡 현지인 팁: 네이버 지도로 '${name}'의 운영시간과 정기휴무일을 확인해 주세요.`,
          naverMapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(name)}`,
          transitInfo: `🚌 시내버스 노선은 네이버 지도의 최신 버스 정보를 참조해 주세요.`,
          parkingInfo: `🚗 인근 공영/민영 주차장을 이용해 주세요.`,
        }))
      }
    })

    // 2. 남은 시간별 목표 방문 장소 수 정의
    let targetCount = 3
    if (time === '1h') targetCount = 1
    else if (time === '3h') targetCount = 3
    else if (time === 'half') targetCount = 5
    else if (time === 'full') targetCount = 7
    else if (time === '2days') targetCount = 10
    else if (time === '3days') targetCount = 14

    // 3. 예산 범위(0원~50만원+) & 이동수단(도보, 대중교통, 자차) 지리적 필터링
    // DB 자체가 전주 고유 명소만 포함하므로 별도 프랜차이즈 필터 불필요
    const pureSpotsDatabase = JEONJU_PLACES_DATABASE.filter((p) => {
      if (p.isMeal || p.isDessert) return false

      if (userBudgetLimit === 0 && p.cost > 0 && !p.isMustVisit) {
        return false
      }

      if (transport === 'walk') {
        if (p.lat && p.lng) {
          const distKm = Math.sqrt(
            Math.pow((p.lat - 35.814) * 111, 2) + Math.pow((p.lng - 127.151) * 88, 2)
          )
          if (distKm > 1.3 && !p.isMustVisit) return false
        }
      } else if (transport === 'transit') {
        if (p.lat && p.lng) {
          const distKm = Math.sqrt(
            Math.pow((p.lat - 35.814) * 111, 2) + Math.pow((p.lng - 127.151) * 88, 2)
          )
          if (distKm > 4.5 && !p.isMustVisit) return false
        }
      }
      return true
    }).sort((a, b) => {
      const aCompMatch = a.suitableCompanions?.includes(companionParam) ? 1 : 0
      const bCompMatch = b.suitableCompanions?.includes(companionParam) ? 1 : 0
      if (aCompMatch !== bCompMatch) return bCompMatch - aCompMatch

      if (isIndoorPriority) {
        if (a.isIndoor && !b.isIndoor) return -1
        if (!a.isIndoor && b.isIndoor) return 1
      }

      return Math.random() - 0.5
    })

    // DB에서 조건에 부합하는 장소들 채우기
    let currentCostSum = generated.reduce((s, p) => s + p.cost, 0)

    pureSpotsDatabase.forEach((placeItem) => {
      if (generated.length >= targetCount) return
      if (addedNames.has(placeItem.name.toLowerCase())) return

      if (isIndoorPriority && placeItem.isIndoor === false && !placeItem.isMustVisit) {
        return
      }

      if (userBudgetLimit > 0 && currentCostSum + placeItem.cost > userBudgetLimit && placeItem.cost > 0) {
        return
      }

      currentCostSum += placeItem.cost
      addedNames.add(placeItem.name.toLowerCase())
      generated.push(ensureThreeDiningAndCafes({
        ...placeItem,
        id: `db-${orderCounter}`,
        order: orderCounter++,
      }))
    })

    // 목표 장소 수 미달 시 보충
    if (generated.length < targetCount) {
      const fallbackPool = JEONJU_PLACES_DATABASE.filter((p) => !p.isMeal && !p.isDessert)
      fallbackPool.forEach((placeItem) => {
        if (generated.length >= targetCount) return
        if (addedNames.has(placeItem.name.toLowerCase())) return
        addedNames.add(placeItem.name.toLowerCase())
        generated.push(ensureThreeDiningAndCafes({
          ...placeItem,
          id: `db-fill-${orderCounter}`,
          order: orderCounter++,
        }))
      })
    }

    // 4. 출발 장소(startLocationParam) 기준 최단 순선 동선 정렬 알고리즘 (Nearest-Neighbor TSP)
    const optimizedPlaces: Place[] = []
    const unvisitedPool = [...generated]

    if (unvisitedPool.length > 0) {
      const startPointAnchor: Place = {
        id: 'start-anchor',
        order: 0,
        name: startLocationParam,
        category: '출발지',
        cost: 0,
        costLabel: '0원',
        walkMinutes: 0,
        reason: '출발지',
        isMustVisit: false,
        mapX: 50,
        mapY: 50,
        lat: startLocationParam.includes('전주역')
          ? 35.8490
          : startLocationParam.includes('터미널')
            ? 35.8360
            : startLocationParam.includes('전북대')
              ? 35.8470
              : 35.8133,
        lng: startLocationParam.includes('전주역')
          ? 127.1615
          : startLocationParam.includes('터미널')
            ? 127.1320
            : startLocationParam.includes('전북대')
              ? 127.1290
              : 127.1492,
      }

      let nearestToStartIdx = 0
      let minStartDist = Infinity
      for (let i = 0; i < unvisitedPool.length; i++) {
        const dist = getPlaceDistance(startPointAnchor, unvisitedPool[i])
        if (dist < minStartDist) {
          minStartDist = dist
          nearestToStartIdx = i
        }
      }

      let currentPlace = unvisitedPool.splice(nearestToStartIdx, 1)[0]
      optimizedPlaces.push(currentPlace)

      while (unvisitedPool.length > 0) {
        let nearestIdx = 0
        let minDistance = Infinity

        for (let i = 0; i < unvisitedPool.length; i++) {
          const dist = getPlaceDistance(currentPlace, unvisitedPool[i])
          if (dist < minDistance) {
            minDistance = dist
            nearestIdx = i
          }
        }

        currentPlace = unvisitedPool.splice(nearestIdx, 1)[0]
        optimizedPlaces.push(currentPlace)
      }
    }

    // 5. 일차 및 소요시간 정렬 & 맛집3/카페3/특산품3 최종 보장
    const total = optimizedPlaces.length
    const finalPlaces = optimizedPlaces.map((place, idx) => {
      let day = 1
      if (time === '2days') {
        // 이틀: 총 10개 → 1일차 5개, 2일차 5개
        day = idx < Math.ceil(total / 2) ? 1 : 2
      } else if (time === '3days') {
        // 사흘: 총 14개 → 1일차 5개, 2일차 5개, 3일차 4개 (균등 분배)
        const perDay = Math.ceil(total / 3)
        if (idx < perDay) day = 1
        else if (idx < perDay * 2) day = 2
        else day = 3
      }

      let travelMins = 0
      if (idx > 0) {
        const prev = optimizedPlaces[idx - 1]
        const distSq = getPlaceDistance(prev, place)
        const approxKm = Math.sqrt(distSq)
        if (transport === 'walk') {
          travelMins = Math.max(3, Math.round(approxKm * 8 + 2))
        } else {
          travelMins = Math.max(4, Math.round(approxKm * 10 + 2))
        }
      }

      return ensureThreeDiningAndCafes({
        ...place,
        order: idx + 1,
        day,
        walkMinutes: travelMins,
      })
    })

    setPlaces(finalPlaces)
  }, [rawMustVisit, time, isIndoorPriority, weatherParam, companionParam, transport, userBudgetLimit, startLocationParam])

  async function loadRealtimeWeather() {
    setWeatherLoading(true)
    try {
      if (weatherParam === 'clear') {
        setWeather({
          condition: 'clear',
          emoji: '☀️',
          summary: '☀️ 맑음 · 폭염 (선택한 예보 날씨)',
          detail: '무더위를 피해 에어컨이 시원한 팔복예술공장/수제 공방/지하 어진박물관/도서관 위주로 큐레이션되었습니다 · 기온 31°C · 강수확률 0%',
        })
        setLastFetchTime('예보 선택')
      } else if (weatherParam === 'rain') {
        setWeather({
          condition: 'rain',
          emoji: '☔',
          summary: '☔ 비 옴 (선택한 예보 날씨)',
          detail: '비 오는 날 운치에 어울리는 팔복예술공장/실내 공방/아중호수 수중 데크 위주로 추천드려요 · 기온 21°C · 강수확률 90%',
        })
        setLastFetchTime('예보 선택')
      } else if (weatherParam === 'cloudy') {
        setWeather({
          condition: 'cloudy',
          emoji: '☁️',
          summary: '☁️ 구름 많음 (선택한 예보 날씨)',
          detail: '선선해서 전주 수목원, 한벽굴 드라마 촬영지, 자만벽화마을, 아중호수 야경 산책을 즐기기 딱 좋은 날씨입니다.',
        })
        setLastFetchTime('예보 선택')
      } else if (weatherParam === 'snow') {
        setWeather({
          condition: 'snow',
          emoji: '❄️',
          summary: '❄️ 눈 옴 (선택한 예보 날씨)',
          detail: '하얀 눈이 내린 한벽굴, 전주향교, 팔복예술공장 온실 코스를 추천해 드려요 · 기온 -2°C · 강수확률 80%',
        })
        setLastFetchTime('예보 선택')
      } else if (weatherParam === 'wind') {
        setWeather({
          condition: 'wind',
          emoji: '🥶',
          summary: '🥶 한파 · 찬 바람 (선택한 예보 날씨)',
          detail: '매서운 바람을 피할 따뜻한 실내 팔복예술공장, 공방 체험과 도서관 코스를 추천해 드려요 · 기온 -5°C · 강수확률 10%',
        })
        setLastFetchTime('예보 선택')
      } else {
        // 'auto' - 실시간 기상청 API
        const res = await fetch('/api/weather')
        if (res.ok) {
          const data = await res.json()
          setWeather({
            condition: data.condition,
            emoji: data.emoji,
            summary: `🛰️ 실시간: ${data.summary}`,
            detail: data.detail,
          })
          if (data.lastUpdated) {
            setLastFetchTime(data.lastUpdated)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load weather:', err)
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    loadRealtimeWeather()
    const timer = setInterval(loadRealtimeWeather, 3600000)
    return () => clearInterval(timer)
  }, [weatherParam])

  // 클릭 시 장소 교체 처리 함수
  function handleReplace(id: string) {
    setPlaces((prev) => {
      const targetPlace = prev.find((p) => p.id === id)
      if (!targetPlace) return prev

      const currentNames = new Set(prev.map((p) => p.name.toLowerCase()))

      const pureSpotCandidates = JEONJU_PLACES_DATABASE.filter((p) => {
        if (p.isMeal || p.isDessert || currentNames.has(p.name.toLowerCase())) return false
        if (userBudgetLimit === 0 && p.cost > 0) return false
        if (transport === 'walk') {
          if (p.lat && p.lng) {
            const distKm = Math.sqrt(
              Math.pow((p.lat - 35.814) * 111, 2) + Math.pow((p.lng - 127.151) * 88, 2)
            )
            if (distKm > 1.3) return false
          }
        }
        return true
      })

      if (pureSpotCandidates.length === 0) return prev

      const nextSpot = pureSpotCandidates[Math.floor(Math.random() * pureSpotCandidates.length)]
      const replacedList = prev.map((p) =>
        p.id === id
          ? ensureThreeDiningAndCafes({
              ...nextSpot,
              id: `${p.id}-replaced-${Date.now()}`,
              order: p.order,
              day: p.day,
              reason: `선택하신 출발지 및 예산 범위 내 새로운 장소로 교체되었습니다.`,
            })
          : p,
      )

      // 교체 후에도 최단 순선 알고리즘 재적용!
      const unvisitedPool = [...replacedList]
      const reOptimized: Place[] = []
      let current = unvisitedPool.shift()!
      reOptimized.push(current)

      while (unvisitedPool.length > 0) {
        let nearestIdx = 0
        let minDistance = Infinity

        for (let i = 0; i < unvisitedPool.length; i++) {
          const dist = getPlaceDistance(current, unvisitedPool[i])
          if (dist < minDistance) {
            minDistance = dist
            nearestIdx = i
          }
        }

        current = unvisitedPool.splice(nearestIdx, 1)[0]
        reOptimized.push(current)
      }

      return reOptimized.map((place, idx) => {
        let travelMins = 0
        if (idx > 0) {
          const prev = reOptimized[idx - 1]
          const distSq = getPlaceDistance(prev, place)
          const approxKm = Math.sqrt(distSq)
          travelMins = Math.max(3, Math.round(approxKm * 8 + 2))
        }
        return ensureThreeDiningAndCafes({
          ...place,
          order: idx + 1,
          walkMinutes: travelMins,
        })
      })
    })
  }

  const totalCost = useMemo(
    () => places.reduce((sum, p) => sum + p.cost, 0),
    [places],
  )

  // 이동수단별 총 이동 소요시간 계산
  const totalTravelMinutes = useMemo(() => {
    return places.reduce((sum, p) => {
      const m = p.walkMinutes || 0
      if (m === 0) return sum
      if (transport === 'car') return sum + Math.max(2, Math.round(m * 0.5))
      if (transport === 'transit') return sum + Math.max(5, Math.round(m * 1.1 + 3))
      return sum + m
    }, 0)
  }, [places, transport])

  // 일차별로 그룹화 (이틀/사흘 코스 시)
  const groupedByDay = useMemo(() => {
    if (time !== '2days' && time !== '3days') return null
    const days: Record<number, Place[]> = {}
    places.forEach((p) => {
      const d = p.day ?? 1
      if (!days[d]) days[d] = []
      days[d].push(p)
    })
    return days
  }, [places, time])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28">
      {/* 실시간 / 선택된 예보 날씨 요약 배지 */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {weather.emoji}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {weather.summary}
              </p>
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent">
                {weatherParam === 'auto' ? '실시간 1시간 주기' : '예보 조건 맞춤'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{weather.detail}</p>
          </div>
        </div>

        {weatherParam === 'auto' ? (
          <button
            type="button"
            onClick={loadRealtimeWeather}
            disabled={weatherLoading}
            title="기상청/실시간 날씨 새로고침"
            className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3.5 ${weatherLoading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">
              {lastFetchTime ? `${lastFetchTime} 갱신` : '새로고침'}
            </span>
          </button>
        ) : null}
      </div>

      {/* 출발지 선택 및 한옥마을 기본 기준 노티피케이션 */}
      {startLocationParam.includes('한옥마을') ? (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
          <MapPin className="size-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-bold">📍 출발 기준지 안내:</span>{' '}
            <span>
              실시간 위치 수신 불가 환경(또는 미승인)으로 인해, 전주 대표 중심지인 <strong>'전주 한옥마을(전동성당)'을 기본 출발지 기준</strong>으로 설정하여 주변 및 최단 지리적 순선 코스를 안내해 드립니다.
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs text-primary font-semibold">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span>🚩 설정된 출발지: <strong className="text-foreground">{startLocationParam}</strong> {startAddressParam ? `(${startAddressParam})` : ''} (이 출발지를 기준으로 최단 지리적 순선 코스가 연동되었습니다)</span>
        </div>
      )}

      {/* 출발지 ➔ 1번 추천 장소 이동 방법 & 시내버스 노선 추천 전용 배지 */}
      {firstPlaceTransitInfo && places.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2.5 rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4 text-xs text-foreground shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-500/30 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-300">
              <Bus className="size-4.5 text-blue-400 shrink-0" />
              <span>🚩 출발지에서 1번 '{places[0].name}'까지 이동 방법 & 추천 시내버스</span>
            </div>
            <a
              href={firstPlaceTransitInfo.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-xl bg-blue-500/25 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-500/40 transition-colors border border-blue-500/50 shadow-xs"
            >
              <span>네이버 지도 실시간 길찾기</span>
              <ArrowRight className="size-3.5 text-blue-300" />
            </a>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
            <div className="flex flex-col gap-1 rounded-xl bg-card/60 p-2.5 border border-border/50">
              <span className="font-bold text-blue-300 text-xs">{firstPlaceTransitInfo.busRoute}</span>
              <span className="text-muted-foreground text-[11px]">🚏 탑승: {firstPlaceTransitInfo.boardStop}</span>
              <span className="text-muted-foreground text-[11px]">🚏 하차: {firstPlaceTransitInfo.alightStop}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-card/60 p-2.5 border border-border/50">
              <span className="font-bold text-emerald-400 text-xs">⏱️ 대중교통 소요시간: {firstPlaceTransitInfo.duration}</span>
              <span className="text-muted-foreground text-[11px]">🚗 자차 이동 소요시간: {firstPlaceTransitInfo.carDuration}</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* ➕ [신규] 코스 중간 장소 검색 & 최단 순선 실시간 재최적화 추가 바 */}
      <div className="mt-4 flex flex-col gap-2.5 rounded-2xl border border-accent/40 bg-accent/10 p-4 shadow-sm relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Plus className="size-4.5 text-accent" />
            <span>➕ 동선 중간에 새로 가고 싶은 장소 검색해서 추가하기 (자동 최단 순선 재정렬)</span>
          </div>
          <span className="text-[11px] text-accent font-semibold">네이버 지도 연동 스팟 검색</span>
        </div>

        {/* 토스트 노티피케이션 메세지 */}
        {addedToastMessage ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-2.5 text-xs font-semibold text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span>{addedToastMessage}</span>
          </div>
        ) : null}

        <div className="relative">
          <div className="flex items-center rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30 shadow-inner">
            <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              value={addSearchInput}
              onFocus={() => setShowAddSuggestions(true)}
              onChange={(e) => {
                setAddSearchInput(e.target.value)
                setShowAddSuggestions(true)
              }}
              placeholder="추가하고 싶은 장소를 검색해 보세요! (예: 보드게임카페, 레드버튼, 방탈출, 인생네컷, 노래방, 올리브영, 만화카페)"
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* 검색 자동완성 드롭다운 */}
          {showAddSuggestions && addPlaceSuggestions.length > 0 ? (
            <div className="absolute inset-x-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-xl backdrop-blur">
              <div className="px-3 py-1.5 text-[11px] font-bold text-accent border-b border-border/50 flex items-center justify-between">
                <span>🔍 네이버 지도 검색 결과 (위치를 먼저 확인 후 코스에 추가하실 수 있습니다)</span>
                <span className="text-[10px] text-muted-foreground">네이버 지도 연동</span>
              </div>
              {addPlaceSuggestions.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col gap-1.5 px-3 py-2.5 hover:bg-accent/10 rounded-xl transition-colors border-b border-border/30 last:border-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                      <span>{item.name}</span>
                      <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={item.naverMapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(item.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/40 bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-500/20 transition-colors shadow-2xs"
                      >
                        <MapPin className="size-3 text-blue-400" />
                        <span>🗺️ 네이버 지도 위치 확인</span>
                      </a>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAddPlaceToItinerary(item)}
                        className="h-7 text-[11px] rounded-lg shrink-0 gap-1"
                      >
                        <Plus className="size-3" /> 코스 추가
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                    <span>📍 실제 주소: <strong className="text-foreground">{item.address || '전북 전주시'}</strong></span>
                    <span className="text-emerald-400 font-medium">{item.costLabel || '비용 정보'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* 예산 및 동행 유형 맞춤 안내 배지 */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{companionLabel.text}</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
          <Wallet className="size-3.5 text-amber-400" />
          <span>예산: {budgetDisplayLabel}</span>
        </div>
      </div>

      {/* 날씨 맞춤 큐레이션 안내 배지 */}
      <div
        className={`mt-3 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${weatherCareMessage.bannerColor}`}
      >
        <span className="text-base leading-none">{weatherCareMessage.icon}</span>
        <div>
          <span className="font-bold">{weatherCareMessage.title}</span>{' '}
          <span className="leading-relaxed">{weatherCareMessage.text}</span>
        </div>
      </div>

      {/* 시간 및 이동수단 안내 띠 */}
      <div className="mt-3 flex flex-col gap-2 rounded-xl bg-card border border-border p-3 text-xs text-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-accent">
            <Clock className="size-3.5" />
            {timeLabel}
          </span>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Utensils className="size-3" />
              각 장소별 주변 맛집 3선 · 카페 3선 · 특산품 3선 풀 탑재
            </span>
            <span>총 {places.length}개 스팟</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border/50 pt-2 text-muted-foreground">
          <TransportIcon className="size-3.5 text-accent shrink-0" />
          <span className="font-medium text-foreground">{transportLabel.text}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_minmax(0,42%)]">
        {/* 왼쪽: 추천 카드 리스트 */}
        <section aria-label="추천 장소 목록" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-bold text-foreground">
              🚩 {startLocationParam} 출발 맞춤 추천 코스
            </h2>
            <span className="text-xs text-muted-foreground">
              카드를 누르거나 '다른 장소 변경' 클릭 시 교체돼요
            </span>
          </div>

          {groupedByDay ? (
            // 이틀/사흘 선택 시 Day 1, Day 2, Day 3 일차별 그룹화 표시
            Object.entries(groupedByDay).map(([dayNum, dayPlaces]) => (
              <div key={dayNum} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-border pb-1.5 pt-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                    <Calendar className="size-3.5" />
                    {dayNum}일차 일정
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({dayPlaces.length}개 스팟 코스)
                  </span>
                </div>
                {dayPlaces.map((place) => {
                  const globalIdx = places.findIndex((p) => p.id === place.id)
                  return (
                    <PlaceCard
                      key={place.id}
                      place={{ ...place, order: globalIdx >= 0 ? globalIdx + 1 : place.order }}
                      transport={transport}
                      highlighted={activeId === place.id}
                      canReplace={true}
                      onHover={setActiveId}
                      onReplace={handleReplace}
                    />
                  )
                })}
              </div>
            ))
          ) : (
            // 일반 리스트 (1시간, 3시간, 반나절, 하루)
            places.map((place, idx) => (
              <PlaceCard
                key={place.id}
                place={{ ...place, order: idx + 1 }}
                transport={transport}
                highlighted={activeId === place.id}
                canReplace={true}
                onHover={setActiveId}
                onReplace={handleReplace}
              />
            ))
          )}
        </section>

        {/* 오른쪽: 지도 (데스크톱에서 상단 고정) */}
        <section
          aria-label="추천 경로 지도"
          className="lg:sticky lg:top-18 lg:h-[calc(100svh-8rem)]"
        >
          <MapPlaceholder
            places={places}
            activeId={activeId}
            onHover={setActiveId}
          />
        </section>
      </div>

      {/* 하단: 예산 사용 분석 원형 그래프 (Budget Utilization & SVG Pie Chart) */}
      <BudgetPieChart
        userBudgetLimit={userBudgetLimit}
        totalPlaceCost={totalCost}
        transport={transport}
        time={time}
      />

      {/* 하단 고정바 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Wallet className="size-4 text-accent" />
              <span className="font-semibold text-foreground">
                한도: {budgetDisplayLabel}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-accent" />
              <span className="font-semibold text-foreground">
                총 {totalTravelMinutes}분 이동
              </span>
            </span>
          </div>
          <Button
            onClick={() => setShared((s) => !s)}
            variant={shared ? 'secondary' : 'default'}
            className="rounded-xl"
          >
            <Share2 />
            {shared ? '저장됨!' : '경로 저장/공유'}
          </Button>
        </div>
      </div>
    </div>
  )
}
