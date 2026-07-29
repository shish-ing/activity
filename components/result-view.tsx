'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Clock, RefreshCw, Share2, Wallet } from 'lucide-react'
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

  const [places, setPlaces] = useState<Place[]>(RECOMMENDED_PLACES)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [shared, setShared] = useState(false)
  const [weather, setWeather] = useState<Weather>(CURRENT_WEATHER)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<string>('')

  // URL에서 전달받은 검색 필수 방문지를 코스에 동적으로 포함
  useEffect(() => {
    if (!rawMustVisit) return

    const mustVisitNames = rawMustVisit
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (mustVisitNames.length === 0) return

    const newPlaces: Place[] = []
    let orderCounter = 1

    mustVisitNames.forEach((name) => {
      const foundInDb = JEONJU_PLACES_DATABASE.find(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      )

      if (foundInDb) {
        newPlaces.push({
          ...foundInDb,
          id: `mv-${orderCounter}`,
          order: orderCounter++,
          isMustVisit: true,
          reason: `사용자께서 직접 검색하여 추가하신 필수 방문지 '${name}'입니다.`,
        })
      } else {
        newPlaces.push({
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
        })
      }
    })

    // 기본 추천 장소 중 필수 방문지와 중복되지 않는 로컬 액티비티 추가 (최대 5곳 코스 구성)
    RECOMMENDED_PLACES.forEach((p) => {
      if (
        newPlaces.length < 5 &&
        !newPlaces.some(
          (np) => np.name.toLowerCase() === p.name.toLowerCase(),
        )
      ) {
        newPlaces.push({
          ...p,
          order: orderCounter++,
          walkMinutes: Math.max(5, (orderCounter - 1) * 6),
        })
      }
    })

    setPlaces(newPlaces)
  }, [rawMustVisit])

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

        // 맑음/구름 날씨일 때 장소 사유 업데이트 (우천 전용 문구 제거)
        if (data.condition !== 'rain') {
          setPlaces((prev) =>
            prev.map((p) => {
              if (p.id === 'p1' || p.name === '전동성당') {
                return {
                  ...p,
                  reason: '현재 위치에서 가까운 전주의 대표 역사 명소예요.',
                  warning: undefined,
                }
              }
              if (p.id === 'p2' || p.name === '한옥마을 전통찻집') {
                return {
                  ...p,
                  reason: '한옥 정취를 느끼며 여유롭게 쉬어가기 좋은 전통 찻집이에요.',
                }
              }
              if (p.id === 'p3' || p.name === '수제 한지 공방 체험') {
                return {
                  ...p,
                  reason: '전주 한지의 매력을 직접 느낄 수 있는 특별한 로컬 체험 공방이에요.',
                }
              }
              return p
            }),
          )
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
          return { ...alt, order: p.order }
        }
        const baseId = p.id.replace('-alt', '')
        const original = RECOMMENDED_PLACES.find((o) => o.id === baseId)
        return original ? { ...original, order: p.order } : p
      }),
    )
  }

  const totalCost = useMemo(
    () => places.reduce((sum, p) => sum + p.cost, 0),
    [places],
  )
  const totalWalk = useMemo(
    () => places.reduce((sum, p) => sum + p.walkMinutes, 0),
    [places],
  )

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28">
      {/* 실시간 날씨 요약 배지 (1시간 주기 자동 갱신) */}
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

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_minmax(0,42%)]">
        {/* 왼쪽: 추천 카드 리스트 */}
        <section aria-label="추천 장소 목록" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-bold text-foreground">
              네이버 지도 기반 최적 동선 코스
            </h2>
            <span className="text-xs text-muted-foreground">
              총 {places.length}곳 · 카드를 누르면 지도에 표시돼요
            </span>
          </div>
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              highlighted={activeId === place.id}
              canReplace={Boolean(
                ALTERNATIVE_PLACES[place.id] || place.id.endsWith('-alt'),
              )}
              onHover={setActiveId}
              onReplace={handleReplace}
            />
          ))}
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
                이동 {totalWalk}분
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
