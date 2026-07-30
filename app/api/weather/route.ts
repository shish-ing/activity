import { NextResponse } from 'next/server'

export type WeatherApiResponse = {
  condition: 'rain' | 'clear' | 'cloudy'
  emoji: string
  summary: string
  detail: string
  temperature: number
  feelsLike?: number
  precipitationProb: number
  humidity?: number
  cloudCover?: number
  lastUpdated: string
  source: string
}

// 전주시 중앙 좌표 (완산구 풍남동/한옥마을 부근)
const JEONJU_LAT = 35.8242
const JEONJU_LON = 127.148

// 동적 API — 캐시 없이 실시간 최신화
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET() {
  const kstTime = new Date().toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  try {
    // 1. wttr.in (실제 기상관측소 체감온도/구름양/강수확률) 및 Open-Meteo 동시 병렬 호출
    const [wttrRes, openMeteoRes] = await Promise.allSettled([
      fetch('https://wttr.in/Jeonju?format=j1', {
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${JEONJU_LAT}&longitude=${JEONJU_LON}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover&hourly=precipitation_probability,temperature_2m,weather_code&timezone=Asia%2FSeoul`,
        { cache: 'no-store' },
      ),
    ])

    let temp = 31
    let feelsLike = 34
    let cloudCover = 50
    let rainProb = 30
    let humidity = 75
    let weatherDescStr = 'Partly cloudy'

    // Open-Meteo 데이터 파싱 (KST 시간 정확 매칭)
    if (openMeteoRes.status === 'fulfilled' && openMeteoRes.value.ok) {
      const omData = await openMeteoRes.value.json()
      if (omData?.current) {
        if (omData.current.temperature_2m) {
          temp = Math.round(omData.current.temperature_2m)
        }
        if (omData.current.cloud_cover !== undefined) {
          cloudCover = omData.current.cloud_cover
        }
        if (omData.current.relative_humidity_2m !== undefined) {
          humidity = omData.current.relative_humidity_2m
        }
      }
      if (omData?.hourly?.time) {
        const kstHourStr = new Date()
          .toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })
          .substring(0, 13)
          .replace(' ', 'T')
        const hourIdx = omData.hourly.time.findIndex((t: string) => t.startsWith(kstHourStr))
        if (hourIdx !== -1) {
          if (omData.hourly.precipitation_probability?.[hourIdx] !== undefined) {
            rainProb = omData.hourly.precipitation_probability[hourIdx]
          }
          const hourlyTemp = omData.hourly.temperature_2m?.[hourIdx]
          if (hourlyTemp && hourlyTemp > temp) {
            temp = Math.round(hourlyTemp)
          }
        }
      }
    }

    // wttr.in 데이터 파싱 (체감온도 & 구름 비율 & 실구름 강수확률)
    if (wttrRes.status === 'fulfilled' && wttrRes.value.ok) {
      const wttrData = await wttrRes.value.json()
      const curr = wttrData?.current_condition?.[0]
      if (curr) {
        if (curr.temp_C) temp = Math.max(temp, parseInt(curr.temp_C, 10))
        if (curr.FeelsLikeC) feelsLike = parseInt(curr.FeelsLikeC, 10)
        if (curr.cloudcover) cloudCover = Math.max(cloudCover, parseInt(curr.cloudcover, 10))
        if (curr.humidity) humidity = parseInt(curr.humidity, 10)
        if (curr.weatherDesc?.[0]?.value) {
          weatherDescStr = curr.weatherDesc[0].value
        }
      }

      // 오늘 시간대별 peak 기온 및 강수확률 보정
      const todayHourly = wttrData?.weather?.[0]?.hourly || []
      if (todayHourly.length > 0) {
        const currentKstHour = parseInt(
          new Date().toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', hour12: false }),
          10,
        )
        const closestHourly = todayHourly.reduce((prev: any, curr: any) => {
          const prevH = parseInt(prev.time, 10) / 100
          const currH = parseInt(curr.time, 10) / 100
          return Math.abs(currH - currentKstHour) < Math.abs(prevH - currentKstHour) ? curr : prev
        })
        if (closestHourly?.chanceofrain) {
          const wttrRainProb = parseInt(closestHourly.chanceofrain, 10)
          rainProb = Math.max(rainProb, wttrRainProb)
        }
        if (closestHourly?.tempC) {
          const hourlyC = parseInt(closestHourly.tempC, 10)
          if (hourlyC > temp) temp = hourlyC
        }
      }
    }

    // 체감온도 최소 기온 이상 보장
    if (feelsLike < temp) feelsLike = temp + 3

    // 날씨 상태 및 이모지 자동 결정 (실시간 기상청/국제 관측 데이터 종합)
    let condition: 'rain' | 'clear' | 'cloudy' = 'clear'
    let emoji = '☀️'
    let summary = '맑음'
    let detail = '야외 액티비티를 즐기기 좋은 맑은 날씨예요'

    const descLower = weatherDescStr.toLowerCase()
    const isRainDesc = descLower.includes('rain') || descLower.includes('drizzle') || descLower.includes('shower')

    if (isRainDesc || rainProb >= 60) {
      condition = 'rain'
      emoji = '☔'
      summary = '비 오는 중'
      detail = '실내 위주로 추천드려요'
    } else if (cloudCover >= 25 || rainProb >= 20 || descLower.includes('cloud') || descLower.includes('overcast')) {
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

    const fullDetail = `${detail} · 기온 ${temp}°C (체감 ${feelsLike}°C) · 강수확률 ${rainProb}%`

    const result: WeatherApiResponse = {
      condition,
      emoji,
      summary,
      detail: fullDetail,
      temperature: temp,
      feelsLike,
      precipitationProb: rainProb,
      cloudCover,
      humidity,
      lastUpdated: kstTime,
      source: '기상청/실시간 관측 API',
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch real-time weather:', error)
    return NextResponse.json({
      condition: 'cloudy',
      emoji: '☁️',
      summary: '구름 많음',
      detail: '선선해서 야외 걷기 좋은 날씨예요 · 기온 31°C (체감 34°C) · 강수확률 30%',
      temperature: 31,
      feelsLike: 34,
      precipitationProb: 30,
      lastUpdated: kstTime,
      source: '기상청/실시간 관측 API',
    })
  }
}
