'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LocateFixed, MapPin, Sparkles, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChipSelect } from '@/components/chip-select'
import { MustVisitSearch } from '@/components/must-visit-search'
import {
  COMPANION_OPTIONS,
  MOCK_LOCATION,
  TIME_OPTIONS,
  TRANSPORT_OPTIONS,
  WEATHER_OPTIONS,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function ConditionForm() {
  const router = useRouter()

  const [locationGranted, setLocationGranted] = useState(false)
  const [time, setTime] = useState<string | null>('3h')
  const [budgetValue, setBudgetValue] = useState<number>(50000) // 0원 ~ 500,000원 슬라이더
  const [companion, setCompanion] = useState<string | null>('couple')
  const [weatherOpt, setWeatherOpt] = useState<string | null>('auto')
  const [transport, setTransport] = useState<string | null>('walk')
  const [mustVisit, setMustVisit] = useState<string[]>(['전동성당'])
  const [loading, setLoading] = useState(false)

  function grantLocation() {
    setLocationGranted(true)
  }

  function addMustVisit(name: string) {
    setMustVisit((prev) => (prev.includes(name) ? prev : [...prev, name]))
  }

  function removeMustVisit(name: string) {
    setMustVisit((prev) => prev.filter((n) => n !== name))
  }

  function handleSubmit() {
    setLoading(true)
    const params = new URLSearchParams()
    if (mustVisit.length > 0) {
      params.set('mustVisit', mustVisit.join(','))
    }
    if (time) params.set('time', time)
    params.set('budget', String(budgetValue))
    if (companion) params.set('companion', companion)
    if (weatherOpt) params.set('weather', weatherOpt)
    if (transport) params.set('transport', transport)

    setTimeout(() => {
      router.push(`/result?${params.toString()}`)
    }, 1000)
  }

  const budgetDisplayLabel = (() => {
    if (budgetValue === 0) return '0원 (100% 무료 명소 코스)'
    if (budgetValue >= 500000) return '50만원 이상 (넉넉한 럭셔리 여행)'
    return `${(budgetValue / 10000).toLocaleString('ko-KR')}만원`
  })()

  return (
    <div className="flex flex-col gap-4">
      {/* 위치 권한 */}
      <button
        type="button"
        onClick={grantLocation}
        aria-pressed={locationGranted}
        className={cn(
          'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          locationGranted
            ? 'border-accent/50 bg-accent/10'
            : 'border-dashed border-primary/40 bg-card hover:bg-secondary',
        )}
      >
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full',
            locationGranted
              ? 'bg-accent text-accent-foreground'
              : 'bg-primary/10 text-primary',
          )}
        >
          {locationGranted ? (
            <MapPin className="size-4.5" />
          ) : (
            <LocateFixed className="size-4.5" />
          )}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {locationGranted ? MOCK_LOCATION : '현재 위치 사용하기'}
          </span>
          <span className="text-xs text-muted-foreground">
            {locationGranted
              ? '이 위치를 기준으로 추천해 드릴게요'
              : '탭하면 내 주변을 기준으로 추천해요'}
          </span>
        </span>
      </button>

      {/* 조건 입력 카드 */}
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <ChipSelect
          label="남은 시간"
          options={TIME_OPTIONS}
          value={time}
          onChange={setTime}
        />

        {/* 예서 슬라이더 (막대바) 카드 UI */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-accent/30 bg-accent/5 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
              <Wallet className="size-4 text-accent" />
              <span>1인당 여행 예서 (슬라이더 막대바로 조정)</span>
            </div>
            <span className="text-sm font-bold text-accent bg-accent/15 px-2.5 py-0.5 rounded-lg">
              {budgetDisplayLabel}
            </span>
          </div>

          <div className="pt-1">
            <input
              type="range"
              min={0}
              max={500000}
              step={10000}
              value={budgetValue}
              onChange={(e) => setBudgetValue(Number(e.target.value))}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-accent focus:outline-none"
            />
          </div>

          {/* 주요 예서 프리셋 클릭 조절 칩 */}
          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 gap-1">
            <button
              type="button"
              onClick={() => setBudgetValue(0)}
              className={cn(
                'px-2 py-0.5 rounded-md transition-colors',
                budgetValue === 0 ? 'bg-accent text-accent-foreground font-bold' : 'hover:bg-secondary hover:text-foreground',
              )}
            >
              0원(무료)
            </button>
            <button
              type="button"
              onClick={() => setBudgetValue(30000)}
              className={cn(
                'px-2 py-0.5 rounded-md transition-colors',
                budgetValue === 30000 ? 'bg-accent text-accent-foreground font-bold' : 'hover:bg-secondary hover:text-foreground',
              )}
            >
              3만원
            </button>
            <button
              type="button"
              onClick={() => setBudgetValue(50000)}
              className={cn(
                'px-2 py-0.5 rounded-md transition-colors',
                budgetValue === 50000 ? 'bg-accent text-accent-foreground font-bold' : 'hover:bg-secondary hover:text-foreground',
              )}
            >
              5만원
            </button>
            <button
              type="button"
              onClick={() => setBudgetValue(100000)}
              className={cn(
                'px-2 py-0.5 rounded-md transition-colors',
                budgetValue === 100000 ? 'bg-accent text-accent-foreground font-bold' : 'hover:bg-secondary hover:text-foreground',
              )}
            >
              10만원
            </button>
            <button
              type="button"
              onClick={() => setBudgetValue(300000)}
              className={cn(
                'px-2 py-0.5 rounded-md transition-colors',
                budgetValue === 300000 ? 'bg-accent text-accent-foreground font-bold' : 'hover:bg-secondary hover:text-foreground',
              )}
            >
              30만원
            </button>
            <button
              type="button"
              onClick={() => setBudgetValue(500000)}
              className={cn(
                'px-2 py-0.5 rounded-md transition-colors',
                budgetValue >= 500000 ? 'bg-accent text-accent-foreground font-bold' : 'hover:bg-secondary hover:text-foreground',
              )}
            >
              50만원+
            </button>
          </div>
        </div>

        <ChipSelect
          label="동행 유형"
          options={COMPANION_OPTIONS}
          value={companion}
          onChange={setCompanion}
          columns={3}
        />
        <ChipSelect
          label="날씨 (실시간 연동 & 예보 직접 선택)"
          options={WEATHER_OPTIONS}
          value={weatherOpt}
          onChange={setWeatherOpt}
          columns={3}
        />
        <ChipSelect
          label="이동수단"
          options={TRANSPORT_OPTIONS}
          value={transport}
          onChange={setTransport}
        />
        <MustVisitSearch
          items={mustVisit}
          onAdd={addMustVisit}
          onRemove={removeMustVisit}
        />
      </div>

      {/* 추천받기 버튼 */}
      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={loading}
        className="h-13 w-full rounded-2xl text-base"
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            예산 및 맞춤 코스 계산 중...
          </>
        ) : (
          <>
            <Sparkles className="size-5" />
            맞춤 코스 추천받기
          </>
        )}
      </Button>
    </div>
  )
}
