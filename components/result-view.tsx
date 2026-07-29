'use client'

import { useEffect, useMemo, useState } from 'react'
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

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export function ResultView() {
  const [places, setPlaces] = useState<Place[]>(RECOMMENDED_PLACES)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [shared, setShared] = useState(false)
  const [weather, setWeather] = useState<Weather>(CURRENT_WEATHER)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<string>('')

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
              if (p.id === 'p1') {
                return {
                  ...p,
                  reason: '현재 위치에서 가까운 전주의 대표 역사 명소예요.',
                  warning: undefined,
                }
              }
              if (p.id === 'p2') {
                return {
                  ...p,
                  reason: '한옥 정취를 느끼며 여유롭게 쉬어가기 좋은 전통 찻집이에요.',
                }
              }
              if (p.id === 'p3') {
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
    // 시간당 1회 (3,600,000ms) 주기적 실시간 최신화
    const timer = setInterval(loadRealtimeWeather, 3600000)
    return () => clearInterval(timer)
  }, [])

  function handleReplace(id: string) {
    // TODO: API 연동 (백엔드에서 구현 예정) — 대체 장소 재추천
    setPlaces((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const alt = ALTERNATIVE_PLACES[p.id]
        if (alt) {
          // 원본 → 대체안
          return { ...alt, order: p.order }
        }
        // 대체안 → 원본으로 되돌리기 (id가 "xxx-alt" 형태)
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
              지금 이 순서로 추천해요
            </h2>
            <span className="text-xs text-muted-foreground">
              {places.length}곳 · 카드를 누르면 지도에 표시돼요
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
        <section aria-label="추천 경로 지도" className="lg:sticky lg:top-18 lg:h-[calc(100svh-8rem)]">
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
