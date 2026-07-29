'use client'

import { useMemo } from 'react'

export interface FormWeatherCardBgProps {
  weather: string // 'auto' | 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'
}

export function FormWeatherCardBg({ weather }: FormWeatherCardBgProps) {
  // 실제 표현할 테마 ('auto'일 경우 'clear'를 기본으로 표시)
  const activeTheme = useMemo(() => {
    if (weather === 'auto') return 'clear'
    return weather || 'clear'
  }, [weather])

  return (
    <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden z-0 transition-all duration-700">
      {/* 1. ☀️ 맑음·더위 (밝은 하늘 & 해가 쨍하게 뜨는 웜톤 썬샤인 배경) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#1E3A5F]/90 via-[#2B4C7E]/80 to-[#3A2D1B]/90 ${
          activeTheme === 'clear' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 뜨겁고 화사하게 떠오르는 태양(Sun Glow & Rays) */}
        <div className="absolute -top-16 -right-16 size-64 rounded-full bg-amber-400/30 blur-2xl animate-pulse duration-[3000ms]" />
        <div className="absolute top-4 right-6 size-20 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-[0_0_40px_rgba(251,191,36,0.8)] animate-bounce duration-[6000ms]">
          <div className="absolute inset-0 rounded-full bg-yellow-200/50 blur-sm animate-ping duration-[3000ms]" />
        </div>

        {/* 쏟아지는 맑은 햇살 먼지 파티클 */}
        <div className="absolute inset-0 opacity-70">
          {[...Array(10)].map((_, i) => (
            <div
              key={`sun-ray-${i}`}
              className="absolute rounded-full bg-amber-200/60 shadow-[0_0_10px_rgba(254,240,138,0.8)] animate-ping"
              style={{
                top: `${(i * 21) % 80 + 10}%`,
                left: `${(i * 31) % 85 + 5}%`,
                width: `${(i % 3) * 3 + 3}px`,
                height: `${(i % 3) * 3 + 3}px`,
                animationDuration: `${(i % 3) + 2}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. ❄️ 눈 옴 (포근한 딥블루 & 카드를 펄펄 수놓는 실시간 내리는 눈송이) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#0F2338]/95 via-[#183654]/90 to-[#0A1624]/95 ${
          activeTheme === 'snow' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute -top-10 left-1/4 size-72 rounded-full bg-sky-400/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-60 rounded-full bg-indigo-500/20 blur-2xl" />

        {/* 펄펄 내리는 함박눈송이 30개 */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => {
            const size = (i % 3) * 3 + 3
            const left = (i * 3.3) % 100
            const duration = (i % 4) + 3
            const delay = (i % 6) * 0.4
            return (
              <div
                key={`card-snow-${i}`}
                className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)] animate-card-snow"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  opacity: (i % 3) * 0.3 + 0.5,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* 3. 🌧️ 비 옴 (촉촉한 딥 블루 그레이 & 떨어지는 빗방울 줄기) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#0D1B2A]/95 via-[#1B263B]/90 to-[#0B131F]/95 ${
          activeTheme === 'rain' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-0 right-10 size-64 rounded-full bg-blue-500/20 blur-3xl" />

        {/* 비스듬히 쏟아지는 빗방울 35개 */}
        <div className="absolute inset-0">
          {[...Array(35)].map((_, i) => {
            const left = (i * 2.8) % 100
            const height = (i % 3) * 15 + 25
            const duration = (i % 3) * 0.2 + 0.5
            const delay = (i % 8) * 0.15
            return (
              <div
                key={`card-rain-${i}`}
                className="absolute w-[2px] bg-gradient-to-b from-transparent via-cyan-300/80 to-blue-200 shadow-[0_0_6px_rgba(56,189,248,0.8)] animate-card-rain"
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

      {/* 4. 💨 바람·한파 (시린 바이올렛 블루 & 스쳐가는 바람결 파동) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#0D1F33]/95 via-[#162D4A]/90 to-[#091422]/95 ${
          activeTheme === 'wind' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/4 -left-10 size-60 rounded-full bg-cyan-400/20 blur-3xl" />

        {/* 바람결 스트림 7개 */}
        <div className="absolute inset-0">
          {[...Array(7)].map((_, i) => (
            <div
              key={`card-wind-${i}`}
              className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent shadow-[0_0_8px_rgba(165,243,252,0.8)] animate-card-wind"
              style={{
                top: `${i * 13 + 8}%`,
                width: `${(i % 3) * 25 + 45}%`,
                animationDuration: `${(i % 3) * 1.5 + 2}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 5. ☁️ 구름 많음 (차분한 구름 안개 톤) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#1C232E]/95 via-[#28313E]/90 to-[#12171F]/95 ${
          activeTheme === 'cloudy' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-5 left-5 size-60 rounded-full bg-slate-400/20 blur-3xl animate-pulse duration-[5000ms]" />
        <div className="absolute bottom-5 right-5 size-60 rounded-full bg-zinc-500/20 blur-3xl animate-pulse duration-[7000ms]" />
      </div>

      {/* 키프레임 애니메이션 정의 */}
      <style jsx global>{`
        @keyframes card-snow {
          0% {
            transform: translateY(-15px) translateX(0px);
          }
          50% {
            transform: translateY(200px) translateX(12px);
          }
          100% {
            transform: translateY(450px) translateX(-8px);
          }
        }
        .animate-card-snow {
          animation: card-snow linear infinite;
        }

        @keyframes card-rain {
          0% {
            transform: translateY(-40px) rotate(12deg);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateY(450px) rotate(12deg);
            opacity: 0.1;
          }
        }
        .animate-card-rain {
          animation: card-rain linear infinite;
        }

        @keyframes card-wind {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          30% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(180%);
            opacity: 0;
          }
        }
        .animate-card-wind {
          animation: card-wind ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
