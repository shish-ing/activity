'use client'

import { useMemo } from 'react'

export type WeatherTheme = 'clear' | 'snow' | 'rain' | 'wind' | 'cloudy' | 'auto'

interface WeatherBackgroundProps {
  weather: string // 'auto' | 'clear' | 'rain' | 'cloudy' | 'snow' | 'wind'
  realtimeCondition?: string
}

/* ========================================================================= */
/* 🍃 수묵화 배경 느낌과 완벽히 어우러지는 대각선 자연 바람 궤적 & 나뭇잎 SVG */
/* ========================================================================= */

function OrganicWindRibbon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 500 140" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M10 70 C 120 10, 240 130, 380 40 C 440 5, 480 45, 490 65" opacity="0.75" />
      <path d="M50 90 C 150 35, 270 110, 420 45" opacity="0.5" strokeWidth="1.6" />
    </svg>
  )
}

function InkFlyingLeaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="currentColor">
      <path d="M30 4 C 18 8, 8 18, 4 30 C 16 30, 26 22, 30 4 Z" />
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

  // 대각선 바람 궤적 흩날림 데이터 (좌측 상단 -> 우측 하단 대각선 이동)
  const diagonalWindTracks = useMemo(() => [
    { top: 5, left: -10, duration: 5.5, delay: 0, scale: 1.2 },
    { top: 18, left: 10, duration: 4.8, delay: 1.2, scale: 1.0 },
    { top: 32, left: -15, duration: 6.2, delay: 2.5, scale: 1.4 },
    { top: 48, left: 5, duration: 5.2, delay: 0.7, scale: 1.1 },
    { top: 62, left: -20, duration: 5.8, delay: 3.1, scale: 1.3 },
  ], [])

  // 대각선 회오리 날아가는 수묵 나뭇잎 입자 데이터
  const diagonalLeaves = useMemo(() => [
    { top: 8, left: -5, duration: 4.5, delay: 0.2, scale: 1.0, color: 'text-stone-700/80' },
    { top: 15, left: 12, duration: 5.2, delay: 1.0, scale: 0.8, color: 'text-amber-900/70' },
    { top: 28, left: -12, duration: 4.0, delay: 2.1, scale: 1.2, color: 'text-stone-800/80' },
    { top: 42, left: 8, duration: 5.6, delay: 0.5, scale: 0.9, color: 'text-amber-950/75' },
    { top: 55, left: -8, duration: 4.3, delay: 1.8, scale: 1.1, color: 'text-stone-700/85' },
    { top: 68, left: 15, duration: 5.0, delay: 2.8, scale: 0.85, color: 'text-amber-900/80' },
  ], [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-700">
      {/* ========================================================================= */}
      {/* ☀️ 1. 맑음·더위: 원본 전체 화폭 100% 노출 (Image 2: bg-clear.jpg) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-[length:100%_100%] bg-center bg-no-repeat bg-[#F9F3EA] ${
          activeTheme === 'clear' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url('/bg-clear.jpg')` }}
      />

      {/* ========================================================================= */}
      {/* ❄️ 2. 눈 옴: 원본 전체 화폭 100% 노출 (Image 3: bg-snow.jpg) + 선명한 함박눈 */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-[length:100%_100%] bg-center bg-no-repeat bg-[#EBE7E1] ${
          activeTheme === 'snow' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url('/bg-snow.jpg')` }}
      >
        <div className="absolute inset-0 z-10">
          {[...Array(50)].map((_, i) => {
            const size = (i % 4) * 3 + 5
            const left = (i * 2.1) % 100
            const duration = (i % 5) + 3.5
            const delay = (i % 8) * 0.4
            return (
              <div
                key={`vivid-snow-${i}`}
                className="absolute rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,1)] ring-1 ring-white/90 animate-page-vivid-snow"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  opacity: (i % 3) * 0.2 + 0.8,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ☔ 3. 비 옴: 원본 전체 화폭 100% 노출 (Image 4: bg-rain.jpg) + 또렷한 빗줄기 */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-[length:100%_100%] bg-center bg-no-repeat bg-[#E8E6E2] ${
          activeTheme === 'rain' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url('/bg-rain.jpg')` }}
      >
        <div className="absolute inset-0 z-10">
          {[...Array(55)].map((_, i) => {
            const left = (i * 1.8) % 100
            const width = (i % 3 === 0) ? 3 : 2.2
            const height = (i % 4) * 20 + 35
            const duration = (i % 3) * 0.2 + 0.5
            const delay = (i % 9) * 0.12
            return (
              <div
                key={`vivid-rain-${i}`}
                className="absolute bg-gradient-to-b from-white via-sky-100 to-white/90 shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-page-vivid-rain"
                style={{
                  left: `${left}%`,
                  width: `${width}px`,
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
      {/* ☁️ 4. 구름 많음: 원본 전체 화폭 100% 노출 (Image 5: bg-cloudy.jpg) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-[length:100%_100%] bg-center bg-no-repeat bg-[#EFECE6] ${
          activeTheme === 'cloudy' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url('/bg-cloudy.jpg')` }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 animate-float-cloud-slow" style={{ animationDuration: '30s' }}>
            <div className="w-96 h-28 bg-white/40 rounded-full blur-xl" />
          </div>
          <div className="absolute top-1/3 animate-float-cloud-mid" style={{ animationDuration: '22s', animationDelay: '3s' }}>
            <div className="w-[500px] h-32 bg-white/35 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🥶 5. 바람·한파: 바람 전용 수묵화 (bg-wind.jpg) + 대각선 흐름 바람 & 휘날리는 나뭇잎 */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 bg-[length:100%_100%] bg-center bg-no-repeat bg-[#DFE5E8] ${
          activeTheme === 'wind' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url('/bg-wind.jpg')` }}
      >
        {/* 대각선 자연 바람 궤적 & 휘날리는 수묵 나뭇잎 애니메이션 파티클 */}
        <div className="absolute inset-0 z-10 overflow-hidden">
          {/* 1. 대각선 은은한 바람 선 궤적 */}
          {diagonalWindTracks.map((wt, idx) => (
            <div
              key={`wind-track-${idx}`}
              className="absolute animate-diagonal-wind-ribbon"
              style={{
                top: `${wt.top}%`,
                left: `${wt.left}%`,
                animationDuration: `${wt.duration}s`,
                animationDelay: `${wt.delay}s`,
                transform: `scale(${wt.scale})`,
              }}
            >
              <OrganicWindRibbon className="w-96 sm:w-[500px] text-white/70 drop-shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
            </div>
          ))}

          {/* 2. 대각선 바람 타고 빙글빙글 날아가는 수묵 나뭇잎 */}
          {diagonalLeaves.map((lf, idx) => (
            <div
              key={`flying-leaf-${idx}`}
              className={`absolute animate-diagonal-flying-leaf ${lf.color}`}
              style={{
                top: `${lf.top}%`,
                left: `${lf.left}%`,
                animationDuration: `${lf.duration}s`,
                animationDelay: `${lf.delay}s`,
                transform: `scale(${lf.scale})`,
              }}
            >
              <InkFlyingLeaf className="size-6 sm:size-8 drop-shadow-xs" />
            </div>
          ))}
        </div>
      </div>

      {/* 키프레임 애니메이션 정의 */}
      <style jsx global>{`
        /* 선명한 함박눈 내리기 */
        @keyframes page-vivid-snow {
          0% {
            transform: translateY(-40px) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) translateX(18px) rotate(180deg);
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(105vh) translateX(-12px) rotate(360deg);
            opacity: 0.2;
          }
        }
        .animate-page-vivid-snow {
          animation: page-vivid-snow linear infinite;
        }

        /* 선명한 빗줄기 내리기 */
        @keyframes page-vivid-rain {
          0% {
            transform: translateY(-60px) rotate(10deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateY(108vh) rotate(10deg);
            opacity: 0.2;
          }
        }
        .animate-page-vivid-rain {
          animation: page-vivid-rain linear infinite;
        }

        /* 🌬️ 대각선 자연 바람 궤적 (좌측 상단 -> 우측 하단 대각선 이동) */
        @keyframes diagonal-wind-ribbon {
          0% {
            transform: translate(-200px, -100px) rotate(-18deg) scale(0.85);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translate(110vw, 75vh) rotate(-18deg) scale(1.15);
            opacity: 0;
          }
        }
        .animate-diagonal-wind-ribbon {
          animation: diagonal-wind-ribbon ease-in-out infinite;
        }

        /* 🍃 대각선 수묵 나뭇잎 휘날림 (회전하면서 대각선으로 부드럽게 이동) */
        @keyframes diagonal-flying-leaf {
          0% {
            transform: translate(-100px, -60px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 0.95;
          }
          80% {
            opacity: 0.9;
          }
          100% {
            transform: translate(108vw, 70vh) rotate(540deg) scale(1.1);
            opacity: 0;
          }
        }
        .animate-diagonal-flying-leaf {
          animation: diagonal-flying-leaf ease-in-out infinite;
        }

        /* 안개 구름 */
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
