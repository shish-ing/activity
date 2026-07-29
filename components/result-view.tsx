'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bus, Calendar, Car, Clock, Footprints, RefreshCw, Share2, Utensils, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlaceCard } from '@/components/place-card'
import { MapPlaceholder } from '@/components/map-placeholder'
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

export function ResultView() {
  const searchParams = useSearchParams()
  const rawMustVisit = searchParams.get('mustVisit')
  const time = searchParams.get('time') || '3h'
  const transport = searchParams.get('transport') || 'walk' // 'walk' | 'transit' | 'car'
  const weatherParam = searchParams.get('weather') || 'auto' // 'auto' | 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'

  const [places, setPlaces] = useState<Place[]>(RECOMMENDED_PLACES)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [shared, setShared] = useState(false)
  const [weather, setWeather] = useState<Weather>(CURRENT_WEATHER)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<string>('')

  // 이동수단 라벨 & 아이콘
  const transportLabel = useMemo(() => {
    switch (transport) {
      case 'car':
        return { text: '자차 이동 (목적지별 추천 주차장 안내)', icon: Car }
      case 'transit':
        return { text: '대중교통 이동 (시내버스 번호 & 승하차 정류장)', icon: Bus }
      default:
        return { text: '도보 이동 (산책로 중심 동선)', icon: Footprints }
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
        return '반나절 (4~5시간 코스 · 점심 맛집 포함)'
      case 'full':
        return '하루 (풀 코스 · 7곳)'
      case '2days':
        return '이틀 (1박 2일 일정 · 10곳 코스)'
      case '3days':
        return '사흘 (2박 3일 일정 · 14곳 풀 코스)'
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
          text: '매서운 찬 바람과 추위를 피할 수 있도록 뜨끈한 한옥 전통 찻집(쌍화차·한방차), 몸을 녹여주는 전주 콩나물국밥/순대국밥, 따뜻한 실내 공방(한지/부채/도자기) 위주로 코스를 큐레이션했습니다.',
          bannerColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
        }
      case 'snow':
        return {
          icon: '❄️',
          title: '❄️ 한옥 설경·눈 오는 날 큐레이션:',
          text: '하얀 눈이 내려앉은 고즈넉한 한옥 풍경을 온돌 툇마루에서 감상할 수 있는 전통 찻집, 뜨끈한 전주 콩나물국밥, 쾌적한 실내 공방 위주로 코스를 구성했습니다.',
          bannerColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
        }
      case 'rain':
        return {
          icon: '☔',
          title: '☔ 비 오는 날 낭만 큐레이션:',
          text: '빗소리를 들으며 즐길 수 있는 고즈넉한 전통 찻집, 수제 한지/도자기 실내 공방, 지하 어진박물관 위주로 우천 맞춤 동선을 구성했습니다.',
          bannerColor: 'border-teal-500/40 bg-teal-500/10 text-teal-300',
        }
      case 'clear':
        return {
          icon: '☀️',
          title: '☀️ 폭염·더위 맞춤 큐레이션:',
          text: '무더위 땡볕 야외 언덕(오목대 등)을 피하고, 에어컨이 완비된 시원한 수제 공방(한지·부채·도자기), 지하 어진박물관, 흑임자 팥빙수 카페 위주로 코스를 자동 배치했습니다.',
          bannerColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        }
      case 'cloudy':
        return {
          icon: '☁️',
          title: '☁️ 선선한 날씨 맞춤 큐레이션:',
          text: '햇살이 적당하고 선선해 한옥마을 돌담길과 경기전 대나무 숲, 골목 공방 산책을 즐기기 딱 좋은 밸런스 코스입니다.',
          bannerColor: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
        }
      default:
        // auto
        return {
          icon: weather.emoji,
          title: `🛰️ 실시간 날씨(${weather.summary}) 큐레이션:`,
          text: weather.detail.includes('30°C')
            ? '실시간 무더위를 피할 시원한 수제 공방, 지하 어진박물관, 팥빙수 카페 위주로 큐레이션되었습니다.'
            : '실시간 전주 기상 조건에 맞춘 최적 동선입니다.',
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

  // 선택한 남은 시간, 날씨 및 필수 방문지 기반 동적 코스 자동 생성
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
        generated.push({
          ...foundInDb,
          id: `mv-${orderCounter}`,
          order: orderCounter++,
          isMustVisit: true,
          reason: `사용자께서 직접 검색하여 추가하신 필수 방문지 '${name}'입니다.`,
          warning: isOutdoorExtreme
            ? `⚠️ 악천후/한파 주의: 야외 땡볕 또는 찬 바람 구간입니다. 따뜻한 음료 지참 및 실내 공방/찻집 휴식을 병행하세요.`
            : foundInDb.warning,
        })
      } else if (!addedNames.has(name.toLowerCase())) {
        addedNames.add(name.toLowerCase())
        generated.push({
          id: `mv-custom-${orderCounter}`,
          order: orderCounter++,
          name: name,
          category: '검색 추가 · 명소',
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
        })
      }
    })

    // 2. 남은 시간별 목표 장소 수 정의
    let targetCount = 3
    if (time === '1h') targetCount = 1
    else if (time === '3h') targetCount = 3
    else if (time === 'half') targetCount = 5
    else if (time === 'full') targetCount = 7
    else if (time === '2days') targetCount = 10
    else if (time === '3days') targetCount = 14

    // 3. 점심 식사/맛집 포함 여부
    const needsMeal = time !== '1h'

    // 날씨(한파/폭염/우천)에 맞춰 따뜻한 찻집, 뜨끈한 국밥, 실내 공방 우선순위 정렬
    const candidateDatabase = [...JEONJU_PLACES_DATABASE].sort((a, b) => {
      // 한파 / 찬 바람 선택 시: 따뜻한 찻집, 뜨끈한 국밥 우선
      if (weatherParam === 'wind' || weatherParam === 'snow') {
        const aColdMatch = a.name.includes('찻집') || a.name.includes('국밥') || a.name.includes('피순대')
        const bColdMatch = b.name.includes('찻집') || b.name.includes('국밥') || b.name.includes('피순대')
        if (aColdMatch && !bColdMatch) return -1
        if (!aColdMatch && bColdMatch) return 1
      }
      if (isIndoorPriority) {
        if (a.isIndoor && !b.isIndoor) return -1
        if (!a.isIndoor && b.isIndoor) return 1
      }
      return 0
    })

    // DB에서 조건에 부합하는 장소들 채우기
    candidateDatabase.forEach((placeItem) => {
      if (generated.length >= targetCount) return
      if (addedNames.has(placeItem.name.toLowerCase())) return

      // 한파/폭염/우천 시 야외 전용 장소(오목대, 자만벽화마을 등)는 비필수일 때 자동 제외/대체
      if (isIndoorPriority && placeItem.isIndoor === false && !placeItem.isMustVisit) {
        return
      }

      // 반나절 이상 코스일 때 점심 맛집이 아직 없으면 맛집 우선 추가
      if (
        needsMeal &&
        !generated.some((g) => g.isMeal) &&
        placeItem.isMeal
      ) {
        addedNames.add(placeItem.name.toLowerCase())
        generated.push({
          ...placeItem,
          id: `db-${orderCounter}`,
          order: orderCounter++,
          reason: weatherParam === 'wind' || weatherParam === 'snow'
            ? `몸을 따뜻하게 녹여주는 네이버 지도 추천 뜨끈한 국밥/미식 맛집입니다.`
            : `네이버 지도 추천 전주 3대 점심/미식 맛집입니다.`,
        })
        return
      }

      addedNames.add(placeItem.name.toLowerCase())
      generated.push({
        ...placeItem,
        id: `db-${orderCounter}`,
        order: orderCounter++,
      })
    })

    // 목표 장소 수에 미달하면 남은 장소들로 보충
    if (generated.length < targetCount) {
      JEONJU_PLACES_DATABASE.forEach((placeItem) => {
        if (generated.length >= targetCount) return
        if (addedNames.has(placeItem.name.toLowerCase())) return
        addedNames.add(placeItem.name.toLowerCase())
        generated.push({
          ...placeItem,
          id: `db-fill-${orderCounter}`,
          order: orderCounter++,
        })
      })
    }

    // 4. 이틀(1박2일), 사흘(2박3일) 일차(day: 1, 2, 3) 부여 및 보정
    const finalPlaces = generated.map((place, idx) => {
      let day = 1
      if (time === '2days') {
        day = idx < 5 ? 1 : 2
      } else if (time === '3days') {
        if (idx < 5) day = 1
        else if (idx < 10) day = 2
        else day = 3
      }
      return {
        ...place,
        order: idx + 1,
        day,
        walkMinutes: Math.max(0, idx * 6),
      }
    })

    setPlaces(finalPlaces)
  }, [rawMustVisit, time, isIndoorPriority, weatherParam])

  async function loadRealtimeWeather() {
    setWeatherLoading(true)
    try {
      if (weatherParam === 'clear') {
        setWeather({
          condition: 'clear',
          emoji: '☀️',
          summary: '☀️ 맑음 · 폭염 (선택한 예보 날씨)',
          detail: '무더위를 피해 에어컨이 시원한 실내 수제 공방/지하 어진박물관/빙수 카페 위주로 큐레이션되었습니다 · 기온 31°C · 강수확률 0%',
        })
        setLastFetchTime('예보 선택')
      } else if (weatherParam === 'rain') {
        setWeather({
          condition: 'rain',
          emoji: '☔',
          summary: '☔ 비 옴 (선택한 예보 날씨)',
          detail: '비 오는 날 운치에 어울리는 실내 공방/전통 찻집/실내 체험 위주로 추천드려요 · 기온 21°C · 강수확률 90%',
        })
        setLastFetchTime('예보 선택')
      } else if (weatherParam === 'cloudy') {
        setWeather({
          condition: 'cloudy',
          emoji: '☁️',
          summary: '☁️ 구름 많음 (선택한 예보 날씨)',
          detail: '선선해서 한옥마을 및 야외 걷기 딱 좋은 날씨예요 · 기온 24°C · 강수확률 20%',
        })
        setLastFetchTime('예보 선택')
      } else if (weatherParam === 'snow') {
        setWeather({
          condition: 'snow',
          emoji: '❄️',
          summary: '❄️ 눈 옴 (선택한 예보 날씨)',
          detail: '하얀 한옥 설경과 따뜻한 실내 찻집/전주 콩나물국밥 위주로 추천해 드려요 · 기온 -2°C · 강수확률 80%',
        })
        setLastFetchTime('예보 선택')
      } else if (weatherParam === 'wind') {
        setWeather({
          condition: 'wind',
          emoji: '🥶',
          summary: '🥶 한파 · 찬 바람 (선택한 예보 날씨)',
          detail: '매서운 바람을 피할 따뜻한 한방 쌍화차 찻집과 뜨끈한 남부시장 순대국밥/콩나물국밥 코스를 추천해 드려요 · 기온 -5°C · 강수확률 10%',
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

  function handleReplace(id: string) {
    setPlaces((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const alt = ALTERNATIVE_PLACES[p.id]
        if (alt) {
          return { ...alt, order: p.order, day: p.day }
        }
        const baseId = p.id.replace('-alt', '')
        const original = RECOMMENDED_PLACES.find((o) => o.id === baseId)
        return original ? { ...original, order: p.order, day: p.day } : p
      }),
    )
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

  const mealCount = useMemo(
    () => places.filter((p) => p.isMeal).length,
    [places],
  )

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

      {/* 날씨 맞춤 큐레이션 안내 배지 (한파/폭염/우천/설경 각각 정확히 표시) */}
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
            {mealCount > 0 ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Utensils className="size-3" />
                네이버 지도 추천 점심/식사 {mealCount}곳 포함
              </span>
            ) : null}
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
              네이버 지도 기반 맞춤 추천 코스
            </h2>
            <span className="text-xs text-muted-foreground">
              카드를 누르면 지도에 표시돼요
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
                {dayPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    transport={transport}
                    highlighted={activeId === place.id}
                    canReplace={Boolean(
                      ALTERNATIVE_PLACES[place.id] || place.id.endsWith('-alt'),
                    )}
                    onHover={setActiveId}
                    onReplace={handleReplace}
                  />
                ))}
              </div>
            ))
          ) : (
            // 일반 리스트 (1시간, 3시간, 반나절, 하루)
            places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                transport={transport}
                highlighted={activeId === place.id}
                canReplace={Boolean(
                  ALTERNATIVE_PLACES[place.id] || place.id.endsWith('-alt'),
                )}
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

      {/* 하단 고정바 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Wallet className="size-4 text-accent" />
              <span className="font-semibold text-foreground">
                {formatWon(totalCost)}
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
