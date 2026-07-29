'use client'

import { useEffect, useState } from 'react'

export type WeatherTheme = 'clear' | 'snow' | 'rain' | 'wind' | 'cloudy' | 'auto'

interface WeatherBackgroundProps {
  weather: string // 'auto' | 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'
  realtimeCondition?: string
}

export function WeatherBackground({ weather, realtimeCondition }: WeatherBackgroundProps) {
  // 실제 적용할 날씨 테마 ('auto'일 경우 realtimeCondition 사용, 없으면 'clear')
  const activeTheme: WeatherTheme = (
    weather === 'auto'
      ? (realtimeCondition as WeatherTheme) || 'clear'
      : weather
  ) as WeatherTheme

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-700">
      {/* 1. ☀️ 맑음·더위 (따뜻하고 화사한 웜톤 오렌지 & 골든 햇빛 글로우) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#2c180b] via-[#3d200c] to-[#190d05] ${
          activeTheme === 'clear' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 상단 웜톤 태양 글로우 아우라 */}
        <div className="absolute -top-24 -left-24 size-[600px] rounded-full bg-amber-500/25 blur-[120px] animate-pulse duration-[4000ms]" />
        <div className="absolute top-1/3 right-0 size-[500px] rounded-full bg-orange-500/20 blur-[110px] animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-0 left-1/4 size-[450px] rounded-full bg-yellow-600/15 blur-[100px]" />
        
        {/* 춤추는 햇살 먼지 파티클 */}
        <div className="absolute inset-0 opacity-60">
          {[...Array(16)].map((_, i) => (
            <div
              key={`sun-dust-${i}`}
              className="absolute rounded-full bg-amber-200/50 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-ping"
              style={{
                top: `${(i * 19) % 88}%`,
                left: `${(i * 27) % 92}%`,
                width: `${(i % 3) * 4 + 3}px`,
                height: `${(i % 3) * 4 + 3}px`,
                animationDuration: `${(i % 4) + 2.5}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. ❄️ 눈 옴 (시원하고 푸른 아이스 딥블루 & 하늘에서 내리는 눈송이) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#0a1e36] via-[#122e52] to-[#050f1c] ${
          activeTheme === 'snow' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-0 left-1/4 size-[550px] rounded-full bg-sky-400/20 blur-[130px]" />
        <div className="absolute bottom-0 right-10 size-[500px] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute top-1/2 left-10 size-[350px] rounded-full bg-indigo-400/15 blur-[100px]" />

        {/* 내리는 눈송이 40개 */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => {
            const size = (i % 3) * 3 + 4
            const left = (i * 2.5) % 100
            const duration = (i % 5) + 3.5
            const delay = (i % 8) * 0.5
            return (
              <div
                key={`snow-flake-${i}`}
                className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)] animate-snow-fall"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  opacity: (i % 3) * 0.25 + 0.5,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* 3. 🌧️ 비 옴 (촉촉한 딥 블루 차콜 & 비스듬히 쏟아지는 빗방울) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#091624] via-[#11253a] to-[#040a12] ${
          activeTheme === 'rain' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute -top-20 right-1/4 size-[600px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute bottom-10 left-10 size-[450px] rounded-full bg-teal-500/10 blur-[110px]" />

        {/* 빗방울 45개 */}
        <div className="absolute inset-0">
          {[...Array(45)].map((_, i) => {
            const left = (i * 2.3) % 100
            const height = (i % 4) * 18 + 30
            const duration = (i % 3) * 0.25 + 0.6
            const delay = (i % 10) * 0.15
            return (
              <div
                key={`rain-drop-${i}`}
                className="absolute w-[2px] bg-gradient-to-b from-transparent via-cyan-300/80 to-blue-200/90 shadow-[0_0_6px_rgba(56,189,248,0.7)] animate-rain-fall"
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

      {/* 4. 💨 바람·한파 (시리도록 차가운 테일 스카이 딥 바이올렛 & 스쳐가는 바람결) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#07192c] via-[#0d2a4a] to-[#040e19] ${
          activeTheme === 'wind' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/4 -left-20 size-[650px] rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="absolute bottom-1/3 right-0 size-[450px] rounded-full bg-sky-600/15 blur-[120px]" />

        {/* 바람 스트림라인 효과 */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={`wind-stream-${i}`}
              className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent shadow-[0_0_8px_rgba(165,243,252,0.8)] animate-wind-sweep"
              style={{
                top: `${(i * 10) + 6}%`,
                width: `${(i % 3) * 30 + 45}%`,
                animationDuration: `${(i % 3) * 1.8 + 2.5}s`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 5. ☁️ 구름 많음 (차분한 무드 쿨 차콜 그레이 & 구름 안개) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br from-[#161a21] via-[#232933] to-[#0e1015] ${
          activeTheme === 'cloudy' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-10 left-10 size-[550px] rounded-full bg-slate-400/15 blur-[130px] animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-10 right-10 size-[500px] rounded-full bg-zinc-500/15 blur-[130px] animate-pulse duration-[8000ms]" />
      </div>

      {/* 글로벌 애니메이션 정의 */}
      <style jsx global>{`
        @keyframes snow-fall {
          0% {
            transform: translateY(-25px) translateX(0px);
          }
          50% {
            transform: translateY(50vh) translateX(18px);
          }
          100% {
            transform: translateY(105vh) translateX(-12px);
          }
        }
        .animate-snow-fall {
          animation: snow-fall linear infinite;
        }

        @keyframes rain-fall {
          0% {
            transform: translateY(-70px) rotate(14deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(14deg);
            opacity: 0.15;
          }
        }
        .animate-rain-fall {
          animation: rain-fall linear infinite;
        }

        @keyframes wind-sweep {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          30% {
            opacity: 0.85;
          }
          100% {
            transform: translateX(200%);
            opacity: 0;
          }
        }
        .animate-wind-sweep {
          animation: wind-sweep ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
