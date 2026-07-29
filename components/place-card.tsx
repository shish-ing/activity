'use client'

import { useState } from 'react'
import {
  AlertTriangle,
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
  onHover: (id: string | null) => void
  onReplace: (id: string) => void
}

export function PlaceCard({
  place,
  highlighted,
  canReplace,
  onHover,
  onReplace,
}: PlaceCardProps) {
  const [expanded, setExpanded] = useState(false)

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
                {place.suggestedDuration}
              </span>
            ) : null}
          </div>

          {/* 메인 정보 줄 */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Tag className="size-3 text-muted-foreground" />
              {place.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <Footprints className="size-3 text-muted-foreground" />
              {place.walkMinutes === 0
                ? '현재 위치'
                : `도보 ${place.walkMinutes}분`}
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

          {/* 추천 사유 */}
          <p className="mt-2 rounded-xl bg-secondary/80 px-3 py-2 text-xs leading-relaxed text-secondary-foreground">
            {place.reason}
          </p>

          {/* 현지인 팁 (팁 정보가 있을 때) */}
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

              {place.naverMapUrl ? (
                <div className="pt-1">
                  <a
                    href={place.naverMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-emerald-600/25"
                  >
                    <ExternalLink className="size-3.5" />
                    네이버 지도에서 보기 / 길찾기
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
