'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bus, Calendar, Car, Clock, Footprints, RefreshCw, Share2, SunMedium, Utensils, Wallet } from 'lucide-react'
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

  // 날씨 기반 폭염/우천 자동 배치 판단
  const isHotOrRain = useMemo(() => {
    return (
      weather.condition === 'rain' ||
      weather.detail.includes('30°C') ||
      weather.detail.includes('29°C') ||
      weather.detail.includes('28°C') ||
      weather.summary.includes('맑음')
    )
  }, [weather])

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
        // 만약 폭염 날씨인데 야외 명소(오목대 등)가 필수 방문지에 포함되어 있다면 폭염 경고 추가
        const isOutdoorHot = isHotOrRain && foundInDb.isIndoor === false
        generated.push({
          ...foundInDb,
          id: `mv-${orderCounter}`,
          order: orderCounter++,
          isMustVisit: true,
          reason: `사용자께서 직접 검색하여 추가하신 필수 방문지 '${name}'입니다.`,
          warning: isOutdoorHot
            ? `☀️ 폭염 주의 (기온 30°C): 땡볕 경사 구간입니다. 양산/손선풍기 필수 및 시원한 실내 공방/카페 휴식을 병행하세요.`
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

    // 날씨(폭염/우천)일 때 실내 스팟(공방, 박물관, 빙수, 찻집 등)을 땡볕 야외 스팟보다 우선순위 높게 배치
    const candidateDatabase = [...JEONJU_PLACES_DATABASE].sort((a, b) => {
      if (isHotOrRain) {
        if (a.isIndoor && !b.isIndoor) return -1
        if (!a.isIndoor && b.isIndoor) return 1
      }
      return 0
    })

    // DB에서 조건에 부합하는 장소들 채우기
    candidateDatabase.forEach((placeItem) => {
      if (generated.length >= targetCount) return
      if (addedNames.has(placeItem.name.toLowerCase())) return

      // 폭염 시 야외 전용 장소(오목대, 자만벽화마을 등)는 비필수일 때 자동 제외/대체
      if (isHotOrRain && placeItem.isIndoor === false && !placeItem.isMustVisit) {
        // 폭염 날씨일 경우 야외 언덕 코스(오목대 등) 대신 실내 공방/박물관 우선 추천
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
          reason: `네이버 지도 추천 시원한 전주 3대 점심/미식 맛집입니다.`,
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
  }, [rawMustVisit, time, isHotOrRain])

  async function loadRealtimeWeather() {
    setWeatherLoading(true)
    try {
      const res = await fetch('/api/weather')
      if (res.ok) {
        const data = await res.json()
        setWeather({
          condition: data.condition,
          emoji: data.emoji,
          summary: data.summary,
          detail: data.detail,
        })
        if (data.lastUpdated) {
          setLastFetchTime(data.lastUpdated)
        }
      }
    } catch (err) {
      console.error('Failed to load realtime weather:', err)
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    loadRealtimeWeather()
    const timer = setInterval(loadRealtimeWeather, 3600000)
    return () => clearInterval(timer)
  }, [])

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
      {/* 실시간 날씨 요약 배지 */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {weather.emoji}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                전주 실시간 날씨: {weather.summary}
              </p>
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent">
                1시간 주기 최신화
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{weather.detail}</p>
          </div>
        </div>

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
      </div>

      {/* 폭염/더위 날씨 맞춤 큐레이션 안내 배지 */}
      {isHotOrRain ? (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-foreground">
          <SunMedium className="size-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-400">☀️ 폭염 날씨 케어 큐레이션:</span>{' '}
            <span>
              오늘처럼 기온이 높은 날(30°C) 땡볕 야외 언덕(오목대 등)을 피하고, 에어컨이 완비된 <strong>시원한 수제 공방(한지·부채·도자기), 지하 어진박물관, 빙수 카페</strong> 위주로 코스를 자동 배치했습니다.
            </span>
          </div>
        </div>
      ) : null}

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
