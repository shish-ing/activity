'use client'

import { useMemo } from 'react'

export type WeatherTheme = 'clear' | 'snow' | 'rain' | 'wind' | 'cloudy' | 'auto'

interface WeatherBackgroundProps {
  weather: string // 'auto' | 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'
  realtimeCondition?: string
}

export function WeatherBackground({ weather, realtimeCondition }: WeatherBackgroundProps) {
  // 실제 적용할 날씨 테마
  const activeTheme: WeatherTheme = useMemo(() => {
    if (weather === 'auto') {
      return (realtimeCondition as WeatherTheme) || 'clear'
    }
    return (weather as WeatherTheme) || 'clear'
  }, [weather, realtimeCondition])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000">
      {/* 1. ☀️ 맑음·더위 (밝고 화사한 스카이 블루 & 쨍하게 뜨는 태양과 쏟아지는 햇살) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#1C4E80] via-[#2A66A2] to-[#16385C] ${
          activeTheme === 'clear' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 상단 우측 쨍하게 빛나는 태양(Sun Flare & Bright Aura) */}
        <div className="absolute -top-10 -right-10 size-[500px] rounded-full bg-amber-300/40 blur-[90px] animate-pulse duration-[3000ms]" />
        <div className="absolute top-10 right-16 size-[400px] rounded-full bg-orange-400/30 blur-[70px]" />

        {/* 선명한 태양구(Sun Sphere) */}
        <div className="absolute top-12 right-20 size-28 rounded-full bg-gradient-to-br from-yellow-100 via-amber-300 to-orange-400 shadow-[0_0_60px_rgba(253,224,71,0.9)] animate-bounce duration-[7000ms]">
          <div className="absolute inset-0 rounded-full bg-yellow-200/60 blur-md animate-ping duration-[3500ms]" />
        </div>
        
        {/* 공기 중에 반짝이는 맑은 햇바람 파티클 */}
        <div className="absolute inset-0 opacity-80">
          {[...Array(18)].map((_, i) => (
            <div
              key={`sun-sparkle-${i}`}
              className="absolute rounded-full bg-amber-100/70 shadow-[0_0_12px_rgba(254,240,138,0.9)] animate-ping"
              style={{
                top: `${(i * 17) % 85 + 5}%`,
                left: `${(i * 23) % 90 + 5}%`,
                width: `${(i % 3) * 4 + 3}px`,
                height: `${(i % 3) * 4 + 3}px`,
                animationDuration: `${(i % 3) + 2}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. ❄️ 눈 옴 (은빛 블루 톤 & 하늘에서 펄펄 내리는 눈송이 45개) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#1B3B5E] via-[#264D78] to-[#10243C] ${
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

      {/* 3. 🌧️ 비 옴 (촉촉한 딥 블루 & 사선으로 쏟아지는 빗방울 50개) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#142A40] via-[#1E3B59] to-[#0E1C2C] ${
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

      {/* 4. 💨 바람·한파 (시리도록 차가운 시안 블루 & 바람결 파동) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#11314F] via-[#1B466F] to-[#0B1E32] ${
          activeTheme === 'wind' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/4 -left-10 size-[600px] rounded-full bg-cyan-400/25 blur-[130px]" />

        {/* 바람 스트림라인 10개 */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={`page-wind-${i}`}
              className="absolute h-[2px] bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent shadow-[0_0_10px_rgba(165,243,252,0.9)] animate-page-wind"
              style={{
                top: `${i * 10 + 5}%`,
                width: `${(i % 3) * 30 + 40}%`,
                animationDuration: `${(i % 3) * 1.8 + 2.2}s`,
                animationDelay: `${i * 0.35}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 5. ☁️ 구름 많음 (차분한 구름 안개 블루그레이 톤) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#202C3A] via-[#2F3D4F] to-[#16202B] ${
          activeTheme === 'cloudy' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-10 left-10 size-[550px] rounded-full bg-slate-300/20 blur-[120px] animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-10 right-10 size-[500px] rounded-full bg-zinc-400/20 blur-[120px] animate-pulse duration-[8000ms]" />
      </div>

      {/* 키프레임 애니메이션 정의 */}
      <style jsx global>{`
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

        @keyframes page-wind {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          35% {
            opacity: 0.95;
          }
          100% {
            transform: translateX(200%);
            opacity: 0;
          }
        }
        .animate-page-wind {
          animation: page-wind ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
