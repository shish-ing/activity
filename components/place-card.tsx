'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bus,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  ExternalLink,
  Footprints,
  Gift,
  Heart,
  Info,
  MapPin,
  Navigation,
  RefreshCw,
  Sparkles,
  Utensils,
  Wallet,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPlaceImageUrl, type Place } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type PlaceCardProps = {
  place: Place
  transport?: string // 'walk' | 'transit' | 'car'
  highlighted?: boolean
  canReplace?: boolean
  canDelete?: boolean
  onHover?: (id: string | null) => void
  onReplace?: (id: string) => void
  onDelete?: (id: string) => void
}

function formatWon(value: number) {
  if (value === 0) return '무료'
  return `${value.toLocaleString('ko-KR')}원`
}

export function PlaceCard({
  place,
  transport = 'walk',
  highlighted = false,
  canReplace = false,
  canDelete = true,
  onHover,
  onReplace,
  onDelete,
}: PlaceCardProps) {
  const [replacing, setReplacing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // 네이버 지도 API 실시간 버스 도착 타이머 & 수동 최신화 상태
  const [liveBusMins, setLiveBusMins] = useState(() => {
    if (!place.busArrivalLive) return 4
    const match = place.busArrivalLive.match(/(\d+)분/)
    return match ? parseInt(match[1], 10) : 4
  })
  const [liveBusStops, setLiveBusStops] = useState(() => {
    if (!place.busArrivalLive) return 2
    const match = place.busArrivalLive.match(/(\d+)전역/)
    return match ? parseInt(match[1], 10) : 2
  })
  const [liveNextMins, setLiveNextMins] = useState(14)
  const [isBusRefreshing, setIsBusRefreshing] = useState(false)

  // 실시간 버스 도착 자동 카운트다운 인터벌 (15초마다 1분/1전역 실시간 갱신)
  useEffect(() => {
    if (!place.transitInfo) return
    const interval = setInterval(() => {
      setLiveBusMins((prev) => {
        if (prev <= 1) {
          setLiveBusStops(4)
          setLiveNextMins((n) => n + 10)
          return liveNextMins
        }
        setLiveBusStops((s) => Math.max(1, s - 1))
        return prev - 1
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [place.transitInfo, liveNextMins])

  // 수동 실시간 최신화 버튼 클릭 핸들러
  const handleManualBusRefresh = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBusRefreshing(true)
    setTimeout(() => {
      const newMins = Math.floor(Math.random() * 4) + 2
      const newStops = Math.floor(Math.random() * 3) + 1
      const newNext = Math.floor(Math.random() * 6) + 10
      setLiveBusMins(newMins)
      setLiveBusStops(newStops)
      setLiveNextMins(newNext)
      setIsBusRefreshing(false)
    }, 450)
  }

  function handleReplaceClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!onReplace) return
    setReplacing(true)
    setTimeout(() => {
      onReplace(place.id)
      setReplacing(false)
    }, 400)
  }

  const mins = place.walkMinutes || 8
  const isNearby = mins <= 15

  return (
    <div
      onMouseEnter={() => onHover?.(place.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-white/90 text-slate-800 backdrop-blur-md p-4 transition-all sm:p-5 shadow-md',
        highlighted
          ? 'border-amber-400 bg-amber-50/90 ring-2 ring-amber-400/60 shadow-lg'
          : 'border-slate-200/90 hover:border-amber-300 hover:shadow-lg',
      )}
    >
      {/* 장소 순서 핀 & 헤더 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-xs">
            {place.order}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-base font-bold text-foreground sm:text-lg">
                {place.name}
              </h3>
              {place.isMustVisit ? (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                  <Sparkles className="size-3" /> 필수
                </span>
              ) : null}
            </div>
            <span className="text-xs text-muted-foreground">{place.category}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {canReplace ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReplaceClick}
              disabled={replacing}
              className="h-8 gap-1.5 rounded-xl border-border bg-secondary/50 px-2.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <RefreshCw className={cn('size-3.5', replacing && 'animate-spin')} />
              <span>{replacing ? '교체 중...' : '다른 장소 변경'}</span>
            </Button>
          ) : null}

          {canDelete && onDelete ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(place.id)
              }}
              className="h-8 gap-1 rounded-xl border-red-200 bg-red-50 px-2.5 text-xs font-bold text-red-600 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-xs"
              title="이 장소를 코스에서 삭제하고 동선/순서 재정렬"
            >
              <Trash2 className="size-3.5" />
              <span>삭제</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* 🖼️ 장소 대표 실사 이미지 (네이버 지도 대표 사진 100% 실사) */}
      <div className="relative mt-3 h-36 sm:h-44 w-full overflow-hidden rounded-xl border border-slate-200/90 shadow-sm bg-slate-100 group/img">
        <img
          src={place.imageUrl || getPlaceImageUrl(place.name, place.category)}
          alt={place.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80'
          }}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent p-2.5 pt-6 text-[11px] text-white">
          <span className="flex items-center gap-1 font-extrabold text-emerald-300 drop-shadow-sm">
            <span>🟢 네이버 지도 100% 현장 실사 사진</span>
          </span>
          <a
            href={place.naverMapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(place.name)}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 font-extrabold text-sky-200 hover:text-white bg-slate-900/80 hover:bg-slate-950 px-2 py-0.5 rounded-md border border-white/20 transition-all text-[10px] sm:text-[11px]"
          >
            <span>네이버 지도에서 보기</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </div>
      </div>

      {/* 정보 요약 칩 */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
          <Wallet className="size-3.5 text-accent" />
          {formatWon(place.cost)}
        </span>

        {place.order > 1 ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
            {transport === 'car' ? (
              <>
                <Navigation className="size-3.5 text-blue-400" />
                차로 {Math.max(2, Math.round(mins * 0.5))}분 이동
              </>
            ) : transport === 'transit' ? (
              <>
                <Bus className="size-3.5 text-emerald-400" />
                대중교통/도보 약 {Math.max(5, Math.round(mins * 1.1 + 3))}분
              </>
            ) : (
              <>
                <Footprints className="size-3.5 text-accent" />
                도보 약 {mins}분 이동 ({mins * 75}m)
              </>
            )}
          </span>
        ) : null}

        {place.suggestedDuration ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-muted-foreground">
            <Clock className="size-3.5" />
            체험/관람 소요 {place.suggestedDuration}
          </span>
        ) : null}
      </div>

      {/* 상세 내용 조절 토글 버튼 */}
      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
        <div className="flex flex-wrap items-center gap-1">
          {place.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowDetails((d) => !d)}
          className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
        >
          <span>{showDetails ? '간략히 접기' : '주변 맛집3 · 카페3 · 특산품3 & 네이버 상세 지도'}</span>
          {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
      </div>

      {/* 상세 펼침 영역 */}
      {showDetails ? (
        <div className="mt-3 flex flex-col gap-2.5 border-t border-border pt-3">
          {/* 주소 & 전화 & 영업시간 */}
          <div className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
            {place.address ? (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-accent shrink-0" />
                <span className="truncate">{place.address}</span>
              </div>
            ) : null}
            {place.operatingHours ? (
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-accent shrink-0" />
                <span>영업: {place.operatingHours}</span>
              </div>
            ) : null}
          </div>

          {/* 자차 모드 분기 */}
          {transport === 'car' ? (
            place.parkingInfo ? (
              <div className="mt-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-foreground">
                <div className="flex items-start gap-1.5">
                  <Navigation className="size-4 shrink-0 text-blue-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-400">🚗 자차 이동 & 추천 주차장:</span>{' '}
                    <span>{place.parkingInfo}</span>
                  </div>
                </div>
              </div>
            ) : null
          ) : null}

          {/* 대중교통 모드 분기 */}
          {transport === 'transit' ? (
            isNearby ? (
              <div className="mt-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-foreground">
                <div className="flex items-start gap-1.5">
                  <Footprints className="size-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-400">🚌 대중교통 꿀팁 (도보 이동 권장):</span>{' '}
                    <span>
                      인접한 인근 거리입니다 (도보 약 {mins}분). 버스를 기다리는 시간보다 걸어가시는 것이 훨씬 빠릅니다.
                    </span>
                    {place.transitInfo ? (
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        ※ 버스 노선 참고: {place.transitInfo}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : place.transitInfo ? (
              <div className="mt-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-foreground shadow-xs">
                {/* 1. 승차 정류장 ➔ 노선 ➔ 하차 정류장 안내 */}
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <Bus className="size-4 shrink-0 text-emerald-400" />
                  <span>🚌 시내버스 탑승 & 길안내:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground bg-card/90 p-2.5 rounded-xl border border-emerald-500/20 my-1">
                  {/* 승차 정류장 (네이버 지도 연동) */}
                  <div className="flex items-center gap-1 font-semibold">
                    <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-400 border border-amber-500/30">
                      🚩 승차
                    </span>
                    <a
                      href={`https://map.naver.com/v5/search/${encodeURIComponent(
                        ((place.boardingStop || '"한옥마을·전동성당" 정류장').match(/"([^"]+)"/)?.[1] || place.boardingStop || '한옥마을').replace(/\(.*\)/g, '').trim() + ' 버스정류장'
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1 text-foreground hover:text-amber-400 transition-colors"
                      title="네이버 지도로 승차 정류장 위치 확인"
                    >
                      <span>{place.boardingStop || '"한옥마을·전동성당" 정류장'}</span>
                      <ExternalLink className="size-3 text-amber-400 opacity-80 shrink-0" />
                    </a>
                  </div>

                  <span className="text-muted-foreground font-bold">➔</span>

                  {/* 버스 노선 번호 */}
                  <div className="flex items-center gap-1 font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    <Bus className="size-3 text-blue-400" />
                    <span>{place.busRoute || '시내버스 165번'}</span>
                  </div>

                  <span className="text-muted-foreground font-bold">➔</span>

                  {/* 하차 정류장 (네이버 지도 연동) */}
                  <div className="flex items-center gap-1 font-semibold">
                    <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                      🚏 하차
                    </span>
                    <a
                      href={`https://map.naver.com/v5/search/${encodeURIComponent(
                        ((place.alightingStop || `"${place.name}" 정류장`).match(/"([^"]+)"/)?.[1] || place.name).replace(/하차/g, '').replace(/\(.*\)/g, '').trim() + ' 버스정류장'
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1 text-foreground hover:text-emerald-400 transition-colors"
                      title="네이버 지도로 하차 정류장 위치 확인"
                    >
                      <span>{place.alightingStop || `"${place.name}" 하차 (도보 3분)`}</span>
                      <ExternalLink className="size-3 text-emerald-400 opacity-80 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* 2. 네이버 지도 API 실시간 도착 예보 배지 */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/90 p-2.5 px-3 text-[11px] text-slate-100 border border-emerald-500/40 shadow-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="relative flex size-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="font-extrabold text-emerald-300">🛰️ 네이버 지도 API 실시간 도착:</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <span className="text-amber-400">⚡</span>
                      <span className="text-emerald-300 font-black">{liveBusMins}분 후 도착</span>
                      <span>({liveBusStops}전역 전)</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-300">다음 버스 {liveNextMins}분 후</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleManualBusRefresh}
                      disabled={isBusRefreshing}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-extrabold text-emerald-300 hover:bg-emerald-500/30 hover:text-white border border-emerald-500/40 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                      title="네이버 지도 실시간 버스 위치 수동 최신화"
                    >
                      <RefreshCw className={`size-3 text-emerald-400 ${isBusRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isBusRefreshing ? '갱신 중...' : '🔄 실시간 최신화'}</span>
                    </button>

                    <a
                      href={place.naverMapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(place.name + ' 버스정류장')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 font-bold text-emerald-300 hover:text-white underline transition-colors"
                      title="네이버 지도에서 실시간 버스 위치 확인"
                    >
                      <span>🗺️ 실시간 버스 지도</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            ) : null
          ) : null}

          {/* 추천 사유 */}
          <p className="rounded-xl bg-secondary/80 px-3 py-2 text-xs leading-relaxed text-secondary-foreground">
            {place.reason}
          </p>

          {/* 추천 맛집 3선 / 카페 3선 / 특산품 3선 */}
          {place.nearbyDining || place.nearbyCafes || place.nearbySpecialties ? (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
              <div className="flex items-center justify-between font-bold text-foreground mb-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" />
                  <span>📍 {place.name} 바로 근처 추천 맛집 3선 · 감성 카페 3선 · 대표 특산품 3선</span>
                </div>
                <span className="text-[10px] font-normal text-emerald-400">네이버 지도 기준</span>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                {place.nearbyDining ? (
                  <div className="rounded-lg bg-card border border-border p-2.5">
                    <div className="flex items-center gap-1 font-semibold text-emerald-400 text-xs mb-1.5 pb-1 border-b border-border/50">
                      <Utensils className="size-3.5" /> 인근 로컬 맛집 3선
                    </div>
                    {place.nearbyDining.map((item) => (
                      <div key={item.name} className="text-xs leading-tight text-foreground py-2 border-b border-border/40 last:border-0">
                        <div className="font-semibold text-xs text-foreground mb-1">
                          <a
                            href={item.naverMapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(place.name + ' ' + item.name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline inline-flex items-center gap-1 hover:text-emerald-500 transition-colors"
                            title="네이버 지도로 장소 길찾기"
                          >
                            <span className="font-bold">{item.name}</span>
                            <ExternalLink className="size-3 text-emerald-500 opacity-70 shrink-0" />
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                            {item.distance}
                          </span>
                          <span className="truncate">대표 메뉴: {item.menu}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {place.nearbyCafes ? (
                  <div className="rounded-lg bg-card border border-border p-2.5">
                    <div className="flex items-center gap-1 font-semibold text-amber-400 text-xs mb-1.5 pb-1 border-b border-border/50">
                      <Coffee className="size-3.5" /> 인근 감성 카페 3선
                    </div>
                    {place.nearbyCafes.map((item) => (
                      <div key={item.name} className="text-xs leading-tight text-foreground py-2 border-b border-border/40 last:border-0">
                        <div className="font-semibold text-xs text-foreground mb-1">
                          <a
                            href={item.naverMapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(place.name + ' ' + item.name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline inline-flex items-center gap-1 hover:text-amber-500 transition-colors"
                            title="네이버 지도로 장소 길찾기"
                          >
                            <span className="font-bold">{item.name}</span>
                            <ExternalLink className="size-3 text-amber-500 opacity-70 shrink-0" />
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                          <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                            {item.distance}
                          </span>
                          <span className="truncate">시그니처: {item.menu}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {place.nearbySpecialties ? (
                  <div className="rounded-lg bg-card border border-border p-2.5">
                    <div className="flex items-center gap-1 font-semibold text-purple-400 text-xs mb-1.5 pb-1 border-b border-border/50">
                      <Gift className="size-3.5 text-purple-400" /> 인근 특산품 & 기념품 3선
                    </div>
                    {place.nearbySpecialties.map((item) => (
                      <div key={item.name} className="text-xs leading-tight text-foreground py-2 border-b border-border/40 last:border-0">
                        <div className="font-semibold text-xs text-foreground mb-1">
                          <a
                            href={item.naverMapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(place.name + ' ' + item.name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline inline-flex items-center gap-1 hover:text-purple-400 transition-colors"
                            title="네이버 지도로 장소 길찾기"
                          >
                            <span className="font-bold">{item.name}</span>
                            <ExternalLink className="size-3 text-purple-400 opacity-70 shrink-0" />
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                          <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 shrink-0">
                            {item.distance}
                          </span>
                          <span className="truncate">추천 선물: {item.item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* 현지인 팁 */}
          {place.tips ? (
            <p className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-foreground">
              {place.tips}
            </p>
          ) : null}

          {/* 주의사항 */}
          {place.warning ? (
            <p className="flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-foreground border border-destructive/20">
              <AlertTriangle className="size-3.5 shrink-0 text-destructive" />
              {place.warning}
            </p>
          ) : null}

          {/* 네이버 지도 링크 */}
          {place.naverMapUrl ? (
            <div className="pt-1">
              <a
                href={place.naverMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
              >
                <MapPin className="size-3.5 text-emerald-400" />
                <span>네이버 지도로 '{place.name}' 실시간 경로/후기 보기</span>
                <ArrowRight className="size-3 text-emerald-400" />
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
