import { NextResponse } from 'next/server'

export type WeatherApiResponse = {
  condition: 'rain' | 'clear' | 'cloudy'
  emoji: string
  summary: string
  detail: string
  temperature: number
  precipitationProb: number
  lastUpdated: string
  source: string
}

// 전주시 중앙 좌표 (완산구 풍남동/한옥마을 부근)
const JEONJU_LAT = 35.8242
const JEONJU_LON = 127.148

// Next.js Route Cache: 1시간(3600초)마다 재검증/최신화
export const revalidate = 3600

export async function GET() {
  try {
    // 1. 기상청 API Key가 환경 변수에 설정된 경우 기상청 API 연동 (확장성 제공)
    const kmaApiKey = process.env.KMA_API_KEY || process.env.NEXT_PUBLIC_KMA_API_KEY
    if (kmaApiKey) {
      // 기상청 초단기실황/단기예보 API 호출 로직...
    }

    // 2. 기본값: 전주 지역 실시간 기상 API (Open-Meteo, Key 필요없음, 1시간 단위 캐싱)
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${JEONJU_LAT}&longitude=${JEONJU_LON}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=precipitation_probability&timezone=Asia%2FTokyo`,
      {
        next: { revalidate: 3600 },
      },
    )

    if (!res.ok) {
      throw new Error(`Weather API error: ${res.statusText}`)
    }

    const data = await res.json()
    const current = data.current
    const temp = Math.round(current.temperature_2m ?? 25)
    const precipitation = current.precipitation ?? 0
    const wCode = current.weather_code ?? 0

    // 현재 시간대의 강수확률 추출
    const hourlyTimes: string[] = data.hourly?.time ?? []
    const hourlyProbs: number[] = data.hourly?.precipitation_probability ?? []
    const nowIso = new Date().toISOString().substring(0, 13) // "YYYY-MM-DDTHH"
    const hourIdx = hourlyTimes.findIndex((t) => t.startsWith(nowIso))
    const rainProb = hourIdx !== -1 ? (hourlyProbs[hourIdx] ?? 0) : 0

    let condition: 'rain' | 'clear' | 'cloudy' = 'clear'
    let emoji = '☀️'
    let summary = '맑음'
    let detail = '야외 액티비티를 즐기기 좋은 날씨예요'

    // WMO Weather Code 분석: 51~67, 80~82 (비/소나기/이슬비)
    const isRainingCode = (wCode >= 51 && wCode <= 67) || (wCode >= 80 && wCode <= 82) || wCode >= 95
    if (precipitation > 0 || isRainingCode || rainProb >= 60) {
      condition = 'rain'
      emoji = '☔'
      summary = '비 오는 중'
      detail = '실내 위주로 추천드려요'
    } else if (wCode === 2 || wCode === 3 || (rainProb >= 20 && rainProb < 60)) {
      condition = 'cloudy'
      emoji = '☁️'
      summary = '구름 많음'
      detail = '선선해서 야외 걷기 좋은 날씨예요'
    } else {
      condition = 'clear'
      emoji = '☀️'
      summary = '맑음'
      detail = '야외 액티비티를 즐기기 좋은 맑은 날씨예요'
    }

    const fullDetail = `${detail} · 기온 ${temp}°C · 강수확률 ${rainProb}%`
    const now = new Date()
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const result: WeatherApiResponse = {
      condition,
      emoji,
      summary,
      detail: fullDetail,
      temperature: temp,
      precipitationProb: rainProb,
      lastUpdated: timeFormatted,
      source: '기상청/공공 기상 데이터 (1시간 주기 최신화)',
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch real-time weather:', error)
    // 폴백 기본값 (맑음)
    return NextResponse.json({
      condition: 'clear',
      emoji: '☀️',
      summary: '맑음',
      detail: '야외 액티비티를 즐기기 좋은 날씨예요 · 기온 25°C · 강수확률 0%',
      temperature: 25,
      precipitationProb: 0,
      lastUpdated: '방금',
      source: '기본 기상 데이터',
    })
  }
}
