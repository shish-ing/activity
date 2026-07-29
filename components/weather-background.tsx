'use client'

import { useMemo } from 'react'

export type WeatherTheme = 'clear' | 'snow' | 'rain' | 'wind' | 'cloudy' | 'auto'

interface WeatherBackgroundProps {
  weather: string // 'auto' | 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'
  realtimeCondition?: string
}

/* ========================================================================= */
/* 🌬️ 사용자가 제공한 이미지 기반 5가지 다양한 세련된 바람 SVG 쉐이프들 */
/* ========================================================================= */

// 1. 구름 뿜어져 나오는 바람 (Puff Cloud Wind)
function WindPuffShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 80" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {/* 뒤쪽 바람 줄기 */}
      <path d="M10 25 H 70" />
      <path d="M20 40 H 80" />
      <path d="M15 55 H 65" />
      {/* 구름 바람 머리 */}
      <path d="M75 40 C 70 25 85 15 100 20 C 110 10 130 15 135 30 C 145 30 155 45 145 55 C 150 65 135 75 125 70 C 115 80 95 75 90 65 C 80 65 75 50 80 40 Z" fill="rgba(255,255,255,0.15)" />
    </svg>
  )
}

// 2. 끝이 말려 올라가는 3중 회오리 바람 (Triple Spiral Wind)
function TripleSpiralWindShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 180 80" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <path d="M10 20 C 60 20 120 15 140 30 C 155 42 140 60 125 45 C 115 35 130 20 145 25" />
      <path d="M25 45 C 75 45 115 40 130 55 C 140 65 130 75 120 65 C 115 58 125 48 135 52" />
      <path d="M40 68 C 80 68 110 65 125 72" />
    </svg>
  )
}

// 3. 부드러운 잔물결 파도 바람 (Smooth Wave Wind)
function WaveWindShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 180 60" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <path d="M10 20 C 40 5 80 35 120 15 C 145 2 165 25 150 35 C 135 45 130 30 145 25" />
      <path d="M30 40 C 60 25 100 50 140 32" />
    </svg>
  )
}

// 4. 위아래 쌍 갈고리 바람 (Double Hook Wind)
function DoubleHookWindShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 70" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <path d="M10 25 C 50 25 100 15 120 30 C 135 40 125 55 110 45 C 100 38 112 25 125 30" />
      <path d="M25 48 C 65 48 105 40 135 52 C 148 57 142 68 130 62" />
    </svg>
  )
}

// 5. 360도 루프 원형 바람 (Whirl Loop Swirl Wind)
function LoopSwirlWindShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 70" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <path d="M10 35 C 50 35 80 10 100 35 C 115 55 85 55 80 35 C 75 15 110 15 155 35" />
      <path d="M30 55 C 60 55 85 45 110 58" />
    </svg>
  )
}

export function WeatherBackground({ weather, realtimeCondition }: WeatherBackgroundProps) {
  // 실제 표현할 테마
  const activeTheme: WeatherTheme = useMemo(() => {
    if (weather === 'auto') {
      return (realtimeCondition as WeatherTheme) || 'clear'
    }
    return (weather as WeatherTheme) || 'clear'
  }, [weather, realtimeCondition])

  // 바람 입자 배치용 다양한 패턴 데이터
  const windParticles = useMemo(() => [
    { type: 'puff', top: 12, left: -5, duration: 4.5, delay: 0, scale: 1.1 },
    { type: 'triple', top: 22, left: 15, duration: 3.8, delay: 0.8, scale: 1.2 },
    { type: 'wave', top: 35, left: -10, duration: 5.2, delay: 1.5, scale: 0.95 },
    { type: 'hook', top: 48, left: 25, duration: 4.1, delay: 0.3, scale: 1.15 },
    { type: 'loop', top: 60, left: 5, duration: 4.8, delay: 1.1, scale: 1.0 },
    { type: 'triple', top: 72, left: 30, duration: 3.5, delay: 1.9, scale: 1.3 },
    { type: 'puff', top: 28, left: 50, duration: 4.3, delay: 2.2, scale: 0.9 },
    { type: 'wave', top: 65, left: 55, duration: 5.0, delay: 2.7, scale: 1.1 },
    { type: 'hook', top: 18, left: 60, duration: 3.9, delay: 1.4, scale: 1.05 },
    { type: 'loop', top: 42, left: 70, duration: 4.6, delay: 0.6, scale: 1.25 },
  ], [])

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
      {/* 4. 💨 바람: 사용자가 요청한 5가지 다양한 세련된 바람 드로잉 요소 랜덤 배치 */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-b from-[#0284C7] via-[#0369A1] to-[#075985] ${
          activeTheme === 'wind' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/4 -left-10 size-[600px] rounded-full bg-sky-200/30 blur-[130px]" />

        {/* 다양한 바람 SVG 입자 10개 (랜덤 모양 & 타이밍 & 위치) */}
        <div className="absolute inset-0">
          {windParticles.map((p, idx) => {
            const iconClass = "w-36 sm:w-44 text-white/85 drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]"
            return (
              <div
                key={`random-wind-${idx}`}
                className="absolute animate-random-wind"
                style={{
                  top: `${p.top}%`,
                  left: `${p.left}%`,
                  animationDuration: `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                  transform: `scale(${p.scale})`,
                }}
              >
                {p.type === 'puff' && <WindPuffShape className={iconClass} />}
                {p.type === 'triple' && <TripleSpiralWindShape className={iconClass} />}
                {p.type === 'wave' && <WaveWindShape className={iconClass} />}
                {p.type === 'hook' && <DoubleHookWindShape className={iconClass} />}
                {p.type === 'loop' && <LoopSwirlWindShape className={iconClass} />}
              </div>
            )
          })}
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
      {/* 🏯 하단 세련된 전주 한옥 기와 처마 실루엣 (Hanok Rooflines) */}
      {/* ========================================================================= */}
      <div className="absolute bottom-0 inset-x-0 h-48 pointer-events-none z-10 overflow-hidden">
        {/* 뒤쪽 한옥 처마 겹 레이어 */}
        <svg
          className="absolute bottom-0 left-0 w-[115%] h-36 text-slate-900/20 transform -translate-x-5"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
        >
          <path
            d="M0,160 L0,80 C60,70 120,40 180,60 C240,80 300,75 360,50 C420,25 480,65 540,75 C600,85 660,40 720,55 C780,70 840,30 900,45 C960,60 1020,35 1080,50 C1140,65 1180,45 1200,60 L1200,160 Z"
            fill="currentColor"
          />
        </svg>

        {/* 앞쪽 전주 한옥마을 기와 지붕 처마 선 */}
        <svg
          className="absolute bottom-0 inset-x-0 w-full h-32 text-slate-950/35"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          <path
            d="M0,180 L0,110 C80,95 160,50 240,75 C320,100 400,90 480,60 C560,30 640,80 720,95 C800,110 880,50 960,70 C1040,90 1120,40 1200,65 C1280,90 1360,60 1440,80 L1440,180 Z"
            fill="currentColor"
          />
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

        /* 다채로운 랜덤 바람 이동 애니메이션 */
        @keyframes random-wind {
          0% {
            transform: translateX(-200px) translateY(0px) scale(0.8);
            opacity: 0;
          }
          25% {
            opacity: 0.9;
          }
          75% {
            opacity: 0.85;
          }
          100% {
            transform: translateX(110vw) translateY(-25px) scale(1.1);
            opacity: 0;
          }
        }
        .animate-random-wind {
          animation: random-wind ease-in-out infinite;
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
