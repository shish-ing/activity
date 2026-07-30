'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Megaphone,
} from 'lucide-react'
import { getActiveBanners, INITIAL_BANNERS, type EventBannerItem } from '@/lib/banner-storage'

export function EventBanner() {
  const [banners, setBanners] = useState<EventBannerItem[]>(INITIAL_BANNERS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // 1. 배너 데이터 불러오기 & 실시간 동기화
  const loadBanners = () => {
    const activeList = getActiveBanners()
    if (activeList.length > 0) {
      setBanners(activeList)
    } else {
      setBanners(INITIAL_BANNERS)
    }
  }

  useEffect(() => {
    loadBanners()

    const handleSync = () => loadBanners()
    window.addEventListener('jeonju_banners_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      window.removeEventListener('jeonju_banners_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // 2. 자동 슬라이드 (6초마다 이동, 마우스 호버 시 일시정지)
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [banners.length, isHovered])

  const safeBanners = banners.length > 0 ? banners : INITIAL_BANNERS
  const current = safeBanners[currentIndex % safeBanners.length] || INITIAL_BANNERS[0]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + safeBanners.length) % safeBanners.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % safeBanners.length)
  }

  // 🎨 흰색 카드에 어울리는 뱃지 스타일 매핑
  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold'
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-300 font-extrabold'
      case 'sky':
        return 'bg-sky-50 text-sky-700 border-sky-300 font-extrabold'
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold'
      default:
        return 'bg-amber-500 text-amber-950 border-amber-400 font-black'
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-xl text-slate-900 transition-all duration-300 hover:shadow-2xl hover:border-amber-400/60"
    >
      {/* 은은한 노을빛 코너 포인트 */}
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-300/10 to-transparent blur-2xl" />

      {/* 상단 헤더: 메가폰 아이콘 & 타이틀 & 슬라이드 조작 버튼 */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500 text-amber-950 font-black shadow-xs border border-amber-300 shrink-0">
            <Megaphone className="size-4 animate-bounce" />
          </span>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5 leading-none">
              <span>전주 실시간 축제 & 팝업스토어</span>
            </h3>
            <p className="text-[11px] text-amber-700 font-bold mt-1">
              🔥 지금 전주에서 꼭 가봐야 할 HOT 소식
            </p>
          </div>
        </div>

        {safeBanners.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {currentIndex + 1} / {safeBanners.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-amber-100 hover:text-amber-900 cursor-pointer transition-all"
                aria-label="이전 배너"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-amber-100 hover:text-amber-900 cursor-pointer transition-all"
                aria-label="다음 배너"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 배너 메인 본문 */}
      <div className="space-y-3 animate-in fade-in duration-300" key={current.id}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs shadow-2xs ${getBadgeStyle(
              current.badgeColor
            )}`}
          >
            <Sparkles className="size-3.5" />
            <span>{current.category}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
            <Calendar className="size-3.5 text-amber-600" />
            <span>{current.period}</span>
          </span>
        </div>

        {/* 배너 메인 제목 */}
        <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight pt-0.5">
          {current.title}
        </h4>

        {/* 위치 장소 */}
        {current.location && (
          <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <MapPin className="size-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{current.location}</span>
          </p>
        )}

        {/* 상세 설명 박스 */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5 sm:p-4">
          <p className="text-xs text-slate-800 font-bold leading-relaxed">
            "{current.description}"
          </p>
        </div>
      </div>

      {/* 바닥 인디케이터 도트 */}
      {safeBanners.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {safeBanners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-amber-500 shadow-xs'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`슬라이드 ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
