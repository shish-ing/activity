// ---------------------------------------------------------------------------
// 전주 여행 P들 어디가 — Admin 영업중/휴업 설정 & 실제 사용자 평점 집계 모듈
// ---------------------------------------------------------------------------

export type AdminPlaceStatusMap = Record<
  string,
  { isClosed: boolean; status: 'active' | 'review' | 'inactive' }
>

// 1. Admin에서 설정한 장소별 영업중/휴업 상태 읽기
export const getAdminPlaceStatuses = (): AdminPlaceStatusMap => {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem('jeonju_admin_place_statuses')
    return data ? JSON.parse(data) : {}
  } catch (e) {
    return {}
  }
}

// 2. Admin에서 장소 영업중/휴업 설정 저장
export const setAdminPlaceStatus = (
  placeName: string,
  isClosed: boolean,
  status: 'active' | 'review' | 'inactive' = 'active'
) => {
  if (typeof window === 'undefined') return
  try {
    const current = getAdminPlaceStatuses()
    current[placeName] = { isClosed, status }
    localStorage.setItem('jeonju_admin_place_statuses', JSON.stringify(current))
    // 실시간 동기화 이벤트 발생
    window.dispatchEvent(new Event('jeonju_admin_status_changed'))
  } catch (e) {}
}

// 3. 해당 장소가 관리자에 의해 휴업(임시휴업) 처리되었는지 확인
export const isPlaceClosedByAdmin = (placeName: string): boolean => {
  const statuses = getAdminPlaceStatuses()
  return statuses[placeName]?.isClosed ?? false
}

// 4. 실제 사용자 작성 평점 및 후기 집계 데이터 타입
export interface RealSpotRatingSummary {
  spotName: string
  reviewCount: number
  avgWeatherScore: number // 0.0 ~ 5.0 (작성된 평점 없으면 0.0)
  avgFunScore: number // 0.0 ~ 5.0 (작성된 평점 없으면 0.0)
  overallRating: number // 0.0 ~ 5.0 (작성된 평점 없으면 0.0)
  reviews: {
    userName: string
    weatherScore: number
    funScore: number
    comment: string
    date: string
  }[]
}

// 5. localStorage의 사용자 저장 세션(jeonju_saved_courses_*)에서 "실제 남긴" 평점만 순수하게 집계
export const getRealSpotRatingSummaries = (): Record<string, RealSpotRatingSummary> => {
  if (typeof window === 'undefined') return {}
  try {
    const summaries: Record<string, RealSpotRatingSummary> = {}

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('jeonju_saved_courses_')) {
        const userEmail = key.replace('jeonju_saved_courses_', '')
        const coursesStr = localStorage.getItem(key)
        if (!coursesStr) continue
        const courses = JSON.parse(coursesStr)

        courses.forEach((course: any) => {
          if (course.spotRatings && Array.isArray(course.spotRatings)) {
            course.spotRatings.forEach((sr: any) => {
              if (!sr.spotName) return
              if (!summaries[sr.spotName]) {
                summaries[sr.spotName] = {
                  spotName: sr.spotName,
                  reviewCount: 0,
                  avgWeatherScore: 0,
                  avgFunScore: 0,
                  overallRating: 0,
                  reviews: [],
                }
              }

              const item = summaries[sr.spotName]
              item.reviewCount += 1
              item.avgWeatherScore += Number(sr.weatherScore || 0)
              item.avgFunScore += Number(sr.funScore || 0)

              if (sr.comment && sr.comment.trim()) {
                item.reviews.push({
                  userName: userEmail.split('@')[0] || '사용자',
                  weatherScore: Number(sr.weatherScore || 0),
                  funScore: Number(sr.funScore || 0),
                  comment: sr.comment.trim(),
                  date: course.reviewedAt || course.savedAt || '2026-07-30',
                })
              }
            })
          }
        })
      }
    }

    // 실제 작성된 평점 평균 계산
    Object.values(summaries).forEach((item) => {
      if (item.reviewCount > 0) {
        const wAvg = item.avgWeatherScore / item.reviewCount
        const fAvg = item.avgFunScore / item.reviewCount
        item.avgWeatherScore = Number(wAvg.toFixed(1))
        item.avgFunScore = Number(fAvg.toFixed(1))
        item.overallRating = Number(((wAvg + fAvg) / 2).toFixed(1))
      }
    })

    return summaries
  } catch (e) {
    return {}
  }
}
