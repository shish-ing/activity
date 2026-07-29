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
      {/* 📜 공통 세련된 배경 텍스처: 은은한 전통 한지 & 창호 문양 오버레이 */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* ========================================================================= */}
      {/* 1. ☀️ 맑음: 세련된 한옥 기와지붕 & 따스한 햇빛 빔 (Warm Golden Sky & Hanok Flare) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#38BDF8] via-[#7DD3FC] to-[#E0F2FE] ${
          activeTheme === 'clear' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 상단 서정적인 햇살 아우라 & 소프트 광원 플레어 */}
        <div className="absolute -top-24 -right-24 size-[600px] rounded-full bg-gradient-to-br from-amber-200/50 via-yellow-100/30 to-transparent blur-3xl animate-pulse duration-[5000ms]" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[300px] bg-amber-300/20 blur-2xl transform rotate-12" />

        {/* 쏟아지는 감성 햇살 빔 스파클 */}
        <div className="absolute inset-0 opacity-70">
          {[...Array(12)].map((_, i) => (
            <div
              key={`sun-light-beam-${i}`}
              className="absolute rounded-full bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.9)] animate-pulse duration-[3000ms]"
              style={{
                top: `${(i * 19) % 65 + 5}%`,
                left: `${(i * 29) % 85 + 5}%`,
                width: `${(i % 3) * 3 + 4}px`,
                height: `${(i % 3) * 3 + 4}px`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ❄️ 눈 옴: 포근한 은빛 눈 잔영 & 한옥 기와 처마 위 함박눈 */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#64748B] via-[#94A3B8] to-[#CBD5E1] ${
          activeTheme === 'snow' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-0 left-1/3 size-[600px] rounded-full bg-sky-100/40 blur-[120px]" />

        {/* 세련되고 운치 있게 휘날리는 함박눈송이 */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => {
            const size = (i % 3) * 3 + 3
            const left = (i * 2.5) % 100
            const duration = (i % 5) + 4
            const delay = (i % 8) * 0.5
            return (
              <div
                key={`hanok-snow-${i}`}
                className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-page-snow"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  opacity: (i % 3) * 0.25 + 0.6,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 🌧️ 비 옴: 고즈넉한 대지 묵향 & 처마 빗줄기 감성 */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#475569] via-[#64748B] to-[#94A3B8] ${
          activeTheme === 'rain' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute -top-10 right-1/4 size-[550px] rounded-full bg-cyan-200/20 blur-[130px]" />

        {/* 빗방울 줄기 */}
        <div className="absolute inset-0">
          {[...Array(45)].map((_, i) => {
            const left = (i * 2.2) % 100
            const height = (i % 4) * 16 + 25
            const duration = (i % 3) * 0.25 + 0.6
            const delay = (i % 9) * 0.15
            return (
              <div
                key={`hanok-rain-${i}`}
                className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-100 to-white/80 shadow-[0_0_6px_rgba(224,242,254,0.9)] animate-page-rain"
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
      {/* 4. 💨 바람: 한옥 처마를 스치는 청아한 바람 결 (Silken Wind Stream) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#0369A1] ${
          activeTheme === 'wind' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/4 -left-10 size-[600px] rounded-full bg-sky-200/30 blur-[130px]" />

        {/* 세련된 동양적 바람결 스웝 스트림 */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={`hanok-wind-${i}`}
              className="absolute animate-tornado-swirl opacity-40"
              style={{
                top: `${(i * 18) + 12}%`,
                left: `${(i * 20) % 70}%`,
                animationDuration: `${(i % 3) * 2.5 + 4}s`,
                animationDelay: `${i * 0.7}s`,
              }}
            >
              <svg className="w-44 h-12 text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" viewBox="0 0 200 50" fill="none">
                <path
                  d="M10,25 C50,5 110,45 160,20 C180,10 190,30 170,35 C150,40 140,25 155,20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ☁️ 구름: 한옥과 산 능선 사이로 감도는 아련한 운해 (Floating Fog Sea) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#64748B] via-[#78889B] to-[#B0BEC5] ${
          activeTheme === 'cloudy' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 유유히 흘러가는 실루엣 운해 구름 */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-12 animate-float-cloud-slow" style={{ animationDuration: '32s' }}>
            <div className="w-96 h-28 bg-white/40 rounded-full blur-xl" />
          </div>
          <div className="absolute top-1/3 animate-float-cloud-mid" style={{ animationDuration: '24s', animationDelay: '4s' }}>
            <div className="w-[500px] h-32 bg-white/35 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🏯 [전주 정체성 핵심] 하단 세련된 한옥 기와 처마 실루엣 (Hanok Rooflines) */}
      {/* ========================================================================= */}
      <div className="absolute bottom-0 inset-x-0 h-48 pointer-events-none z-10 overflow-hidden">
        {/* 뒤쪽 한옥 처마 겹 레이어 (은은한 실루엣) */}
        <svg
          className="absolute bottom-0 left-0 w-[115%] h-36 text-slate-900/20 transform -translate-x-5"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
        >
          {/* 한옥 지붕 & 처마 곡선 벡터 */}
          <path
            d="M0,160 L0,80 C60,70 120,40 180,60 C240,80 300,75 360,50 C420,25 480,65 540,75 C600,85 660,40 720,55 C780,70 840,30 900,45 C960,60 1020,35 1080,50 C1140,65 1180,45 1200,60 L1200,160 Z"
            fill="currentColor"
          />
        </svg>

        {/* 앞쪽 전주 한옥마을 상징 전통 기와지붕 실루엣 (정교하고 우아한 처마 선) */}
        <svg
          className="absolute bottom-0 inset-x-0 w-full h-32 text-slate-950/35"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          {/* 전주 한옥 기와 지붕 곡선 & 서래/처마 마루 */}
          <path
            d="M0,180 L0,110 C80,95 160,50 240,75 C320,100 400,90 480,60 C560,30 640,80 720,95 C800,110 880,50 960,70 C1040,90 1120,40 1200,65 C1280,90 1360,60 1440,80 L1440,180 Z"
            fill="currentColor"
          />
          {/* 한옥 서까래 마루 경계선 포인트 */}
          <path
            d="M240,75 C320,100 400,90 480,60 M720,95 C800,110 880,50 960,70"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* 키프레임 애니메이션 정의 */}
      <style jsx global>{`
        /* 눈송이 내리기 */
        @keyframes page-snow {
          0% {
            transform: translateY(-30px) translateX(0px);
          }
          50% {
            transform: translateY(50vh) translateX(12px);
          }
          100% {
            transform: translateY(105vh) translateX(-8px);
          }
        }
        .animate-page-snow {
          animation: page-snow linear infinite;
        }

        /* 빗방울 내리기 */
        @keyframes page-rain {
          0% {
            transform: translateY(-50px) rotate(12deg);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(105vh) rotate(12deg);
            opacity: 0.15;
          }
        }
        .animate-page-rain {
          animation: page-rain linear infinite;
        }

        /* 바람결 수확 이동 */
        @keyframes tornado-swirl {
          0% {
            transform: translateX(-180px) scale(0.7);
            opacity: 0;
          }
          40% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(110vw) scale(1.1);
            opacity: 0;
          }
        }
        .animate-tornado-swirl {
          animation: tornado-swirl cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* 떠다니는 안개 구름 */
        @keyframes float-cloud {
          0% {
            transform: translateX(-400px);
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
