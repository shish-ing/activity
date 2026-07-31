'use client'

import { useState, useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { ConditionForm } from '@/components/condition-form'
import { EventBanner } from '@/components/event-banner'
import { HanokBezelFrame } from '@/components/hanok-bezel-frame'
import { getAppLang, t, type AppLang } from '@/lib/i18n'

export default function HomePage() {
  const [lang, setLang] = useState<AppLang>('ko')

  // 🎯 [랜딩 애니메이션 1] 스플래시 화면 제어용 상태 (intro ➔ shrink ➔ done)
  const [splashStage, setSplashStage] = useState<'intro' | 'shrink' | 'done'>('intro')

  useEffect(() => {
    setLang(getAppLang())
    const handleLangChange = () => setLang(getAppLang())
    window.addEventListener('jeonju_lang_changed', handleLangChange)
    window.addEventListener('storage', handleLangChange)

    // 🎯 [랜딩 애니메이션 2] 타이머 기반 제어 (1.5초 유지 후 2.2초에 완전히 폼 활성화)
    const timer1 = setTimeout(() => {
      setSplashStage('shrink')
    }, 1500)

    const timer2 = setTimeout(() => {
      setSplashStage('done')
    }, 2200)

    return () => {
      window.removeEventListener('jeonju_lang_changed', handleLangChange)
      window.removeEventListener('storage', handleLangChange)
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <main className="min-h-svh relative z-10">
      {/* 🎯 [랜딩 애니메이션 3] 스플래시 오버레이 (첫 진입 시 화면 중앙 거대 카피 ➔ 상단 타이틀 위치로 축소 및 부드러운 이동) */}
      {splashStage !== 'done' && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none ${
            splashStage === 'intro' ? 'bg-gradient-to-b from-[#FFFDF8] via-[#FAF3E5] to-[#F4E6D0] opacity-100' : 'bg-transparent opacity-0'
          }`}
        >
          <div
            className={`text-center font-handwriting select-none transition-all duration-700 ease-in-out transform ${
              splashStage === 'intro'
                ? 'scale-125 sm:scale-150 md:scale-175 translate-y-0 opacity-100'
                : 'scale-100 -translate-y-[28vh] sm:-translate-y-[32vh] opacity-0'
            }`}
          >
            <span className="block text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4E3629] mb-1.5 tracking-tight drop-shadow-md">
              {lang === 'en' ? 'For Spontaneous Travelers' : '무계획 :P를 위한'}
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl font-black text-[#8B4513] leading-tight drop-shadow-md">
              {lang === 'en' ? 'The Most Perfect ' : '가장 완벽한 '}
              <span className="text-[#A83D12] font-black">
                {lang === 'en' ? 'Now' : '지금'}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* 🎯 [랜딩 애니메이션 4] 스플래시 이동과 동시 페이드인(Fade-in) 적용 래퍼 */}
      <div className={`transition-opacity duration-700 ease-in-out ${splashStage === 'intro' ? 'opacity-0' : 'opacity-100'}`}>
        <SiteHeader />

        {/* 🎯 화면 100% 정중앙 컨테이너: 타이틀, 네이버지도 연동 출발지, 남은시간 카드 1픽셀도 이동 없이 정중앙 고정 */}
        <div className="mx-auto w-full max-w-xl px-4 pb-12 relative z-20">
          {/* 상단 손글씨 타이틀 (정중앙 100% 보장) */}
          <section className="pt-6 pb-4 text-center relative z-30">
            <h1 className="font-handwriting relative z-30 select-none drop-shadow-xs">
              {/* 서브 타이틀: 무계획 P를 위한 */}
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[#4E3629] mb-1.5 tracking-tight">
                {lang === 'en' ? 'For Spontaneous Travelers' : '무계획 :P를 위한'}
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
      </div>
    </main>
  )
}
