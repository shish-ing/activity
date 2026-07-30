'use client'

import { useState, useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { ConditionForm } from '@/components/condition-form'
import { EventBanner } from '@/components/event-banner'
import { HanokBezelFrame } from '@/components/hanok-bezel-frame'
import { getAppLang, t, type AppLang } from '@/lib/i18n'

export default function HomePage() {
  const [lang, setLang] = useState<AppLang>('ko')

  useEffect(() => {
    setLang(getAppLang())
    const handleLangChange = () => setLang(getAppLang())
    window.addEventListener('jeonju_lang_changed', handleLangChange)
    window.addEventListener('storage', handleLangChange)
    return () => {
      window.removeEventListener('jeonju_lang_changed', handleLangChange)
      window.removeEventListener('storage', handleLangChange)
    }
  }, [])

  return (
    <main className="min-h-svh relative z-10">
      <SiteHeader />

      {/* 🎯 화면 100% 정중앙 컨테이너: 타이틀, 네이버지도 연동 출발지, 남은시간 카드 1픽셀도 이동 없이 정중앙 고정 */}
      <div className="mx-auto w-full max-w-xl px-4 pb-12 relative z-20">
        {/* 상단 손글씨 타이틀 (정중앙 100% 보장) */}
        <section className="pt-6 pb-4 text-center relative z-30">
          <h1 className="font-handwriting relative z-30 select-none drop-shadow-xs">
            {/* 서브 타이틀: 무계획 P를 위한 */}
            <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[#4E3629] mb-1.5 tracking-tight">
              {lang === 'en' ? 'For Spontaneous Travelers' : '무계획 P를 위한'}
            </span>

            {/* 대표 메인 슬로건: 가장 완벽한 지금 */}
            <span className="block text-4xl sm:text-5xl md:text-6xl font-black text-[#8B4513] leading-tight">
              {lang === 'en' ? 'The Most Perfect ' : '가장 완벽한 '}
              <span className="text-[#A83D12] font-black">
                {lang === 'en' ? 'Now' : '지금'}
              </span>
            </span>
          </h1>
        </section>

        {/* 100% 화면 정중앙 고정 P 맞춤 여행 조건 선택 폼 */}
        <div className="w-full relative z-20">
          <ConditionForm />
        </div>

        {/* 🏛️ 오른편 여백 공간에 배치되는 전통 한옥 베젤 배너 (중앙 글씨/폼 위치 절대 이동 안 함) */}
        <div className="hidden lg:block absolute left-full top-[100px] ml-6 lg:ml-10 w-[320px] xl:w-[350px] z-30">
          <HanokBezelFrame tagText={t('축제 팝업', 'Festival Pop-up', lang)}>
            <EventBanner />
          </HanokBezelFrame>
        </div>
      </div>
    </main>
  )
}
