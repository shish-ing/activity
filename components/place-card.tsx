'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bus,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Place } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type PlaceCardProps = {
  place: Place
  transport?: string // 'walk' | 'transit' | 'car'
  highlighted?: boolean
  canReplace?: boolean
  onHover?: (id: string | null) => void
  onReplace?: (id: string) => void
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
  onHover,
  onReplace,
}: PlaceCardProps) {
  const [replacing, setReplacing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

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
      {/* 장소 순서 핀 & 태그 Header */}
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

        <div className="flex items-center gap-2">
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
          className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
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
              <div className="mt-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-foreground">
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
          <p className="rounded-xl bg-secondary/80 px-3 py-2 text-xs leading-relaxed text-secondary-foreground">
            {place.reason}
          </p>

          {/* 장소 바로 근처 추천 맛집 3곳, 카페 3곳, 특산품 3곳 서브 큐레이션 */}
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
                      <div key={item.name} className="text-xs leading-tight text-foreground py-1.5 border-b border-border/40 last:border-0">
                        <div className="flex items-center justify-between font-semibold">
                          <span>{item.name}</span>
                          <span className="text-[10px] text-emerald-400 font-normal">{item.distance}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">대표 메뉴: {item.menu}</div>
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
                      <div key={item.name} className="text-xs leading-tight text-foreground py-1.5 border-b border-border/40 last:border-0">
                        <div className="flex items-center justify-between font-semibold">
                          <span>{item.name}</span>
                          <span className="text-[10px] text-amber-400 font-normal">{item.distance}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">시그니처: {item.menu}</div>
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
                      <div key={item.name} className="text-xs leading-tight text-foreground py-1.5 border-b border-border/40 last:border-0">
                        <div className="flex items-center justify-between font-semibold">
                          <span>{item.name}</span>
                          <span className="text-[10px] text-purple-400 font-normal">{item.distance}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">추천 선물: {item.item}</div>
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

          {/* 주의사항 경고 배지 */}
          {place.warning ? (
            <p className="flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-foreground border border-destructive/20">
              <AlertTriangle className="size-3.5 shrink-0 text-destructive" />
              {place.warning}
            </p>
          ) : null}

          {/* 네이버 지도 연동 버튼 */}
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
