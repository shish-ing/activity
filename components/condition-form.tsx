'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Bus, Check, Loader2, LocateFixed, MapPin, Search, Sparkles, Wallet } from 'lucide-react'
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

// 네이버 지도 연동 전주 대표 주요 출발지 & 주소 데이터베이스
const NAVER_MAP_START_ADDRESSES = [
  { name: '전주 한옥마을 (전동성당)', address: '전북 전주시 완산구 태조로 51', type: '한옥마을 중심' },
  { name: '전주역 (KTX/SRT)', address: '전북 전주시 덕진구 동부대로 680', type: '기차역' },
  { name: '전주고속버스터미널', address: '전북 전주시 덕진구 가련산로 5', type: '터미널' },
  { name: '전주시외버스터미널', address: '전북 전주시 덕진구 가련산로 19', type: '터미널' },
  { name: '전북대학교 전주캠퍼스', address: '전북 전주시 덕진구 백제대로 567', type: '대학교' },
  { name: '전주 객사 (객리단길)', address: '전북 전주시 완산구 전주객사4길 19', type: '시내 중심' },
  { name: '전주 팔복예술공장', address: '전북 전주시 덕진구 구렛들1길 46', type: '문화공간' },
  { name: '전주 덕진공원 연화정', address: '전북 전주시 덕진구 권삼득로 390', type: '공원' },
  { name: '한국도로공사 전주 수목원', address: '전북 전주시 덕진구 번영로 462-45', type: '수목원' },
  { name: '전주 아중호수', address: '전북 전주시 덕진구 아중호수길 130', type: '호수' },
  { name: '서학동 예술마을', address: '전북 전주시 완산구 서학로 16-1', type: '예술마을' },
]

export function ConditionForm() {
  const router = useRouter()

  const [startInput, setStartInput] = useState<string>('전주 한옥마을 (전동성당)')
  const [selectedAddress, setSelectedAddress] = useState<string>('전북 전주시 완산구 태조로 51')
  const [isGpsLoading, setIsGpsLoading] = useState(false)
  const [isFallbackToHanok, setIsFallbackToHanok] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [time, setTime] = useState<string | null>('3h')
  const [budgetValue, setBudgetValue] = useState<number>(50000) // 0원 ~ 500,000원 슬라이더
  const [companion, setCompanion] = useState<string | null>('couple')
  const [weatherOpt, setWeatherOpt] = useState<string | null>('auto')
  const [transport, setTransport] = useState<string | null>('walk')
  const [mustVisit, setMustVisit] = useState<string[]>(['전동성당'])
  const [loading, setLoading] = useState(false)

  // 주소 입력 실시간 자동완성 매칭
  const filteredSuggestions = NAVER_MAP_START_ADDRESSES.filter(
    (item) =>
      item.name.toLowerCase().includes(startInput.toLowerCase()) ||
      item.address.toLowerCase().includes(startInput.toLowerCase()) ||
      item.type.toLowerCase().includes(startInput.toLowerCase()),
  )

  function handleGetRealGpsLocation() {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsGpsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGpsLoading(false)
          setIsFallbackToHanok(false)
          const { latitude, longitude } = pos.coords
          const gpsText = `🎯 실시간 GPS (위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)})`
          setStartInput(gpsText)
          setSelectedAddress(`실시간 GPS 좌표 (위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)})`)
          setShowSuggestions(false)
        },
        (err) => {
          setIsGpsLoading(false)
          setIsFallbackToHanok(true)
          setStartInput('전주 한옥마을 (기본 출발지)')
          setSelectedAddress('전북 전주시 완산구 태조로 51 (한옥마을 중심)')
          setShowSuggestions(false)
        },
        { enableHighAccuracy: true, timeout: 5000 },
      )
    } else {
      setIsFallbackToHanok(true)
      setStartInput('전주 한옥마을 (기본 출발지)')
      setSelectedAddress('전북 전주시 완산구 태조로 51 (한옥마을 중심)')
      setShowSuggestions(false)
    }
  }

  function handleSelectSuggestion(item: typeof NAVER_MAP_START_ADDRESSES[0]) {
    setStartInput(`${item.name} (${item.address})`)
    setSelectedAddress(item.address)
    setIsFallbackToHanok(item.name.includes('한옥마을'))
    setShowSuggestions(false)
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
    if (startInput) params.set('startLocation', startInput)
    if (selectedAddress) params.set('startAddress', selectedAddress)
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
      {/* 네이버 지도 연동 출발지 주소 검색 & 실시간 GPS 카드 */}
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-card p-4 sm:p-5 shadow-xs relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
            <MapPin className="size-4.5 text-primary" />
            <span>🗺️ 네이버 지도 연동 출발지 / 주소 검색</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetRealGpsLocation}
            disabled={isGpsLoading}
            className="h-8 text-xs gap-1.5 text-primary border-primary/40 bg-primary/10 hover:bg-primary/20 rounded-xl"
          >
            <LocateFixed className={cn('size-3.5', isGpsLoading && 'animate-spin')} />
            {isGpsLoading ? 'GPS 위치 조회 중...' : '🎯 실시간 내 GPS 위치 찾기'}
          </Button>
        </div>

        {/* 직접 출발지/주소 검색 입력창 */}
        <div className="relative">
          <div className="flex items-center rounded-xl border border-border bg-secondary/60 px-3.5 py-2 text-sm text-foreground focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
            <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              value={startInput}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setStartInput(e.target.value)
                setSelectedAddress(e.target.value)
                setIsFallbackToHanok(e.target.value.includes('한옥마을'))
                setShowSuggestions(true)
              }}
              placeholder="출발하고 싶은 장소명이나 도로명 주소를 입력하세요 (예: 전주역, 가련산로, 태조로)"
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* 네이버 지도 자동완성 주소 드롭다운 */}
          {showSuggestions && filteredSuggestions.length > 0 ? (
            <div className="absolute inset-x-0 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg backdrop-blur">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-emerald-400 border-b border-border/50">
                🗺️ 네이버 지도 추천 전주 출발 주소
              </div>
              {filteredSuggestions.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="flex w-full flex-col text-left px-3 py-2 text-xs hover:bg-accent/10 rounded-lg transition-colors border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>{item.name}</span>
                    <span className="text-[10px] text-accent font-medium">{item.type}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{item.address}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* 선택한 출발 주소 서브 디스플레이 */}
        {selectedAddress ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Check className="size-3.5 shrink-0" />
            <span>선택된 출발 주소: <strong>{selectedAddress}</strong> (1번 장소까지 시내버스/길안내 연동)</span>
          </div>
        ) : null}

        {/* 위치 조회 미작동 시 한옥마을 기본값 명확 안내 */}
        {isFallbackToHanok ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-300">
            <AlertCircle className="size-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">📌 출발지 기본 기준 안내:</span>{' '}
              <span>
                실시간 위치 권한이 미승인되었거나 조회가 어려운 환경인 경우, 전주 대표 중심지인 <strong>'전주 한옥마을 (전동성당)'을 기본 출발지 기준</strong>으로 추천해 드립니다 (원하시는 출발 주소가 있다면 위 입력창에 입력해 주세요).
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* 조건 입력 카드 */}
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <ChipSelect
          label="남은 시간"
          options={TIME_OPTIONS}
          value={time}
          onChange={setTime}
        />

        {/* 예산 슬라이더 (막대바) 카드 UI */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-accent/30 bg-accent/5 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
              <Wallet className="size-4 text-accent" />
              <span>1인당 여행 예산 (막대바로 조정)</span>
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

          {/* 주요 예산 프리셋 클릭 조절 칩 */}
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
            출발 주소 및 1번 장소 버스 노선 계산 중...
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
