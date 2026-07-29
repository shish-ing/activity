'use client'

import { AlertTriangle, Footprints, RefreshCw, Star, Tag } from 'lucide-react'
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
  return (
    <article
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(place.id)}
      onBlur={() => onHover(null)}
      className={cn(
        'rounded-2xl border bg-card p-4 transition-all',
        highlighted
          ? 'border-accent ring-2 ring-accent/40'
          : 'border-border hover:border-primary/40',
      )}
    >
      <div className="flex items-start gap-3">
        {/* 순서 번호 */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {place.order}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-serif text-base font-bold text-foreground">
              {place.name}
            </h3>
            {place.isMustVisit ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <Star className="size-3 fill-current" />꼭 가는 곳
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Tag className="size-3" />
              {place.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <Footprints className="size-3" />
              {place.walkMinutes === 0
                ? '현재 위치'
                : `도보 ${place.walkMinutes}분`}
            </span>
            <span
              className={cn(
                'font-medium',
                place.cost === 0 ? 'text-accent' : 'text-foreground',
              )}
            >
              {place.costLabel}
            </span>
          </div>

          {/* 추천 사유 */}
          <p className="mt-2 rounded-lg bg-secondary px-2.5 py-1.5 text-xs leading-relaxed text-secondary-foreground">
            {place.reason}
          </p>

          {/* 주의사항 경고 배지 */}
          {place.warning ? (
            <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-accent/15 px-2.5 py-1.5 text-xs font-medium text-foreground">
              <AlertTriangle className="size-3.5 shrink-0 text-accent" />
              {place.warning}
            </p>
          ) : null}
        </div>
      </div>

      {canReplace ? (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReplace(place.id)}
            className="text-muted-foreground"
          >
            <RefreshCw />
            다른 곳 추천
          </Button>
        </div>
      ) : null}
    </article>
  )
}
