'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LocateFixed, MapPin, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChipSelect } from '@/components/chip-select'
import { MustVisitSearch } from '@/components/must-visit-search'
import {
  BUDGET_OPTIONS,
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
  const [budget, setBudget] = useState<string | null>('3')
  const [companion, setCompanion] = useState<string | null>('couple')
  const [weatherOpt, setWeatherOpt] = useState<string | null>('auto')
  const [transport, setTransport] = useState<string | null>('walk')
  const [mustVisit, setMustVisit] = useState<string[]>(['전동성당'])
  const [loading, setLoading] = useState(false)

  function grantLocation() {
    // TODO: API 연동 (백엔드에서 구현 예정) — 실제 위치 권한 & 좌표 조회
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
    if (budget) params.set('budget', budget)
    if (companion) params.set('companion', companion)
    if (weatherOpt) params.set('weather', weatherOpt)
    if (transport) params.set('transport', transport)

    setTimeout(() => {
      router.push(`/result?${params.toString()}`)
    }, 1000)
  }

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
        <ChipSelect
          label="예산"
          options={BUDGET_OPTIONS}
          value={budget}
          onChange={setBudget}
        />
        <ChipSelect
          label="동행 유형"
          options={COMPANION_OPTIONS}
          value={companion}
          onChange={setCompanion}
          columns={3}
        />
        {/* 동행 유형과 이동수단 사이에 위치한 날씨 선택 옵션 (이모티콘 포함) */}
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
            <Loader2 className="animate-spin" />
            지금 딱 맞는 코스를 찾는 중…
          </>
        ) : (
          <>
            <Sparkles />
            지금 바로 추천받기
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        복잡한 설정 없이, 최소 입력으로 지금 바로 판단하세요
      </p>
    </div>
  )
}
