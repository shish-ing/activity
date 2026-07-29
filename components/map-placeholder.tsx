'use client'

import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Place } from '@/lib/mock-data'

type MapPlaceholderProps = {
  places: Place[]
  activeId: string | null
  onHover: (id: string | null) => void
}

export function MapPlaceholder({
  places,
  activeId,
  onHover,
}: MapPlaceholderProps) {
  return (
    <div className="relative h-full min-h-72 w-full overflow-hidden rounded-2xl border border-border bg-secondary">
      {/* 지도 배경 (정적 이미지 플레이스홀더) */}
      {/* TODO: API 연동 (백엔드/프론트에서 실제 네이버 지도 SDK로 교체 예정) */}
      <Image
        src="/jeonju-map.png"
        alt="전주 한옥마을 일대 지도 (미리보기용 플레이스홀더)"
        fill
        className="object-cover opacity-90"
        sizes="(max-width: 768px) 100vw, 40vw"
        priority
      />

      {/* 경로 연결선 */}
      <svg
        className="absolute inset-0 h-full w-full"
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={places.map((p) => `${p.mapX},${p.mapY}`).join(' ')}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="0.6"
          strokeDasharray="2 1.6"
          strokeLinecap="round"
          opacity="0.55"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* 순서 핀 마커 */}
      {places.map((place) => {
        const active = activeId === place.id
        return (
          <button
            key={place.id}
            type="button"
            onMouseEnter={() => onHover(place.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(place.id)}
            onBlur={() => onHover(null)}
            aria-label={`${place.order}번 ${place.name}`}
            style={{ left: `${place.mapX}%`, top: `${place.mapY}%` }}
            className="absolute -translate-x-1/2 -translate-y-full outline-none"
          >
            <span
              className={cn(
                'relative flex flex-col items-center transition-transform',
                active ? 'z-10 scale-110' : 'z-0',
              )}
            >
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border-2 border-background text-xs font-bold shadow-md transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-primary text-primary-foreground',
                )}
              >
                {place.order}
              </span>
              <MapPin
                className={cn(
                  '-mt-1 size-3.5 drop-shadow',
                  active ? 'text-accent' : 'text-primary',
                )}
                fill="currentColor"
              />
              {active ? (
                <span className="absolute top-full mt-0.5 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-background">
                  {place.name}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}

      {/* 플레이스홀더 안내 배지 */}
      <span className="absolute bottom-2 left-2 rounded-md bg-background/85 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur">
        지도 미리보기 · 실제 지도 연동 예정
      </span>
    </div>
  )
}
