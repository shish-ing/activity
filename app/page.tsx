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

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 relative z-20">
        {/* 상단 손글씨 타이틀: '무계획 P를 위한' 서브타이틀화 + 대표 슬로건 '가장 완벽한 지금' 강조 */}
        <section className="pt-6 pb-6 text-center relative z-20">
          <h1 className="font-handwriting relative z-20 select-none drop-shadow-2xs">
            {/* 서브 타이틀: 무계획 P를 위한 */}
            <span className="block text-lg sm:text-xl md:text-2xl font-bold text-[#5C4033] mb-1">
              {t('무계획 P를 위한', 'For Spontaneous Travelers', lang)}
            </span>

            {/* 대표 메인 슬로건: 가장 완벽한 지금 */}
            <span className="block text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#8B4513] leading-snug">
              {t('가장 완벽한 ', 'The Most Perfect ', lang)}
              <span className="text-[#A83D12] font-black">
                {t('지금', 'Now', lang)}
              </span>
            </span>
          </h1>
        </section>

        {/* 🏛️ 2컬럼 레이아웃: 좌측 여행 조건 선택 폼 + 우측 전통 한옥 베젤 축제 팝업 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-20">
          {/* 좌측 7컬럼: P 맞춤 여행 조건 선택 폼 */}
          <div className="lg:col-span-7 w-full max-w-xl mx-auto lg:max-w-none">
            <ConditionForm />
          </div>

          {/* 우측 5컬럼: 전통 한옥 베젤 프레임 (축제 팝업 족자 + 등불 + 구름 문양) */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none lg:sticky lg:top-24">
            <HanokBezelFrame tagText={t('축제 팝업', 'Festival Pop-up', lang)}>
              <EventBanner />
            </HanokBezelFrame>
          </div>
        </div>
      </div>
    </main>
  )
}
