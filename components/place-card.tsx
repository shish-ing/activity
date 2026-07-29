'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Bus,
  Car,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Footprints,
  Info,
  MapPin,
  Phone,
  RefreshCw,
  Star,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Place } from '@/lib/mock-data'

type PlaceCardProps = {
  place: Place
  highlighted: boolean
  canReplace: boolean
  transport?: string // 'walk' | 'transit' | 'car'
  onHover: (id: string | null) => void
  onReplace: (id: string) => void
}

export function PlaceCard({
  place,
  highlighted,
  canReplace,
  transport = 'walk',
  onHover,
  onReplace,
}: PlaceCardProps) {
  const [expanded, setExpanded] = useState(false)

  // 이동수단별 지능적 거리 및 소요시간 계산 (가까운 거리는 도보 추천)
  const mins = place.walkMinutes || 0
  const isNearby = mins > 0 && mins <= 7 // 약 500m 이내 인접한 거리

  const moveInfo = (() => {
    if (mins === 0) return { icon: Footprints, text: '현재 위치' }

    if (transport === 'car') {
      if (isNearby) {
        const walkM = mins * 70
        const distText = walkM >= 1000 ? `${(walkM / 1000).toFixed(1)}km` : `${walkM}m`
        return {
          icon: Footprints,
          text: `도보 ${distText} · 약 ${mins}분 (기존 주차장에 차 두고 걸어가기 권장)`,
        }
      }
      const driveMins = Math.max(2, Math.round(mins * 0.5))
      const distance = (mins * 0.15 + 0.5).toFixed(1)
      return {
        icon: Car,
        text: `차로 ${distance}km · 약 ${driveMins}분 소요`,
      }
    }

    if (transport === 'transit') {
      if (isNearby) {
        const walkM = mins * 70
        const distText = walkM >= 1000 ? `${(walkM / 1000).toFixed(1)}km` : `${walkM}m`
        return {
          icon: Footprints,
          text: `도보 ${distText} · 약 ${mins}분 (가까워서 도보 권장)`,
        }
      }
      const transitMins = Math.max(5, Math.round(mins * 1.1 + 3))
      const distance = (mins * 0.18 + 0.8).toFixed(1)
      return {
        icon: Bus,
        text: `대중교통 ${distance}km · 약 ${transitMins}분 소요`,
      }
    }

    // 기본 도보
    const walkM = mins * 70
    const distText = walkM >= 1000 ? `${(walkM / 1000).toFixed(1)}km` : `${walkM}m`
    return {
      icon: Footprints,
      text: `도보 ${distText} · 약 ${mins}분 소요`,
    }
  })()

  const MoveIcon = moveInfo.icon

  return (
    <article
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(place.id)}
      onBlur={() => onHover(null)}
      className={cn(
        'rounded-2xl border bg-card p-4 transition-all shadow-xs',
        highlighted
          ? 'border-accent ring-2 ring-accent/40 bg-accent/5'
          : 'border-border hover:border-primary/40',
      )}
    >
      <div className="flex items-start gap-3">
        {/* 순서 번호 */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
          {place.order}
        </span>

        <div className="min-w-0 flex-1">
          {/* 타이틀 및 별도 태그 */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-foreground">
                {place.name}
              </h3>
              {place.isMustVisit ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <Star className="size-3 fill-current" />꼭 가는 곳
                </span>
              ) : null}
            </div>

            {place.suggestedDuration ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                <Clock className="size-3 text-accent" />
                권장 {place.suggestedDuration}
              </span>
            ) : null}
          </div>

          {/* 메인 정보 줄 (카테고리, 거리/이동시간, 비용) */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Tag className="size-3 text-muted-foreground" />
              {place.category}
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-accent">
              <MoveIcon className="size-3 text-accent" />
              {moveInfo.text}
            </span>
            <span
              className={cn(
                'font-semibold',
                place.cost === 0 ? 'text-accent' : 'text-foreground',
              )}
            >
              {place.costLabel}
            </span>
          </div>

          {/* --- [자차 모드 분기] --- */}
          {transport === 'car' ? (
            isNearby ? (
              <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-foreground">
                <div className="flex items-start gap-1.5">
                  <Footprints className="size-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-400">🚗 주차 꿀팁 (도보 이동 추천):</span>{' '}
                    <span>
                      이전 장소와 가까운 거리에 위치해 있습니다. 차를 새로 출차해 이동하고 재주차하는 것보다 기존 주차장에 차를 세워두고 골목 산책으로 걸어가시는 것이 훨씬 편합니다 (도보 약 {mins}분).
                    </span>
                    {place.parkingInfo ? (
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        ※ 목적지 전용 주차 안내: {place.parkingInfo}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : place.parkingInfo ? (
              <div className="mt-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-foreground">
                <div className="flex items-start gap-1.5">
                  <Car className="size-4 shrink-0 text-blue-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-400">🚗 자차 차로 이동 & 주차 안내:</span>{' '}
                    <span>{place.parkingInfo}</span>
                  </div>
                </div>
              </div>
            ) : null
          ) : null}

          {/* --- [대중교통 모드 분기] --- */}
          {transport === 'transit' ? (
            isNearby ? (
              <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-foreground">
                <div className="flex items-start gap-1.5">
                  <Footprints className="size-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-400">🚌 대중교통 꿀팁 (도보 이동 추천):</span>{' '}
                    <span>
                      인접한 인근 거리입니다 (도보 약 {mins}분). 버스를 기다리고 승하차하는 시간보다 천천히 걸어가시는 것이 훨씬 빠르고 편리합니다.
                    </span>
                    {place.transitInfo ? (
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        ※ 장거리 이동 시 시내버스 참고: {place.transitInfo}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : place.transitInfo ? (
              <div className="mt-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-foreground">
                <div className="flex items-start gap-1.5">
                  <Bus className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-400">🚌 시내버스 길안내:</span>{' '}
                    <span>{place.transitInfo}</span>
                  </div>
                </div>
              </div>
            ) : null
          ) : null}

          {/* 추천 사유 */}
          <p className="mt-2 rounded-xl bg-secondary/80 px-3 py-2 text-xs leading-relaxed text-secondary-foreground">
            {place.reason}
          </p>

          {/* 현지인 팁 */}
          {place.tips ? (
            <p className="mt-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-foreground font-normal">
              {place.tips}
            </p>
          ) : null}

          {/* 주의사항 경고 배지 */}
          {place.warning ? (
            <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-foreground border border-destructive/20">
              <AlertTriangle className="size-3.5 shrink-0 text-destructive" />
              {place.warning}
            </p>
          ) : null}

          {/* 태그 리스트 */}
          {place.tags && place.tags.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {/* 상세 정보 토글 영역 */}
          {expanded ? (
            <div className="mt-3 space-y-2 border-t border-border/60 pt-3 text-xs">
              {place.address ? (
                <div className="flex items-start gap-2 text-foreground">
                  <MapPin className="size-3.5 shrink-0 text-accent mt-0.5" />
                  <span>주소: {place.address}</span>
                </div>
              ) : null}

              {place.operatingHours ? (
                <div className="flex items-start gap-2 text-foreground">
                  <Clock className="size-3.5 shrink-0 text-accent mt-0.5" />
                  <span>운영시간: {place.operatingHours}</span>
                </div>
              ) : null}

              {place.phone ? (
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="size-3.5 shrink-0 text-accent" />
                  <span>전화문의: {place.phone}</span>
                </div>
              ) : null}

              {place.parkingInfo ? (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Car className="size-3.5 shrink-0 text-blue-400 mt-0.5" />
                  <span>주차장 팁: {place.parkingInfo}</span>
                </div>
              ) : null}

              {place.transitInfo ? (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Bus className="size-3.5 shrink-0 text-emerald-400 mt-0.5" />
                  <span>시내버스: {place.transitInfo}</span>
                </div>
              ) : null}

              {place.naverMapUrl ? (
                <div className="pt-1">
                  <a
                    href={place.naverMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-emerald-600/25"
                  >
                    <ExternalLink className="size-3.5" />
                    네이버 지도로 보기 / 길찾기
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* 하단 버튼 바 */}
      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Info className="size-3.5" />
          {expanded ? '상세 정보 접기' : '상세 정보 더보기'}
          {expanded ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </button>

        {canReplace ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReplace(place.id)}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3" />
            다른 곳 추천
          </Button>
        ) : null}
      </div>
    </article>
  )
}
