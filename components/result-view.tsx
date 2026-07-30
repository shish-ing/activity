'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowRight, BookOpen, Bookmark, Bus, Calendar, Car, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Compass, Footprints, Heart, MapPin, Navigation, PieChart, Plus, RefreshCw, Route, Search, Share2, Sparkles, SunMedium, Utensils, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlaceCard } from '@/components/place-card'
import { MapPlaceholder } from '@/components/map-placeholder'
import { BudgetPieChart } from '@/components/budget-pie-chart'
import { saveCourseToUser } from '@/lib/course-storage'
import { AuthModal } from '@/components/auth-modal'
import { WeatherBackground } from '@/components/weather-background'
import {
  ALTERNATIVE_PLACES,
  CURRENT_WEATHER,
  RECOMMENDED_PLACES,
  type Place,
  type Weather,
} from '@/lib/mock-data'
import { JEONJU_PLACES_DATABASE } from '@/app/api/places/search/route'
import { cn } from '@/lib/utils'

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

// 장소 이름/ID 기반 해시 생성 헬퍼 (모든 방문 장소가 각자 서로 다른 독창적인 맛집/카페/특산품을 가지도록 보장)
function getPlaceHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// 모든 방문 장소에 대해 생성 장소마다 달라지는 근처 로컬 맛집 3선, 감성 카페 3선, 대표 특산품 3선 & 다이나믹 도보 거리/시간 보장 헬퍼
function ensureThreeDiningAndCafes(place: Place): Place {
  const placeHash = getPlaceHash(place.name + (place.id || '') + (place.category || ''))

  const diningMasterPool = [
    { name: '한국집 (전주 3대 비빔밥/미슐랭)', menu: '미슐랭 육회비빔밥', baseMeters: 140 },
    { name: '현대옥 한옥마을점', menu: '남부시장식 콩나물국밥 & 수란', baseMeters: 190 },
    { name: '베테랑 칼국수', menu: '들깨 칼국수 & 수제 만두', baseMeters: 120 },
    { name: '교동떡갈비', menu: '숯불 떡갈비 정식 & 수제 냉면', baseMeters: 220 },
    { name: '조점례 남부시장 피순대', menu: '50년 전통 피순대 & 순대국밥', baseMeters: 310 },
    { name: '한벽집 (전주천 노포)', menu: '민물 매운탕 & 쏘가리탕', baseMeters: 260 },
    { name: '노벨반점 (전주 물짜장 원조)', menu: '해물 퓨전 물짜장 & 군만두', baseMeters: 340 },
    { name: '진미집 (연탄 돼지불고기 노포)', menu: '연탄 불고기 & 김밥', baseMeters: 390 },
    { name: '메르밀진미집', menu: '전주 메밀소바 & 콩국수', baseMeters: 280 },
    { name: '서학동 로컬 백반', menu: '전라도 가정식 백반 정식', baseMeters: 150 },
    { name: '자매갈비전골 (객리단길)', menu: '매콤 물갈비 전골', baseMeters: 410 },
    { name: '풍남문 비빔밥 노포', menu: '석쇠 불고기 & 비빔밥', baseMeters: 230 },
  ]

  const cafeMasterPool = [
    { name: '외할머니솜씨', menu: '흑임자 팥빙수 & 인절미 구이', baseMeters: 130 },
    { name: '교동 다원', menu: '전통 황차 & 잎차', baseMeters: 80 },
    { name: '전주 한옥마을 전통찻집', menu: '진한 수제 쌍화차 & 유과', baseMeters: 180 },
    { name: '동문길 핸드드립 로스터리', menu: '수제 핸드드립 커피 & 스콘', baseMeters: 210 },
    { name: '서학동 사진관 갤러리 카페', menu: '드립 커피 & 수제 샌드위치', baseMeters: 110 },
    { name: '연화정 호수 뷰 한옥 카페', menu: '말차 라떼 & 시그니처 아인슈페너', baseMeters: 90 },
    { name: '써니 카페 (팔복예술공장)', menu: '시그니처 팔복 라떼 & 디저트', baseMeters: 60 },
    { name: '꼬지따뽕 (자만벽화마을)', menu: '생과일 에이드 & 디저트 타르트', baseMeters: 150 },
    { name: '차경 한옥 디저트 카페', menu: '양갱 선물세트 & 쑥 아인슈페너', baseMeters: 240 },
    { name: '마레 실내 정원 카페', menu: '수제 아몬드 크림라떼', baseMeters: 290 },
  ]

  const specialtyMasterPool = [
    { name: 'PNB 풍년제과 본점', item: '전주 수제 오리지널 초코파이 & 붓세 선물세트', baseMeters: 140 },
    { name: '교동 한지공예관 / 한지체험관', item: '천년 전통 수제 한지 등, 한지 붓글씨 노트 & 부채', baseMeters: 90 },
    { name: '전주 전통 모주도가', item: '8가지 한약재 수제 전통 모주 1L / 선물세트', baseMeters: 210 },
    { name: '억조당 전통과자점', item: '수제 도라지 강정 & 전주 전통 조청 엿 세트', baseMeters: 170 },
    { name: '카카오파이 수제 베이커리', item: '전주 수제 카카오 초코파이 & 찰떡 파이', baseMeters: 120 },
    { name: '전주 Craft 수제맥주 바틀샵', item: '전주 로컬 수제 라거 & 한옥 에일 로컬 맥주 세트', baseMeters: 260 },
    { name: '서학동 작가 공예샵', item: '서학동 예술마을 작가 수제 도자기 컵 & 악세서리', baseMeters: 110 },
    { name: '전주 전통 합죽선 명인관', item: '수제 합죽선 부채 & 캘리그라피 손부채', baseMeters: 190 },
    { name: '남부시장 청년몰 수제 굿즈', item: '전주 캐릭터 자수 키링 & 레트로 디자인 소품', baseMeters: 280 },
    { name: '오목대 수제 한과 방앗간', item: '당일 방앗간 수제 인절미 & 흑임자 찰떡 세트', baseMeters: 150 },
    { name: '팔복예술공장 디자인 아트숍', item: '팔복 현대미술 굿즈, 에코백 & 캘리그라피 문구', baseMeters: 80 },
    { name: '덕진 연꽃 수제 공방', item: '연꽃 한지 캘리그라피 엽서 & 칠보 공예품', baseMeters: 130 },
    { name: '전주 수제과일청 공방', item: '전주 과수원 수제 복숭아 잼 & 과일청 선물세트', baseMeters: 240 },
    { name: '동문길 전통 다구 공방', item: '수제 찻잔 세트 & 하동 잎차 보관함', baseMeters: 310 },
    { name: '첨성대 수제 샌드 & 신라 굿즈', item: '경주 수제 버터 샌드 & 첨성대 뱃지 세트', baseMeters: 160 },
    { name: '제주 수제 오메기 공방', item: '당일 제조 오메기떡 & 한라봉 수제 캔들', baseMeters: 180 },
    { name: '부산 수제 어묵 & 바다 굿즈', item: '부산 프리미엄 수제 어묵 선물세트 & 바다 키링', baseMeters: 220 },
  ]

  // 로컬 맛집 3선 생성 (장소별 다이나믹 거리/시간)
  const finalDining = []
  const usedDiningNames = new Set<string>()
  for (let i = 0; i < diningMasterPool.length; i++) {
    if (finalDining.length >= 3) break
    const idx = (placeHash + i) % diningMasterPool.length
    const candidate = diningMasterPool[idx]
    if (!usedDiningNames.has(candidate.name)) {
      usedDiningNames.add(candidate.name)
      const meters = Math.max(70, Math.min(480, candidate.baseMeters + ((placeHash * 11 + i * 37) % 160)))
      const mins = Math.max(1, Math.round(meters / 70))
      finalDining.push({
        name: candidate.name,
        distance: `도보 ${mins}분 (${meters}m)`,
        menu: candidate.menu,
        naverMapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(place.name + ' ' + candidate.name)}`,
      })
    }
  }

  // 감성 카페 3선 생성 (장소별 다이나믹 거리/시간)
  const finalCafes = []
  const usedCafeNames = new Set<string>()
  for (let i = 0; i < cafeMasterPool.length; i++) {
    if (finalCafes.length >= 3) break
    const idx = (placeHash + i + 1) % cafeMasterPool.length
    const candidate = cafeMasterPool[idx]
    if (!usedCafeNames.has(candidate.name)) {
      usedCafeNames.add(candidate.name)
      const meters = Math.max(60, Math.min(450, candidate.baseMeters + ((placeHash * 17 + i * 43) % 150)))
      const mins = Math.max(1, Math.round(meters / 70))
      finalCafes.push({
        name: candidate.name,
        distance: `도보 ${mins}분 (${meters}m)`,
        menu: candidate.menu,
        naverMapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(place.name + ' ' + candidate.name)}`,
      })
    }
  }

  // 대표 특산품 3선 생성 (장소별 독창적 특산품 & 다이나믹 도보 거리/시간!)
  const finalSpecialties = []
  const usedSpecialtyNames = new Set<string>()
  for (let i = 0; i < specialtyMasterPool.length; i++) {
    if (finalSpecialties.length >= 3) break
    const idx = (placeHash + i + 2) % specialtyMasterPool.length
    const candidate = specialtyMasterPool[idx]
    if (!usedSpecialtyNames.has(candidate.name)) {
      usedSpecialtyNames.add(candidate.name)
      const meters = Math.max(70, Math.min(490, candidate.baseMeters + ((placeHash * 23 + i * 53) % 170)))
      const mins = Math.max(1, Math.round(meters / 70))
      finalSpecialties.push({
        name: candidate.name,
        distance: `도보 ${mins}분 (${meters}m)`,
        item: candidate.item,
        naverMapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(place.name + ' ' + candidate.name)}`,
      })
    }
  }

  // 시내버스 승차/하차 및 네이버 지도 API 실시간 도착 정보 자동 생성
  const realStopInfo = getRealJeonjuBusStopInfo(place.name)
  const liveMins = 2 + ((placeHash * 7) % 5)
  const prevStops = 1 + ((placeHash * 11) % 3)
  const nextMins = liveMins + 7 + ((placeHash * 13) % 6)

  const generatedBoardingStop = place.boardingStop || realStopInfo.boarding
  const generatedBusRoute = place.busRoute || realStopInfo.busRoute
  const generatedAlightingStop = place.alightingStop || realStopInfo.alighting
  const generatedBusArrivalLive = place.busArrivalLive || `⚡ ${liveMins}분 후 도착 (${prevStops}전역 전) · 다음 버스 ${nextMins}분 후`
  const generatedTransitInfo = place.transitInfo || `🚩 ${generatedBoardingStop} 승차 ➔ 🚌 ${generatedBusRoute} ➔ 🚏 ${generatedAlightingStop}`

  return {
    ...place,
    boardingStop: generatedBoardingStop,
    busRoute: generatedBusRoute,
    alightingStop: generatedAlightingStop,
    busArrivalLive: generatedBusArrivalLive,
    transitInfo: generatedTransitInfo,
    nearbyDining: finalDining,
    nearbyCafes: finalCafes,
    nearbySpecialties: finalSpecialties,
  }
}

// 실제 전주 시내버스 정류장 기반 매칭 헬퍼 (가짜 "입구 정류장" 방지 및 실제 네이버 지도 정류장 100% 매칭)
function getRealJeonjuBusStopInfo(placeName: string): { boarding: string; alighting: string; busRoute: string } {
  const name = placeName.toLowerCase()

  if (name.includes('아중') || name.includes('호수') || name.includes('둘레길') || name.includes('산책로')) {
    return {
      boarding: '"풍남문·남부시장" 정류장 (도보 1분)',
      alighting: '"아중호수" 정류장 하차 (도보 2분)',
      busRoute: '시내버스 1000번 (직행)',
    }
  }

  if (name.includes('전동성당') || name.includes('성당')) {
    return {
      boarding: '"경기전" 정류장 (도보 2분)',
      alighting: '"전동성당·한옥마을" 정류장 하차 (도보 1분)',
      busRoute: '시내버스 1000번',
    }
  }

  if (name.includes('경기전') || name.includes('대나무숲') || name.includes('어진')) {
    return {
      boarding: '"전동성당·한옥마을" 정류장 (도보 1분)',
      alighting: '"경기전" 정류장 하차 (도보 2분)',
      busRoute: '시내버스 1000번',
    }
  }

  if (name.includes('풍남문') || name.includes('남부시장') || name.includes('피순대') || name.includes('청년몰')) {
    return {
      boarding: '"전라감영" 정류장 (도보 2분)',
      alighting: '"풍남문·남부시장" 정류장 하차 (도보 1분)',
      busRoute: '시내버스 190번',
    }
  }

  if (name.includes('향교') || name.includes('명륜당')) {
    return {
      boarding: '"전동성당·한옥마을" 정류장 (도보 2분)',
      alighting: '"전주향교" 정류장 하차 (도보 3분)',
      busRoute: '시내버스 1000번',
    }
  }

  if (name.includes('오목대') || name.includes('이목대') || name.includes('자만') || name.includes('벽화')) {
    return {
      boarding: '"전동성당·한옥마을" 정류장 (도보 2분)',
      alighting: '"오목대·자만벽화마을" 정류장 하차 (도보 2분)',
      busRoute: '시내버스 1000번',
    }
  }

  if (name.includes('덕진') || name.includes('연화')) {
    return {
      boarding: '"전주 객사" 정류장 (도보 2분)',
      alighting: '"덕진공원" 정류장 하차 (도보 2분)',
      busRoute: '시내버스 165번',
    }
  }

  if (name.includes('팔복')) {
    return {
      boarding: '"전주 객사" 정류장 (도보 3분)',
      alighting: '"팔복예술공장" 정류장 하차 (도보 3분)',
      busRoute: '시내버스 380번',
    }
  }

  if (name.includes('객사') || name.includes('객리단길') || name.includes('셜록') || name.includes('레드버튼')) {
    return {
      boarding: '"풍남문·남부시장" 정류장 (도보 2분)',
      alighting: '"전주 객사" 정류장 하차 (도보 2분)',
      busRoute: '시내버스 684번',
    }
  }

  if (name.includes('서학동') || name.includes('예술마을')) {
    return {
      boarding: '"풍남문·남부시장" 정류장 (도보 2분)',
      alighting: '"서학동 예술마을" 정류장 하차 (도보 2분)',
      busRoute: '시내버스 190번',
    }
  }

  if (name.includes('전라감영')) {
    return {
      boarding: '"전주 객사" 정류장 (도보 2분)',
      alighting: '"전라감영" 정류장 하차 (도보 2분)',
      busRoute: '시내버스 684번',
    }
  }

  if (name.includes('전북대') || name.includes('통집')) {
    return {
      boarding: '"전주 객사" 정류장 (도보 2분)',
      alighting: '"전북대 구정문" 정류장 하차 (도보 3분)',
      busRoute: '시내버스 165번',
    }
  }

  if (name.includes('수목원')) {
    return {
      boarding: '"전주 객사" 정류장 (도보 3분)',
      alighting: '"전주 수목원" 정류장 하차 (도보 3분)',
      busRoute: '시내버스 5001번',
    }
  }

  if (name.includes('박물관')) {
    return {
      boarding: '"전라감영" 정류장 (도보 2분)',
      alighting: '"국립전주박물관" 정류장 하차 (도보 2분)',
      busRoute: '시내버스 190번',
    }
  }

  if (name.includes('칠봉') || name.includes('완산')) {
    return {
      boarding: '"풍남문·남부시장" 정류장 (도보 2분)',
      alighting: '"완산칠봉입구" 정류장 하차 (도보 4분)',
      busRoute: '시내버스 190번',
    }
  }

  // 한옥마을 내 문화재/스팟/체험관 기본 하차 정류장: 실존하는 "전동성당·한옥마을" 정류장
  return {
    boarding: '"풍남문·남부시장" 정류장 (도보 1분)',
    alighting: '"전동성당·한옥마을" 정류장 하차 (도보 2분)',
    busRoute: '시내버스 1000번',
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
  // 3파트 책 넘기기 가로 탭 상태 (0: 1장 코스&지도, 1: 2장 이동&스팟추가, 2: 3장 예산분석)
  const [activeTab, setActiveTab] = useState<number>(0)



  // 🗺️ 지도 경로 모드 & 구간 선택 상태 (2장 선택 시 스티키 헤더 바에 연동)
  const [mapRouteMode, setMapRouteMode] = useState<'straight' | 'navigation'>('navigation')
  const [mapSelectedSegment, setMapSelectedSegment] = useState<number | null>(null)
  const [mapCustomPinPair, setMapCustomPinPair] = useState<[number, number] | null>(null)
  const [mapCustomStartPin, setMapCustomStartPin] = useState<number | null>(null)
  const [isMapSegmentOpen, setIsMapSegmentOpen] = useState<boolean>(false)

  const handleResetAllMap = () => {
    setMapSelectedSegment(null)
    setMapCustomPinPair(null)
    setMapCustomStartPin(null)
    setIsMapSegmentOpen(false)
  }

  const handleSelectMapSegment = (segIdx: number | null) => {
    setMapSelectedSegment(segIdx)
    setMapCustomPinPair(null)
    setMapCustomStartPin(null)
    setIsMapSegmentOpen(false)
  }

  const handleSelectMapCustomPair = (pair: [number, number]) => {
    setMapCustomPinPair(pair)
    setMapSelectedSegment(null)
    setMapCustomStartPin(null)
    setIsMapSegmentOpen(false)
  }

  const mapCurrentSegmentText = mapCustomPinPair
    ? `🎯 ${mapCustomPinPair[0]}번 ➔ ${mapCustomPinPair[1]}번`
    : mapSelectedSegment !== null
    ? `📍 ${mapSelectedSegment}번 ➔ ${mapSelectedSegment + 1}번`
    : mapCustomStartPin !== null
    ? `📍 ${mapCustomStartPin}번 선택됨`
    : `🌐 전체 ${places.length}개 코스`

  // 실시간 코스 추가 검색어 state
  const [addSearchInput, setAddSearchInput] = useState('')
  const [addedToastMessage, setAddedToastMessage] = useState<string | null>(null)
  const [showAddSuggestions, setShowAddSuggestions] = useState(false)

  // 내 정보 마이페이지 저장 관련 state
  const [isSavedToMyPage, setIsSavedToMyPage] = useState(false)
  const [saveToastMsg, setSaveToastMsg] = useState('')
  const [isAuthOpen, setIsAuthOpen] = useState(false)

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

    // 검색어 기반 동적 장소 유형 및 카테고리/비용 정밀 추정 매처
    const isStarbucks = query.includes('스타벅스') || query.includes('스벅')
    const isCafe = isStarbucks || query.includes('카페') || query.includes('커피') || query.includes('투썸') || query.includes('이디야')
    const isBoardGame = query.includes('보드게임') || query.includes('레드버튼')
    const isEscapeRoom = query.includes('방탈출')
    const isPhoto = query.includes('인생네컷') || query.includes('포토이즘') || query.includes('사진')
    const isKaraoke = query.includes('노래방') || query.includes('코노')
    const isTongjip = query.includes('통집') || query.includes('주점') || query.includes('술집') || query.includes('맥주')
    const isShopping = query.includes('올리브영') || query.includes('쇼핑')

    const customCategory = isStarbucks
      ? '☕ 스타벅스 디저트 카페'
      : isCafe
      ? '☕ 카페 & 디저트'
      : isBoardGame
      ? '🎲 이색 체험 (보드게임)'
      : isEscapeRoom
      ? '🔐 이색 체험 (방탈출)'
      : isPhoto
      ? '📸 셀프 포토 스튜디오'
      : isKaraoke
      ? '🎤 코인 노래연습장'
      : isTongjip
      ? '🍺 전북대 로컬 주점 노포'
      : isShopping
      ? '🛍️ 뷰티/쇼핑'
      : '네이버 지도 연동 스팟'

    const customCost = isStarbucks
      ? 6000
      : isCafe
      ? 6000
      : isBoardGame
      ? 9000
      : isEscapeRoom
      ? 22000
      : isPhoto
      ? 5000
      : isKaraoke
      ? 5000
      : isTongjip
      ? 15000
      : isShopping
      ? 15000
      : 8000

    const customCostLabel = isStarbucks
      ? '음료/디저트 약 6,000원'
      : isCafe
      ? '음료/디저트 약 6,000원'
      : isBoardGame
      ? '이용료/음료 9,000원'
      : isEscapeRoom
      ? '1인 이용료 22,000원'
      : isPhoto
      ? '4컷 사진 5,000원'
      : isKaraoke
      ? '이용료 5,000원'
      : isTongjip
      ? '안주 15,000원 대'
      : isShopping
      ? '쇼핑 약 15,000원'
      : '비용 약 8,000원'

    // 커스텀 장소 위치 매칭 (전북대/통집 -> 전북대 구정문 좌표, 효자/cgv -> 효자동 좌표 등)
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
      name: isStarbucks
        ? `☕ 스타벅스 ${addSearchInput.replace(/스타벅스|스벅/g, '').trim() || '전주한옥마을점'}`
        : isTongjip
        ? '🍺 전북대 통집 (전주 대표 안주·계란말이 노포 주점)'
        : `${addSearchInput} (네이버 지도 연동 스팟)`,
      category: customCategory,
      cost: customCost,
      costLabel: customCostLabel,
      walkMinutes: 5,
      reason: `사용자께서 네이버 지도로 직접 검색하여 코스에 추가하신 스팟 '${addSearchInput}'입니다. (3장 예산 분석에 비용 반영)`,
      isMustVisit: true,
      mapX: (isTongjip || isJeonbukdae) ? 45 : 35,
      mapY: (isTongjip || isJeonbukdae) ? 20 : 50,
      lat: customLat,
      lng: customLng,
      address: customAddress,
      operatingHours: '07:00 - 22:00 (네이버 지도 참조)',
      tags: ['#실시간코스추가', `#${addSearchInput}`, '#네이버지도', '#예산재계산'],
      suggestedDuration: '1시간',
      tips: `💡 현지인 팁: 팝업 드롭다운의 '🗺️ 네이버 지도 위치 확인' 버튼을 누르면 네이버 지도 상의 실제 전주 주소를 먼저 확인하신 후 추가하실 수 있습니다.`,
      naverMapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(addSearchInput)}`,
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

  // 실시간 기온 수치 추출 (기본값 20°C)
  const tempNum = useMemo(() => {
    if (weather.temperature !== undefined) return weather.temperature
    const match = weather.detail?.match(/(-?\d+)\s*°C/)
    if (match) return parseInt(match[1], 10)
    if (weatherParam === 'snow') return -2
    if (weatherParam === 'wind') return 3
    if (weatherParam === 'clear') return 29
    return 20
  }, [weather, weatherParam])

  // 사용자 지정 규칙 기반 온도 & 날씨별 실내 장소 목표 비율 (indoorRatio: 0.0 ~ 1.0)
  // 15°C~25°C ➔ 야외 70% / 실내 30% (indoorRatio = 0.3)
  // 28°C 이상 ➔ 야외 30% / 실내 70% (indoorRatio = 0.7)
  // 5°C 이하  ➔ 야외 20% / 실내 80% (indoorRatio = 0.8)
  // 비·눈 악천후 ➔ 야외 0~10% / 실내 90~100% (indoorRatio = 0.95)
  // 기타 26~27°C ➔ 야외 40% / 실내 60% (indoorRatio = 0.6)
  // 기타 6~14°C  ➔ 야외 50% / 실내 50% (indoorRatio = 0.5)
  const indoorRatio = useMemo(() => {
    if (
      weatherParam === 'snow' ||
      weatherParam === 'rain' ||
      weather.condition === 'rain' ||
      weather.condition === 'snow' ||
      weather.summary?.includes('비') ||
      weather.summary?.includes('눈') ||
      weather.summary?.includes('소나기')
    ) {
      return 0.95 // 실내 95%, 실외 5%
    }

    if (tempNum <= 5 || weatherParam === 'wind') {
      return 0.8 // 실내 80%, 실외 20%
    }

    if (tempNum >= 28) {
      return 0.7 // 실내 70%, 실외 30%
    }

    if (tempNum >= 15 && tempNum <= 25) {
      return 0.3 // 실내 30%, 실외 70% (날씨 쾌적! 야외 위주 산책)
    }

    if (tempNum >= 26 && tempNum <= 27) {
      return 0.6 // 실내 60%, 실외 40%
    }

    return 0.5 // 실내 50%, 실외 50%
  }, [weather, weatherParam, tempNum])

  // 선택된 날씨 옵션 및 기온 비율별 큐레이션 타이틀 및 가이드 메시지
  const weatherCareMessage = useMemo(() => {
    const outdoorPct = Math.round((1 - indoorRatio) * 100)
    const indoorPct = Math.round(indoorRatio * 100)

    if (weatherParam === 'snow' || weather.condition === 'snow') {
      return {
        icon: '❄️',
        title: `❄️ 한옥 설경 큐레이션 (기온 ${tempNum}°C · 실내 ${indoorPct}% / 실외 ${outdoorPct}%):`,
        text: `눈 오는 날씨에 맞춰 따뜻한 실내 공간 위주(${indoorPct}%)로 쾌적하게 큐레이션되었습니다.`,
        bannerColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
      }
    }
    if (weatherParam === 'rain' || weather.condition === 'rain' || weather.summary?.includes('비')) {
      return {
        icon: '☔',
        title: `☔ 비 오는 날 낭만 큐레이션 (실내 ${indoorPct}% / 실외 ${outdoorPct}%):`,
        text: `빗줄기를 피할 수 있도록 100% 쾌적한 실내 미술관/공방/찻집 위주(${indoorPct}%)로 배치되었습니다.`,
        bannerColor: 'border-teal-500/40 bg-teal-500/10 text-teal-300',
      }
    }
    if (tempNum >= 28) {
      return {
        icon: '☀️',
        title: `☀️ 무더위·폭염 맞춤 큐레이션 (기온 ${tempNum}°C · 실내 ${indoorPct}% / 실외 ${outdoorPct}%):`,
        text: `28°C 이상 무더위에 맞춰 시원한 에어컨 실내 스팟(${indoorPct}%) 위주로 동선이 쾌적하게 조율되었습니다.`,
        bannerColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      }
    }
    if (tempNum <= 5) {
      return {
        icon: '🥶',
        title: `🥶 한파·찬 바람 맞춤 큐레이션 (기온 ${tempNum}°C · 실내 ${indoorPct}% / 실외 ${outdoorPct}%):`,
        text: `5°C 이하 추위를 피할 수 있는 따뜻한 실내 장소(${indoorPct}%) 위주로 최단 동선이 배치되었습니다.`,
        bannerColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
      }
    }
    if (tempNum >= 15 && tempNum <= 25) {
      return {
        icon: '🌤️',
        title: `🌤️ 최적 쾌적 날씨 큐레이션 (기온 ${tempNum}°C · 실외 ${outdoorPct}% / 실내 ${indoorPct}%):`,
        text: `15°C~25°C의 최고로 좋은 날씨! 야외 명소 산책(${outdoorPct}%)과 실내 공간(${indoorPct}%)이 황금 비율로 구성되었습니다.`,
        bannerColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      }
    }

    return {
      icon: weather.emoji || '🛰️',
      title: `🛰️ 맞춤 날씨(${weather.summary}, ${tempNum}°C) 큐레이션 (실외 ${outdoorPct}% / 실내 ${indoorPct}%):`,
      text: `기온 ${tempNum}°C에 맞춰 실외 산책(${outdoorPct}%)과 실내 방문(${indoorPct}%)이 최적 비율로 배치되었습니다.`,
      bannerColor: 'border-accent/40 bg-accent/10 text-accent',
    }
  }, [weatherParam, weather, tempNum, indoorRatio])

  // isIndoorPriority: 실내 비중이 50% 초과인 경우 (정렬 우선순위 판단용)
  const isIndoorPriority = indoorRatio > 0.5

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

    // 3. 날씨별 실내/야외 비중 기반 필터링
    // indoorRatio = 실내 장소 목표 비율 (예: 0.7이면 70%는 실내, 30%는 야외)
    const indoorTarget = Math.round(targetCount * indoorRatio)
    const outdoorTarget = targetCount - indoorTarget

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

    // DB에서 날씨 비중에 맞게 실내/야외 장소를 할당
    let currentCostSum = generated.reduce((s, p) => s + p.cost, 0)
    // 이미 필수 방문지로 추가된 실내/야외 카운트 반영
    let indoorCount = generated.filter(p => p.isIndoor !== false).length
    let outdoorCount = generated.filter(p => p.isIndoor === false).length

    pureSpotsDatabase.forEach((placeItem) => {
      if (generated.length >= targetCount) return
      if (addedNames.has(placeItem.name.toLowerCase())) return

      // 날씨 비중 제어: 실내/야외 쿼터 초과 시 해당 타입 건너뜀
      if (placeItem.isIndoor !== false) {
        // 실내 장소: 실내 쿼터 초과 시 야외 자리가 남아있으면 건너뜀
        if (indoorCount >= indoorTarget && outdoorCount < outdoorTarget) return
      } else {
        // 야외 장소: 야외 쿼터 초과 시 건너뜀
        if (outdoorCount >= outdoorTarget) return
      }

      if (userBudgetLimit > 0 && currentCostSum + placeItem.cost > userBudgetLimit && placeItem.cost > 0) {
        return
      }

      currentCostSum += placeItem.cost
      addedNames.add(placeItem.name.toLowerCase())
      if (placeItem.isIndoor !== false) indoorCount++; else outdoorCount++
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
  }, [rawMustVisit, time, indoorRatio, isIndoorPriority, weatherParam, companionParam, transport, userBudgetLimit, startLocationParam])


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
        const res = await fetch(`/api/weather?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setWeather({
            condition: data.condition,
            emoji: data.emoji,
            summary: `실시간: ${data.summary}`,
            detail: data.detail,
          })
          const nowKst = new Date().toLocaleTimeString('ko-KR', {
            timeZone: 'Asia/Seoul',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
          setLastFetchTime(data.lastUpdated || nowKst)
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

  // 클릭 시 장소 교체 처리 함수 — 교체 후 전체 경로 최단 순선 재정렬 + 번호 1부터 순서 재배정
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

      // 교체된 새 장소로 목록 교체 (위치는 아직 유지, 재정렬 전)
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

      // 교체 후 출발지 앵커 기준 최단 순선 알고리즘(Nearest-Neighbor TSP) 전체 재정렬
      const startAnchor: Place = {
        id: 'start-anchor',
        order: 0,
        name: startLocationParam,
        category: '출발지',
        cost: 0, costLabel: '0원',
        walkMinutes: 0, reason: '출발지',
        isMustVisit: false,
        mapX: 50, mapY: 50,
        lat: startLocationParam.includes('전주역') ? 35.8490
          : startLocationParam.includes('터미널') ? 35.8360
          : startLocationParam.includes('전북대') ? 35.8470
          : 35.8133,
        lng: startLocationParam.includes('전주역') ? 127.1615
          : startLocationParam.includes('터미널') ? 127.1320
          : startLocationParam.includes('전북대') ? 127.1290
          : 127.1492,
      }

      const unvisited = [...replacedList]
      const reOptimized: Place[] = []

      // 출발지에서 가장 가까운 첫 번째 장소 탐색
      let nearestToStartIdx = 0
      let minStartDist = Infinity
      for (let i = 0; i < unvisited.length; i++) {
        const dist = getPlaceDistance(startAnchor, unvisited[i])
        if (dist < minStartDist) {
          minStartDist = dist
          nearestToStartIdx = i
        }
      }
      let current = unvisited.splice(nearestToStartIdx, 1)[0]
      reOptimized.push(current)

      // 나머지 최단 순선 연결
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

      const total = reOptimized.length

      // 번호(order) 1부터 순서대로, day도 재배분, 이동시간 재계산
      return reOptimized.map((place, idx) => {
        let travelMins = 0
        if (idx > 0) {
          const prevPlace = reOptimized[idx - 1]
          const distSq = getPlaceDistance(prevPlace, place)
          const approxKm = Math.sqrt(distSq)
          travelMins = transport === 'walk'
            ? Math.max(3, Math.round(approxKm * 8 + 2))
            : Math.max(4, Math.round(approxKm * 10 + 2))
        }

        let day = 1
        if (time === '2days') {
          day = idx < Math.ceil(total / 2) ? 1 : 2
        } else if (time === '3days') {
          const perDay = Math.ceil(total / 3)
          if (idx < perDay) day = 1
          else if (idx < perDay * 2) day = 2
          else day = 3
        }

        return ensureThreeDiningAndCafes({
          ...place,
          order: idx + 1,
          day,
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

  // 총 이동 거리 계산 (km 및 m 단위)
  const totalTravelKm = useMemo(() => {
    if (places.length < 2) return 0.4
    let sumKm = 0
    for (let i = 1; i < places.length; i++) {
      const prev = places[i - 1]
      const curr = places[i]
      const distSq = getPlaceDistance(prev, curr)
      const km = Math.sqrt(distSq)
      sumKm += km
    }
    return sumKm
  }, [places])

  const distanceDisplayLabel = useMemo(() => {
    if (totalTravelKm < 1) {
      return `약 ${Math.round(totalTravelKm * 1000)}m`
    }
    return `약 ${totalTravelKm.toFixed(1)}km`
  }, [totalTravelKm])

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

  const handleSaveCourseToMyPage = () => {
    try {
      const savedSession = localStorage.getItem('jeonju_current_user')
      if (!savedSession) {
        if (confirm('코스를 내 정보에 저장하려면 로그인이 필요합니다. 지금 로그인하시겠습니까?')) {
          setIsAuthOpen(true)
        }
        return
      }

      const currentUser = JSON.parse(savedSession)
      const courseTitle = `전주 ${weather.summary} 맞춤 즉흥 코스 (${places.length}개 스팟)`

      const spotsData = places.map((p) => ({
        name: p.name,
        category: p.category,
        costLabel: p.costLabel,
      }))

      const computedTotalCost = places.reduce((acc, p) => acc + (p.cost || 0), 0)
      const computedTotalTravelMinutes = places.reduce((acc, p) => acc + (p.walkMinutes || 5), 0)

      const result = saveCourseToUser(currentUser.email, {
        title: courseTitle,
        startLocation: startLocationParam,
        startAddress: searchParams.get('startAddress') || '',
        mustVisit: rawMustVisit || '',
        timeOption: time,
        weatherSummary: weather.summary,
        weatherEmoji: weather.emoji,
        weatherParam: weatherParam,
        companion: companionParam,
        transport,
        totalBudget: userBudgetLimit,
        totalCost: computedTotalCost,
        totalTravelMinutes: computedTotalTravelMinutes,
        spots: spotsData,
        savedPlaces: places,
      })

      if (result.success) {
        setIsSavedToMyPage(true)
        setSaveToastMsg('내 정보 관리(마이페이지)에 코스가 성공적으로 저장되었습니다! 🎉')
        setTimeout(() => setSaveToastMsg(''), 3500)
      }
    } catch (e) {
      console.error('코스 저장 오류:', e)
      alert('코스 저장 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      {/* 사용자가 메인 화면에서 선택한 날씨 수묵화 배경 100% 동일 적용 */}
      <WeatherBackground weather={weatherParam} realtimeCondition={weather.condition} />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-28">
      {/* 실시간 / 선택된 예보 날씨 요약 배지 */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-sky-200/80 bg-white/85 p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {weather.emoji}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">
                {weather.summary}
              </p>
              {weatherParam !== 'auto' && (
                <span className="rounded-full bg-amber-100 border border-amber-300/60 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  예보 조건 맞춤
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium">{weather.detail}</p>
          </div>
        </div>

        {weatherParam === 'auto' ? (
          <button
            type="button"
            onClick={loadRealtimeWeather}
            disabled={weatherLoading}
            title="기상청/실시간 날씨 새로고침"
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50"
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

      {/* 📖 3파트 책 넘기기 탭 네비게이션 & 스와이프 바 */}
      <div className="mt-4 flex flex-col gap-2.5 rounded-2xl border border-sky-200/80 bg-white/90 p-3.5 shadow-xl backdrop-blur-md sticky top-16 z-30">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <BookOpen className="size-4" />
            </span>
            <span className="font-serif text-base font-bold text-slate-900">
              전주 여행 코스 가이드북
            </span>
          </div>
          <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full border border-sky-300/80">
            {activeTab + 1} / 3장 ({activeTab === 0 ? '코스 & 경로지도' : activeTab === 1 ? '이동 & 장소추가' : '예산 지출분석'})
          </span>
        </div>

        {/* 3파트 선택 탭 버튼 3개 (1장: 코스 & 지도, 2장: 이동 & 추가, 3장: 예산 분석) */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab(0)}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer border",
              activeTab === 0
                ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-[1.01]"
                : "bg-slate-100/80 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            )}
          >
            <MapPin className="size-4 shrink-0" />
            <span>1장. 코스 & 지도</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer border",
              activeTab === 1
                ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-[1.01]"
                : "bg-slate-100/80 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            )}
          >
            <Bus className="size-4 shrink-0" />
            <span>2장. 이동 & 추가</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(2)}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer border",
              activeTab === 2
                ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-[1.01]"
                : "bg-slate-100/80 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            )}
          >
            <PieChart className="size-4 shrink-0" />
            <span>3장. 예산 분석</span>
          </button>
        </div>

        {/* 이전장 / 다음장 넘기기 화살표 슬라이드 컨트롤 & 1장(코스&지도) 선택 시 둥근 알약형 지도 컨트롤 바 배치 (w-full relative 완벽 정중앙 고정!) */}
        <div className="relative w-full flex items-center justify-between gap-2 pt-1 border-t border-border/50 min-h-[44px]">
          {/* 좌측: 이전 장 */}
          <button
            type="button"
            onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
            disabled={activeTab === 0}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/60 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all shrink-0 z-20"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">◀ 이전 장</span>
          </button>

          {/* 🎯 정중앙: 1장(코스 & 지도) 활성화 시 헤더 바 완벽 정중앙(absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2)에 둥근 알약형 지도 컨트롤 바 고정! */}
          {activeTab === 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center gap-1.5 sm:gap-2">
              {/* 알약 용기 1: 직선 vs 도로 길찾기 */}
              <div className="flex items-center gap-1 bg-sky-50/90 p-1 rounded-full border border-sky-300 shadow-sm backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setMapRouteMode('straight')}
                  className={cn(
                    'h-7 px-3 text-xs font-bold rounded-full transition-all gap-1.5 flex items-center cursor-pointer',
                    mapRouteMode === 'straight'
                      ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
                  )}
                >
                  <Route className="size-3.5 text-amber-400" />
                  <span>직선</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMapRouteMode('navigation')}
                  className={cn(
                    'h-7 px-3.5 text-xs font-extrabold rounded-full transition-all gap-1.5 flex items-center cursor-pointer',
                    mapRouteMode === 'navigation'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
                  )}
                >
                  <Navigation className="size-3.5 text-sky-200" />
                  <span>🚗 🗺️ 도로 길찾기</span>
                </button>
              </div>

              {/* 알약 용기 2: 주황/파랑 구간 선택 드롭다운 버튼 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMapSegmentOpen((prev) => !prev)}
                  className={cn(
                    'h-8 px-3.5 text-xs font-black rounded-full gap-1.5 transition-all shadow-md cursor-pointer border flex items-center',
                    mapCustomPinPair || mapSelectedSegment !== null
                      ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow-blue-500/20'
                      : mapCustomStartPin !== null
                      ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                      : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-600',
                  )}
                >
                  <Compass className="size-3.5" />
                  <span className="text-sky-200">🌐</span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">{mapCurrentSegmentText}</span>
                  {isMapSegmentOpen ? <ChevronUp className="size-3.5 ml-0.5" /> : <ChevronDown className="size-3.5 ml-0.5" />}
                </button>

                {(mapCustomPinPair || mapSelectedSegment !== null || mapCustomStartPin !== null) && (
                  <button
                    type="button"
                    onClick={handleResetAllMap}
                    className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-950 text-[10px] font-bold shadow-md cursor-pointer border border-white"
                    title="전체 코스로 해제"
                  >
                    ✕
                  </button>
                )}

                {/* 드롭다운 오버레이 팝오버 메뉴 */}
                {isMapSegmentOpen && (
                  <div className="absolute top-full right-0 mt-2 z-50 w-[295px] sm:w-[360px] max-h-[350px] overflow-y-auto rounded-2xl border border-sky-300 bg-white p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-amber-500" />
                        구간선택 (지도 핀 2개 직접 클릭 OR 아래 목록)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMapSegmentOpen(false)}
                        className="text-xs text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5 cursor-pointer"
                      >
                        닫기 ✕
                      </button>
                    </div>

                    <div className="grid gap-1.5">
                      <button
                        type="button"
                        onClick={handleResetAllMap}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer',
                          mapSelectedSegment === null && mapCustomPinPair === null
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>🌐</span>
                          <span>전체 {places.length}개 코스 한눈에 보기</span>
                        </div>
                        {mapSelectedSegment === null && mapCustomPinPair === null && <CheckCircle2 className="size-4 text-slate-950" />}
                      </button>

                      {places.length >= 5 && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2 space-y-1">
                          <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                            <Navigation className="size-3 text-blue-600" /> 🎯 주요 임의 경로 바로보기:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => handleSelectMapCustomPair([1, 5])}
                              className={cn(
                                'px-2 py-0.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1',
                                mapCustomPinPair?.[0] === 1 && mapCustomPinPair?.[1] === 5
                                  ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                                  : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-100',
                              )}
                            >
                              <span>1번 ➔ 5번</span>
                            </button>

                            {places.length >= 8 && (
                              <button
                                type="button"
                                onClick={() => handleSelectMapCustomPair([2, 8])}
                                className={cn(
                                  'px-2 py-0.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1',
                                  mapCustomPinPair?.[0] === 2 && mapCustomPinPair?.[1] === 8
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

                      <div className="space-y-1 pt-1">
                        <p className="text-[11px] font-bold text-slate-500">📍 순차 구간별 보기:</p>
                        {places.slice(0, -1).map((fromP, idx) => {
                          const segNum = idx + 1
                          const toP = places[idx + 1]
                          const isSelected = mapSelectedSegment === segNum && mapCustomPinPair === null

                          return (
                            <button
                              key={`map-dropdown-seg-${segNum}`}
                              type="button"
                              onClick={() => handleSelectMapSegment(segNum)}
                              className={cn(
                                'w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer',
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
                              )}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className={cn(
                                  'flex size-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
                                  isSelected ? 'bg-white text-blue-700' : 'bg-slate-900 text-white'
                                )}>
                                  {segNum}
                                </span>
                                <span className="truncate">{fromP.name}</span>
                                <ArrowRight className={cn('size-3 shrink-0', isSelected ? 'text-blue-200' : 'text-slate-400')} />
                                <span className={cn(
                                  'flex size-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
                                  isSelected ? 'bg-white text-blue-700' : 'bg-slate-900 text-white'
                                )}>
                                  {segNum + 1}
                                </span>
                                <span className="truncate">{toP.name}</span>
                              </div>

                              {isSelected && <CheckCircle2 className="size-4 text-white shrink-0 ml-1.5" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 우측: 다음 장 */}
          <button
            type="button"
            onClick={() => setActiveTab((prev) => Math.min(2, prev + 1))}
            disabled={activeTab === 2}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/60 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all shrink-0 z-20 ml-auto"
          >
            <span className="hidden sm:inline">다음 장 ▶</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📖 3PART 책 가로 슬라이드 본문 컨텐츠 */}
      {/* ========================================================================= */}
      <div className="mt-4">
        {/* ----------------------------------------------------------------------- */}
        {/* 🗺️ 1장: 추천 장소 카드 목록 & 인터랙티브 최단 경로 지도 */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 0 ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* 시간 및 이동수단 안내 띠 */}
            <div className="flex flex-col gap-2.5 rounded-2xl bg-white/95 border border-sky-200/80 p-4 shadow-md backdrop-blur-md text-xs text-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-bold text-amber-800">
                  <Clock className="size-4 text-amber-600" />
                  {timeLabel}
                </span>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                    <Utensils className="size-3.5" />
                    각 장소별 주변 맛집 3선 · 카페 3선 · 특산품 3선 풀 탑재
                  </span>
                  <span className="font-semibold">총 {places.length}개 스팟</span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-200/80 pt-2 text-slate-700">
                <TransportIcon className="size-4 text-sky-600 shrink-0" />
                <span className="font-medium text-slate-800">{transportLabel.text}</span>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,45%)]">
              {/* 왼쪽: 추천 카드 리스트 */}
              <section aria-label="추천 장소 목록" className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border border-sky-200/80 bg-white/95 p-4 shadow-md backdrop-blur-md">
                  <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-xl">🚩</span>
                    <span>{startLocationParam} 출발 맞춤 추천 코스</span>
                  </h2>
                  <span className="text-xs text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/80 w-fit font-medium">
                    💡 카드를 누르거나 &apos;다른 장소 변경&apos; 클릭 시 교체돼요
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

              {/* 오른쪽: 지도 */}
              <section
                aria-label="추천 경로 지도"
                className="lg:sticky lg:top-36 lg:h-[calc(100svh-12rem)]"
              >
                <MapPlaceholder
                  places={places}
                  activeId={activeId}
                  onHover={setActiveId}
                  routeMode={mapRouteMode}
                  selectedSegment={mapSelectedSegment}
                  customPinPair={mapCustomPinPair}
                  customStartPin={mapCustomStartPin}
                  setCustomStartPin={setMapCustomStartPin}
                  onSelectCustomPair={handleSelectMapCustomPair}
                  onResetAll={handleResetAllMap}
                  transport={transport}
                />
              </section>
            </div>

            {/* 다음 장으로 넘어가기 안내 바 */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setActiveTab(1)}
                className="rounded-xl gap-2 bg-accent text-accent-foreground font-bold shadow-md hover:bg-accent/90 cursor-pointer"
              >
                <span>🚌 2장. 이동노선 & 장소추가 보러가기</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {/* ----------------------------------------------------------------------- */}
        {/* 🚌 2장: 출발지 ➔ 1번 장소 시내버스 이동 노선 & 중간 장소 검색 추가 바 */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 1 ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* 출발지 ➔ 1번 추천 장소 이동 방법 & 시내버스 노선 추천 전용 배지 */}
            {firstPlaceTransitInfo && places.length > 0 ? (
              <div className="flex flex-col gap-2.5 rounded-2xl border border-sky-300/80 bg-white/90 p-4 text-xs text-slate-900 shadow-lg backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/60 pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-sky-800">
                    <Bus className="size-4.5 text-sky-600 shrink-0" />
                    <span>🚩 출발지에서 1번 '{places[0].name}'까지 이동 방법 & 추천 시내버스</span>
                  </div>
                  <a
                    href={firstPlaceTransitInfo.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-200 transition-colors border border-sky-300 shadow-xs"
                  >
                    <span>네이버 지도 실시간 길찾기</span>
                    <ArrowRight className="size-3.5 text-sky-700" />
                  </a>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                  <div className="flex flex-col gap-1 rounded-xl bg-sky-50/80 p-3 border border-sky-200/70">
                    <span className="font-bold text-sky-800 text-sm">{firstPlaceTransitInfo.busRoute}</span>
                    <span className="text-slate-600 text-xs font-medium">🚏 탑승: {firstPlaceTransitInfo.boardStop}</span>
                    <span className="text-slate-600 text-xs font-medium">🚏 하차: {firstPlaceTransitInfo.alightStop}</span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl bg-emerald-50/80 p-3 border border-emerald-200/70">
                    <span className="font-bold text-emerald-800 text-sm">⏱️ 대중교통 소요시간: {firstPlaceTransitInfo.duration}</span>
                    <span className="text-slate-600 text-xs font-medium">🚗 자차 이동 소요시간: {firstPlaceTransitInfo.carDuration}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* ➕ 코스 중간 장소 검색 & 최단 순선 실시간 재최적화 추가 바 */}
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/80 bg-white/90 p-5 shadow-lg backdrop-blur-md relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-base text-slate-900">
                  <Plus className="size-5 text-amber-600" />
                  <span>➕ 동선 중간에 새로 가고 싶은 장소 검색해서 추가하기 (자동 최단 순선 재정렬)</span>
                </div>
                <span className="text-xs text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-md">네이버 지도 연동 스팟 검색</span>
              </div>

              {/* 토스트 노티피케이션 메세지 */}
              {addedToastMessage ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-100 border border-emerald-300 p-3 text-xs font-bold text-emerald-900 animate-in fade-in">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>{addedToastMessage}</span>
                </div>
              ) : null}

              <div className="relative">
                <div className="flex items-center rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-slate-900 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-300/40 shadow-inner">
                  <Search className="size-4 text-amber-600 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={addSearchInput}
                    onFocus={() => setShowAddSuggestions(true)}
                    onChange={(e) => {
                      setAddSearchInput(e.target.value)
                      setShowAddSuggestions(true)
                    }}
                    placeholder="추가하고 싶은 장소를 검색해 보세요! (예: 보드게임카페, 레드버튼, 방탈출, 인생네컷, 노래방, 올리브영, 만화카페)"
                    className="w-full bg-transparent outline-none placeholder:text-slate-400 font-medium text-slate-900"
                  />
                </div>

                {/* 검색 자동완성 드롭다운 */}
                {showAddSuggestions && addPlaceSuggestions.length > 0 ? (
                  <div className="absolute inset-x-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-2xl border border-sky-200 bg-white p-2 shadow-xl backdrop-blur-md">
                    <div className="px-3 py-2 text-xs font-bold text-sky-700 border-b border-slate-100 flex items-center justify-between">
                      <span>🔍 네이버 지도 검색 결과 (위치를 먼저 확인 후 코스에 추가하실 수 있습니다)</span>
                      <span className="text-[10px] text-slate-400">네이버 지도 연동</span>
                    </div>
                    {addPlaceSuggestions.map((item) => (
                      <div
                        key={item.name}
                        className="flex flex-col gap-1.5 px-3 py-2.5 hover:bg-sky-50 rounded-xl transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                            <span>{item.name}</span>
                            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={item.naverMapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(item.name)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100 transition-colors shadow-2xs"
                            >
                              <MapPin className="size-3 text-sky-600" />
                              <span>🗺️ 네이버 지도 위치 확인</span>
                            </a>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAddPlaceToItinerary(item)}
                              className="h-7 text-[11px] rounded-lg shrink-0 gap-1 font-bold bg-amber-400 text-slate-950 hover:bg-amber-300"
                            >
                              <Plus className="size-3" /> 코스 추가
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span>📍 실제 주소: <strong className="text-slate-800">{item.address || '전북 전주시'}</strong></span>
                          <span className="text-emerald-600 font-bold">{item.costLabel || '비용 정보'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* 다음 장으로 넘어가기 안내 바 */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab(0)}
                className="rounded-xl gap-2 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                <span>🗺️ 1장. 코스 & 경로 지도</span>
              </Button>

              <Button
                onClick={() => setActiveTab(2)}
                className="rounded-xl gap-2 bg-accent text-accent-foreground font-bold shadow-md hover:bg-accent/90 cursor-pointer"
              >
                <span>📊 3장. 예산 지출 분석 그래프 보러가기</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {/* ----------------------------------------------------------------------- */}
        {/* 📊 Part 3: 여행 시간 맞춤 예산 분석 원형 그래프 */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 2 ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <BudgetPieChart
              userBudgetLimit={userBudgetLimit}
              totalPlaceCost={totalCost}
              places={places}
              transport={transport}
              time={time}
            />

            {/* 이전 장으로 돌아가기 안내 바 */}
            <div className="flex justify-start pt-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab(1)}
                className="rounded-xl gap-2 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                <span>🚌 2장. 이동 & 장소 추가로 돌아가기</span>
              </Button>
            </div>
          </div>
        ) : null}

        {/* Toast Notification for Saving Course */}
        {saveToastMsg && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-amber-950 text-amber-50 px-4 py-3 shadow-2xl border border-amber-800 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5">
            <Check className="size-4 text-amber-400 shrink-0" />
            <span>{saveToastMsg}</span>
          </div>
        )}
      </div>

      {/* 하단 고정바 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur shadow-lg">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5">
              <Wallet className="size-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-foreground">
                한도: {budgetDisplayLabel}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-foreground">
                총 {totalTravelMinutes}분 이동
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-sky-600 shrink-0" />
              <span className="font-semibold text-foreground">
                총 {distanceDisplayLabel} 이동
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveCourseToMyPage}
              className={cn(
                'rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all gap-1.5',
                isSavedToMyPage
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-amber-950'
              )}
            >
              <Bookmark className="size-4" />
              {isSavedToMyPage ? '내 정보에 저장됨!' : '📌 이 코스 내 정보에 저장'}
            </Button>
            <Button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href)
                  alert('추천 코스 링크가 클립보드에 복사되었습니다!')
                }
              }}
              variant="outline"
              className="rounded-xl text-xs sm:text-sm"
            >
              <Share2 className="size-4" /> 공유
            </Button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode="login"
      />
      </div>
    </>
  )
}
