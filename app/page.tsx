'use client'

import { useState, useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { ConditionForm } from '@/components/condition-form'
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

      <div className="mx-auto w-full max-w-xl px-4 pb-8 relative z-20">
        {/* 상단 손글씨 타이틀: '무계획 P를 위한' 서브타이틀화 + 대표 슬로건 '가장 완벽한 지금' 강조 */}
        <section className="pt-5 pb-4 text-center relative z-20">
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

        <ConditionForm />
      </div>
    </main>
  )
}
