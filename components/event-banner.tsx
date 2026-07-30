'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { getActiveBanners, INITIAL_BANNERS, type EventBannerItem } from '@/lib/banner-storage'

export function EventBanner() {
  const [banners, setBanners] = useState<EventBannerItem[]>(INITIAL_BANNERS)
  const [currentPage, setCurrentPage] = useState(0)

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

  const safeBanners = banners.length > 0 ? banners : INITIAL_BANNERS
  const pageSize = 3
  const totalPages = Math.ceil(safeBanners.length / pageSize)

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  // 현재 페이지의 3개 카드 추출
  const visibleBanners = safeBanners.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

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
        return 'bg-amber-50 text-amber-800 border-amber-300 font-black'
    }
  }

  return (
    <div className="w-full flex flex-col gap-3 pt-7 pb-2 px-1">
      {/* 📜 상단 슬라이드 넘김 조작바 (페이지가 2개 이상일 경우 우측 상단 표출) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end px-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
              {currentPage + 1} / {totalPages} 페이지
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevPage}
                className="flex size-6 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-200 cursor-pointer transition-all shadow-2xs"
                aria-label="이전 3개 보기"
                title="이전 3개 보기"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                className="flex size-6 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-200 cursor-pointer transition-all shadow-2xs"
                aria-label="다음 3개 보기"
                title="다음 3개 보기"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3개 카드 수직 스택 */}
      <div className="flex flex-col gap-3 animate-in fade-in duration-250" key={currentPage}>
        {visibleBanners.map((item, idx) => (
          <div
            key={item.id || idx}
            className="relative w-full rounded-2xl border border-amber-200/90 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 shadow-xs text-slate-900 transition-all duration-300 hover:shadow-md hover:border-amber-400"
          >
            {/* 뱃지 & 기간 */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] shadow-2xs ${getBadgeStyle(
                  item.badgeColor
                )}`}
              >
                <Sparkles className="size-3" />
                <span>{item.category}</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                <Calendar className="size-3 text-amber-600" />
                <span>{item.period}</span>
              </span>
            </div>

            {/* 배너 메인 제목 */}
            <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug tracking-tight mb-1">
              {item.title}
            </h4>

            {/* 위치 장소 */}
            {item.location && (
              <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
                <MapPin className="size-3 text-amber-600 shrink-0" />
                <span className="truncate">{item.location}</span>
              </p>
            )}

            {/* 상세 설명 박스 */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-2 sm:p-2.5">
              <p className="text-xs text-slate-800 font-bold leading-relaxed line-clamp-2">
                "{item.description}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
