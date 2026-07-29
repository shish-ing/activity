'use client'

import { useMemo } from 'react'

export type WeatherTheme = 'clear' | 'snow' | 'rain' | 'wind' | 'cloudy' | 'auto'

interface WeatherBackgroundProps {
  weather: string // 'auto' | 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'
  realtimeCondition?: string
}

export function WeatherBackground({ weather, realtimeCondition }: WeatherBackgroundProps) {
  // 실제 표현할 테마
  const activeTheme: WeatherTheme = useMemo(() => {
    if (weather === 'auto') {
      return (realtimeCondition as WeatherTheme) || 'clear'
    }
    return (weather as WeatherTheme) || 'clear'
  }, [weather, realtimeCondition])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000">
      {/* ========================================================================= */}
      {/* 1. ☀️ 맑음·더위 (밝은 하늘색 + 하단 풀밭/수풀 일러스트 + 쨍하게 뜨는 태양) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#0284C7] via-[#38BDF8] to-[#93C5FD] ${
          activeTheme === 'clear' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 우측 상단 쨍하게 떠오르는 태양(Sun) & 햇살 플레어 */}
        <div className="absolute top-6 right-10 size-44 rounded-full bg-amber-300/40 blur-2xl animate-pulse duration-[3000ms]" />
        <div className="absolute top-12 right-14 size-28 rounded-full bg-gradient-to-br from-yellow-100 via-amber-300 to-orange-400 shadow-[0_0_70px_rgba(253,224,71,0.95)] animate-bounce duration-[7000ms]">
          <div className="absolute inset-0 rounded-full bg-yellow-200/60 blur-md animate-ping duration-[3500ms]" />
        </div>

        {/* 쏟아지는 화사한 햇빛 먼지 입자 */}
        <div className="absolute inset-0 opacity-80">
          {[...Array(16)].map((_, i) => (
            <div
              key={`sun-sparkle-${i}`}
              className="absolute rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,1)] animate-ping"
              style={{
                top: `${(i * 17) % 70 + 5}%`,
                left: `${(i * 23) % 90 + 5}%`,
                width: `${(i % 3) * 4 + 3}px`,
                height: `${(i % 3) * 4 + 3}px`,
                animationDuration: `${(i % 3) + 2}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* 🌿 하단 푸릇푸릇한 풀밭 / 수풀 언덕 일러스트 (Grassland Hills) */}
        <div className="absolute bottom-0 inset-x-0 h-44 overflow-hidden pointer-events-none">
          {/* 뒤쪽 부드러운 연초록 수풀 언덕 */}
          <svg
            className="absolute bottom-0 left-0 w-[120%] h-32 text-[#4ADE80]/80 transform -translate-x-10"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,90 350,-40 500,65 C650,140 900,10 1200,50 L1200,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
          {/* 앞쪽 싱그럽고 짙은 초록 풀밭 언덕 */}
          <svg
            className="absolute bottom-0 left-0 w-[130%] h-24 text-[#22C55E] transform translate-x-5"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,30 C200,100 450,10 700,80 C950,130 1100,20 1300,60 L1300,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ❄️ 눈 옴 (은빛 블루 톤 & 소복소복 내리는 45개 함박눈송이) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#1E3A5F] via-[#2D527C] to-[#12243C] ${
          activeTheme === 'snow' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-0 left-1/3 size-[550px] rounded-full bg-sky-300/30 blur-[110px]" />
        <div className="absolute bottom-10 right-10 size-[450px] rounded-full bg-indigo-400/25 blur-[100px]" />

        {/* 내리는 눈송이 45개 */}
        <div className="absolute inset-0">
          {[...Array(45)].map((_, i) => {
            const size = (i % 3) * 3 + 4
            const left = (i * 2.2) % 100
            const duration = (i % 5) + 3.5
            const delay = (i % 9) * 0.4
            return (
              <div
                key={`page-snow-${i}`}
                className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)] animate-page-snow"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  opacity: (i % 3) * 0.25 + 0.55,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 🌧️ 비 옴 (촉촉한 딥 블루 & 사선으로 쏟아지는 빗방울 50개) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#182B3D] via-[#223E5C] to-[#101F2F] ${
          activeTheme === 'rain' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute -top-10 right-1/4 size-[550px] rounded-full bg-blue-400/25 blur-[120px]" />

        {/* 빗방울 줄기 50개 */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => {
            const left = (i * 2.0) % 100
            const height = (i % 4) * 18 + 30
            const duration = (i % 3) * 0.2 + 0.55
            const delay = (i % 10) * 0.15
            return (
              <div
                key={`page-rain-${i}`}
                className="absolute w-[2px] bg-gradient-to-b from-transparent via-cyan-300 to-blue-100 shadow-[0_0_8px_rgba(125,211,252,0.9)] animate-page-rain"
                style={{
                  left: `${left}%`,
                  height: `${height}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. 💨 바람·한파 (토네이도 / 갈고리 회오리 소용돌이 이펙트) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#12304D] via-[#1C466E] to-[#0A1F33] ${
          activeTheme === 'wind' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/4 -left-10 size-[600px] rounded-full bg-cyan-400/25 blur-[130px]" />

        {/* 🌀 갈고리 토네이도 회오리 바람 이펙트 6개 */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={`page-tornado-${i}`}
              className="absolute animate-tornado-swirl"
              style={{
                top: `${(i * 15) + 10}%`,
                left: `${(i * 18) % 70}%`,
                animationDuration: `${(i % 3) * 2 + 3.5}s`,
                animationDelay: `${i * 0.6}s`,
              }}
            >
              {/* 갈고리 소용돌이 SVG */}
              <svg className="size-20 text-cyan-200/80 drop-shadow-[0_0_12px_rgba(165,243,252,0.9)]" viewBox="0 0 100 100" fill="none">
                <path
                  d="M10,50 C20,20 60,10 80,40 C95,65 60,90 35,75 C20,65 25,45 45,40 C60,35 70,50 65,60"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ☁️ 구름 많음 (유유히 떠다니는 실감나는 구름 애니메이션) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#243342] via-[#334457] to-[#192430] ${
          activeTheme === 'cloudy' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* ☁️ 유유히 떠다니는 대형 구름 5개 */}
        <div className="absolute inset-0 opacity-60">
          {/* 구름 1 */}
          <div className="absolute top-12 animate-float-cloud-slow" style={{ animationDuration: '25s' }}>
            <div className="w-64 h-20 bg-slate-300/40 rounded-full blur-md relative">
              <div className="absolute -top-10 left-10 size-28 bg-slate-300/40 rounded-full blur-md" />
              <div className="absolute -top-6 left-28 size-20 bg-slate-300/40 rounded-full blur-md" />
            </div>
          </div>
          {/* 구름 2 */}
          <div className="absolute top-40 animate-float-cloud-mid" style={{ animationDuration: '18s', animationDelay: '3s' }}>
            <div className="w-80 h-24 bg-slate-200/35 rounded-full blur-lg relative">
              <div className="absolute -top-12 left-16 size-32 bg-slate-200/35 rounded-full blur-lg" />
              <div className="absolute -top-8 left-40 size-24 bg-slate-200/35 rounded-full blur-lg" />
            </div>
          </div>
          {/* 구름 3 */}
          <div className="absolute top-2/3 animate-float-cloud-slow" style={{ animationDuration: '28s', animationDelay: '7s' }}>
            <div className="w-72 h-20 bg-slate-400/40 rounded-full blur-md relative">
              <div className="absolute -top-10 left-12 size-28 bg-slate-400/40 rounded-full blur-md" />
            </div>
          </div>
        </div>
      </div>

      {/* 키프레임 애니메이션 정의 */}
      <style jsx global>{`
        /* 눈송이 내리기 */
        @keyframes page-snow {
          0% {
            transform: translateY(-30px) translateX(0px);
          }
          50% {
            transform: translateY(50vh) translateX(15px);
          }
          100% {
            transform: translateY(105vh) translateX(-10px);
          }
        }
        .animate-page-snow {
          animation: page-snow linear infinite;
        }

        /* 빗방울 내리기 */
        @keyframes page-rain {
          0% {
            transform: translateY(-60px) rotate(14deg);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(14deg);
            opacity: 0.15;
          }
        }
        .animate-page-rain {
          animation: page-rain linear infinite;
        }

        /* 토네이도/갈고리 회오리 바람 이동 */
        @keyframes tornado-swirl {
          0% {
            transform: translateX(-120px) rotate(0deg) scale(0.6);
            opacity: 0;
          }
          30% {
            opacity: 0.9;
          }
          50% {
            transform: translateX(50vw) rotate(360deg) scale(1.1);
          }
          100% {
            transform: translateX(110vw) rotate(720deg) scale(0.7);
            opacity: 0;
          }
        }
        .animate-tornado-swirl {
          animation: tornado-swirl cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* 떠다니는 구름 이동 */
        @keyframes float-cloud {
          0% {
            transform: translateX(-350px);
          }
          100% {
            transform: translateX(110vw);
          }
        }
        .animate-float-cloud-slow {
          animation: float-cloud linear infinite;
        }
        .animate-float-cloud-mid {
          animation: float-cloud linear infinite;
        }
      `}</style>
    </div>
  )
}
