// ---------------------------------------------------------------------------
// 전주 여행 P들 어디가 — Admin 영업중/휴업 설정 & 실제 사용자 평점 집계 모듈
// ---------------------------------------------------------------------------

export type AdminPlaceStatusMap = Record<
  string,
  { isClosed: boolean; status: 'active' | 'review' | 'inactive' }
>

// 1. 특정 장소의 [영업중/휴업] 및 [승인 상태] 읽기
export const getAdminPlaceStatuses = (): AdminPlaceStatusMap => {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem('jeonju_admin_place_statuses')
    const localMap: AdminPlaceStatusMap = data ? JSON.parse(data) : {}

    // Vercel 프로덕션 전역 서버 동기화
    fetch('/api/admin/sync')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data?.placeStatuses) {
          const serverStatuses = resData.data.placeStatuses
          let updated = false
          Object.keys(serverStatuses).forEach((key) => {
            if (JSON.stringify(localMap[key]) !== JSON.stringify(serverStatuses[key])) {
              localMap[key] = serverStatuses[key]
              updated = true
            }
          })
          if (updated) {
            localStorage.setItem('jeonju_admin_place_statuses', JSON.stringify(localMap))
            window.dispatchEvent(new Event('jeonju_admin_status_changed'))
          }
        }
      })
      .catch(() => {})

    return localMap
  } catch (e) {
    return {}
  }
}

// 2. 특정 장소의 [영업중/휴업] 및 [승인 상태] 저장 (Local + Vercel Global Sync)
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
    window.dispatchEvent(new Event('jeonju_admin_status_changed'))

    // Vercel 글로벌 동기화 전송
    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SET_PLACE_STATUS',
        payload: { placeName, isClosed, status },
      }),
    }).catch(() => {})
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
    tags?: string[]
  }[]
}

// 5. localStorage의 사용자 저장 세션(jeonju_saved_courses_*)에서 "실제 사용자가 작성한" 평점만 100% 집계
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
          // 장소별 개별 평점 (날씨 조화 & 재미 점수 & 장소 한줄평)
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
              item.avgWeatherScore += Number(sr.weatherScore || 5)
              item.avgFunScore += Number(sr.funScore || 5)

              item.reviews.push({
                userName: userEmail.split('@')[0] || '사용자',
                weatherScore: Number(sr.weatherScore || 5),
                funScore: Number(sr.funScore || 5),
                comment: sr.comment ? sr.comment.trim() : (course.reviewContent || '만족스러운 방문이었습니다.'),
                date: course.reviewedAt || course.savedAt || '2026-07-30',
                tags: course.satisfactionTags || [],
              })
            })
          } else if (course.rating && course.spots && Array.isArray(course.spots)) {
            // 개별 장소 평점 없이 코스 평점만 존재하는 경우
            course.spots.forEach((spot: any) => {
              const sName = typeof spot === 'string' ? spot : spot.name
              if (!sName) return
              if (!summaries[sName]) {
                summaries[sName] = {
                  spotName: sName,
                  reviewCount: 0,
                  avgWeatherScore: 0,
                  avgFunScore: 0,
                  overallRating: 0,
                  reviews: [],
                }
              }

              const item = summaries[sName]
              item.reviewCount += 1
              item.avgWeatherScore += Number(course.rating || 5)
              item.avgFunScore += Number(course.rating || 5)

              if (course.reviewContent) {
                item.reviews.push({
                  userName: userEmail.split('@')[0] || '사용자',
                  weatherScore: Number(course.rating || 5),
                  funScore: Number(course.rating || 5),
                  comment: course.reviewContent.trim(),
                  date: course.reviewedAt || course.savedAt || '2026-07-30',
                  tags: course.satisfactionTags || [],
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

// 6. Admin용 회원가입 유저 데이터 구조
export interface RegisteredUserInfo {
  name: string
  email: string
  travelStyle?: string
  createdAt?: string
  savedCoursesCount: number
  reviewsCount: number
}

// 7. LocalStorage & 영구 서버 파일 백업 기반 회원가입 유저 목록 및 활동 통계 읽기
export const getAdminRegisteredUsers = (): RegisteredUserInfo[] => {
  if (typeof window === 'undefined') return []
  try {
    const rawData =
      localStorage.getItem('jeonju_users') || localStorage.getItem('jeonju_users_backup')
    const users = rawData ? JSON.parse(rawData) : []

    // 🛡️ 백그라운드 서버 영구 백업 API 비동기 복구 동기화
    fetch('/api/admin/backup-users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          const localStr = localStorage.getItem('jeonju_users')
          const localList = localStr ? JSON.parse(localStr) : []
          if (data.users.length > localList.length) {
            localStorage.setItem('jeonju_users', JSON.stringify(data.users))
            localStorage.setItem('jeonju_users_backup', JSON.stringify(data.users))
            window.dispatchEvent(new Event('jeonju_user_registered'))
          }
        }
      })
      .catch(() => {})

    return users.map((u: any) => {
      const email = u.email ? u.email.toLowerCase() : ''
      const key = `jeonju_saved_courses_${email}`
      const courseStr = localStorage.getItem(key)
      const courses = courseStr ? JSON.parse(courseStr) : []

      const reviewsCount = courses.filter(
        (c: any) => c.rating || (c.spotRatings && c.spotRatings.length > 0)
      ).length

      return {
        name: u.name || '회원',
        email: u.email || 'user@jeonju.com',
        travelStyle: u.travelStyle || 'P',
        createdAt: u.createdAt
          ? new Date(u.createdAt).toISOString().slice(0, 16).replace('T', ' ')
          : '2026-07-30 16:00',
        savedCoursesCount: courses.length,
        reviewsCount: reviewsCount,
      }
    })
  } catch (e) {
    return []
  }
}

// 8. Admin 회원 관리 - 회원 탈퇴 처리 (로컬 + 서버 파일 백업 동시 삭제)
export const deleteAdminUser = (email: string): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const rawData =
      localStorage.getItem('jeonju_users') || localStorage.getItem('jeonju_users_backup')
    if (!rawData) return false
    const users = JSON.parse(rawData)
    const filtered = users.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase())

    localStorage.setItem('jeonju_users', JSON.stringify(filtered))
    localStorage.setItem('jeonju_users_backup', JSON.stringify(filtered))
    localStorage.removeItem(`jeonju_saved_courses_${email.toLowerCase()}`)

    // 🛡️ 서버 파일 백업에서도 동시 삭제
    fetch(`/api/admin/backup-users?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    }).catch(() => {})

    window.dispatchEvent(new Event('jeonju_user_registered'))
    return true
  } catch (e) {
    return false
  }
}
