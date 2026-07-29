'use client'

import { useEffect, useState } from 'react'

export type WeatherTheme = 'clear' | 'snow' | 'rain' | 'wind' | 'cloudy' | 'auto'

interface WeatherBackgroundProps {
  weather: string // 'auto' | 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'
  realtimeCondition?: string // 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'
}

export function WeatherBackground({ weather, realtimeCondition }: WeatherBackgroundProps) {
  // 실제 적용할 날씨 테마 결정 ('auto'일 경우 realtimeCondition 참조)
  const activeTheme: WeatherTheme = (weather === 'auto'
    ? (realtimeCondition as WeatherTheme) || 'clear'
    : weather) as WeatherTheme

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-colors duration-1000">
      {/* 1. ☀️ 맑음·더위 (따뜻한 웜톤 오렌지/골든 선셋 그라데이션 & 햇살 글로우) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#24130A] via-[#331A0C] to-[#170B05] ${
          activeTheme === 'clear' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 햇살 플레어 / 웜톤 아우라 */}
        <div className="absolute -top-32 -left-32 size-[550px] rounded-full bg-amber-500/20 blur-[120px] animate-pulse duration-[4000ms]" />
        <div className="absolute top-1/4 right-0 size-[450px] rounded-full bg-orange-600/15 blur-[100px] animate-pulse duration-[6000ms]" />
        
        {/* floating sun dust particles */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(12)].map((_, i) => (
            <div
              key={`sun-particle-${i}`}
              className="absolute rounded-full bg-amber-200/40 blur-[1px] animate-ping"
              style={{
                top: `${(i * 17) % 90}%`,
                left: `${(i * 23) % 90}%`,
                width: `${(i % 3) * 3 + 2}px`,
                height: `${(i % 3) * 3 + 2}px`,
                animationDuration: `${(i % 4) + 3}s`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. ❄️ 눈 옴 (차갑고 포근한 딥블루/아이스 톤 & 펄펄 내리는 함박눈 애니메이션) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#0B1B2B] via-[#122A42] to-[#07111C] ${
          activeTheme === 'snow' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-0 left-1/3 size-[500px] rounded-full bg-sky-400/15 blur-[130px]" />
        <div className="absolute bottom-10 right-10 size-[400px] rounded-full bg-indigo-500/15 blur-[110px]" />

        {/* 눈송이 애니메이션 레이어 */}
        <div className="absolute inset-0">
          {[...Array(35)].map((_, i) => {
            const size = (i % 3) * 3 + 3
            const left = (i * 2.9) % 100
            const duration = (i % 5) + 4
            const delay = (i % 7) * 0.7
            return (
              <div
                key={`snowflake-${i}`}
                className="absolute rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-snow-fall"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  opacity: (i % 4) * 0.2 + 0.3,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* 3. 🌧️ 비 옴 (촉촉하고 분위기 있는 딥 차콜 블루 & 비스듬히 쏟아지는 빗방울 레이어) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#0C151F] via-[#142332] to-[#0A0F17] ${
          activeTheme === 'rain' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute -top-20 right-1/4 size-[550px] rounded-full bg-blue-600/10 blur-[140px]" />
        
        {/* 빗방울 스트릭 애니메이션 */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => {
            const left = (i * 2.6) % 100
            const height = (i % 4) * 15 + 25
            const duration = (i % 3) * 0.3 + 0.7
            const delay = (i % 9) * 0.2
            return (
              <div
                key={`raindrop-${i}`}
                className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-300/60 to-blue-200/80 animate-rain-fall"
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

      {/* 4. 💨 바람·한파 (시리도록 차가운 딥 바이올렛 블루 & 스쳐가는 바람결 애니메이션) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#081627] via-[#0E243D] to-[#050F1B] ${
          activeTheme === 'wind' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/3 -left-20 size-[600px] rounded-full bg-teal-500/10 blur-[150px]" />
        
        {/* 바람 스트림라인 효과 */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={`wind-line-${i}`}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent animate-wind-sweep"
              style={{
                top: `${(i * 12) + 8}%`,
                width: `${(i % 3) * 30 + 40}%`,
                animationDuration: `${(i % 3) * 2 + 3}s`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 5. ☁️ 구름 많음 (차분한 무드 쿨 차콜 그레이 & 은은한 안개) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-br from-[#16191E] via-[#21262E] to-[#101216] ${
          activeTheme === 'cloudy' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-10 left-10 size-[500px] rounded-full bg-slate-400/10 blur-[130px] animate-pulse duration-[7000ms]" />
        <div className="absolute bottom-10 right-10 size-[500px] rounded-full bg-zinc-500/10 blur-[130px] animate-pulse duration-[9000ms]" />
      </div>

      {/* 키프레임 애니메이션 인라인 스타일 */}
      <style jsx global>{`
        @keyframes snow-fall {
          0% {
            transform: translateY(-20px) translateX(0px);
          }
          50% {
            transform: translateY(50vh) translateX(15px);
          }
          100% {
            transform: translateY(105vh) translateX(-10px);
          }
        }
        .animate-snow-fall {
          animation: snow-fall linear infinite;
        }

        @keyframes rain-fall {
          0% {
            transform: translateY(-60px) rotate(12deg);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(12deg);
            opacity: 0.2;
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
          40% {
            opacity: 0.7;
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
