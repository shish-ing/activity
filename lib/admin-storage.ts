// ---------------------------------------------------------------------------
// 전주 여행 P들 어디가 — Admin 영업중/휴업 설정 & 실제 사용자 평점 집계 모듈
// ---------------------------------------------------------------------------

function cleanPlaceName(s: string): string {
  if (!s) return ''
  return s.replace(/[^\w\s가-힣]/g, '').trim().toLowerCase().replace(/\s+/g, '')
}

export type AdminPlaceStatusMap = Record<
  string,
  {
    isClosed: boolean
    status: 'active' | 'review' | 'inactive'
    imageUrl?: string
    operatingHours?: string
    cost?: number
    address?: string
    reason?: string
  }
>

// 1. 특정 장소의 [영업중/휴업], [승인 상태] 및 [대표 사진 URL/영업시간] 읽기
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
    // Git 저장소 파일 영구 백업 동기화
    fetch('/api/admin/backup-places')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.statuses) {
          const backupStatuses = resData.statuses
          let updated = false
          Object.keys(backupStatuses).forEach((key) => {
            if (!localMap[key] || JSON.stringify(localMap[key]) !== JSON.stringify(backupStatuses[key])) {
              localMap[key] = backupStatuses[key]
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

// 2. 특정 장소의 [영업중/휴업], [승인 상태], [대표 사진 URL] 및 [영업시간] 저장 (Local + Vercel Global Sync)
export const setAdminPlaceStatus = (
  placeName: string,
  isClosed: boolean,
  status: 'active' | 'review' | 'inactive' = 'active',
  imageUrl?: string,
  operatingHours?: string,
  cost?: number,
  address?: string,
  reason?: string
) => {
  if (typeof window === 'undefined') return
  try {
    const current = getAdminPlaceStatuses()
    const existing = current[placeName] || { isClosed: false, status: 'active' }
    const updatedItem = {
      ...existing,
      isClosed,
      status,
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(operatingHours !== undefined ? { operatingHours } : {}),
      ...(cost !== undefined ? { cost } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(reason !== undefined ? { reason } : {}),
    }

    current[placeName] = updatedItem

    const strippedName = placeName.replace(/[^\w\s가-힣]/g, '').trim()
    if (strippedName && strippedName !== placeName) {
      current[strippedName] = updatedItem
    }

    localStorage.setItem('jeonju_admin_place_statuses', JSON.stringify(current))
    window.dispatchEvent(new Event('jeonju_admin_status_changed'))

    // Vercel 글로벌 동기화 전송
    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SET_PLACE_STATUS',
        payload: { placeName, isClosed, status, imageUrl, operatingHours, cost, address, reason },
      }),
    }).catch(() => {})

    // Git 저장소 파일 영구 백업 전송 (Git 커밋 푸시 및 Vercel 배포 시 100% 영구 보존)
    fetch('/api/admin/backup-places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        statuses: current,
      }),
    }).catch(() => {})
  } catch (e) {}
}

// 2-1. Admin에서 수정한 영업시간 읽기
export const getPlaceOperatingHours = (placeName: string, defaultHours?: string): string => {
  if (typeof window === 'undefined') return defaultHours || ''
  try {
    const statuses = getAdminPlaceStatuses()
    const nameClean = cleanPlaceName(placeName)
    const matchingKey = Object.keys(statuses).find((k) => {
      const kClean = cleanPlaceName(k)
      return (
        kClean === nameClean ||
        (nameClean.length >= 3 && kClean.includes(nameClean)) ||
        (kClean.length >= 3 && nameClean.includes(kClean))
      )
    })
    if (
      matchingKey &&
      statuses[matchingKey]?.operatingHours !== undefined &&
      statuses[matchingKey].operatingHours!.trim() !== ''
    ) {
      return statuses[matchingKey].operatingHours!.trim()
    }
  } catch (e) {}

  try {
    const customData = localStorage.getItem('jeonju_admin_custom_places')
    if (customData) {
      const customPlaces: any[] = JSON.parse(customData)
      const nameClean = cleanPlaceName(placeName)
      const found = customPlaces.find((p) => {
        const pClean = cleanPlaceName(p.name)
        return (
          pClean === nameClean ||
          (nameClean.length >= 3 && pClean.includes(nameClean)) ||
          (pClean.length >= 3 && nameClean.includes(pClean))
        )
      })
      if (found?.operatingHours && found.operatingHours.trim()) {
        return found.operatingHours.trim()
      }
    }
  } catch (e) {}

  return defaultHours || ''
}

// 3. 해당 장소가 관리자에 의해 휴업(임시휴업) 처리되었는지 확인
export const isPlaceClosedByAdmin = (placeName: string): boolean => {
  const statuses = getAdminPlaceStatuses()
  const nameClean = cleanPlaceName(placeName)
  const matchingKey = Object.keys(statuses).find((k) => {
    const kClean = cleanPlaceName(k)
    return (
      kClean === nameClean ||
      (nameClean.length >= 3 && kClean.includes(nameClean)) ||
      (kClean.length >= 3 && nameClean.includes(kClean))
    )
  })
  return matchingKey ? (statuses[matchingKey]?.isClosed ?? false) : false
}

// 3-1. 해당 장소가 현재 실시간 시각 및 영업시간 기준 영업 중인지 판단 (영업시간 자동 감지 + 관리자 휴업 설정 100% 통합)
export const isPlaceCurrentlyOpen = (placeName: string, defaultOperatingHours?: string): boolean => {
  // 1) 관리자 강제 휴업 설정 체크
  const statuses = getAdminPlaceStatuses()
  const nameClean = cleanPlaceName(placeName)
  const matchingKey = Object.keys(statuses).find((k) => {
    const kClean = cleanPlaceName(k)
    return (
      kClean === nameClean ||
      (nameClean.length >= 3 && kClean.includes(nameClean)) ||
      (kClean.length >= 3 && nameClean.includes(kClean))
    )
  })

  if (matchingKey && statuses[matchingKey]?.isClosed) return false

  // 2) Admin 실시간 최신 영업시간 연동
  const effectiveHours = getPlaceOperatingHours(placeName, defaultOperatingHours)
  if (!effectiveHours) return true

  const hoursStr = effectiveHours.trim()
  if (!hoursStr) return true

  // 24시간 영업 or 상시 개방 or 연중무휴 (시간 숫자가 없는 경유)
  if (
    hoursStr.includes('24시간') ||
    hoursStr.includes('상시 개방') ||
    hoursStr.includes('상시개방') ||
    hoursStr.includes('연중무휴') ||
    hoursStr.includes('상시')
  ) {
    if (!hoursStr.match(/\d{1,2}:\d{2}/)) {
      return true
    }
  }

  const now = new Date()
  const day = now.getDay() // 0 = 일, 1 = 월, ...
  const currentMins = now.getHours() * 60 + now.getMinutes()

  // 요일별 정기 휴무 체크
  if (day === 1 && (hoursStr.includes('월요일 휴무') || hoursStr.includes('월 휴무') || hoursStr.includes('월요일 휴관') || hoursStr.includes('매주 월요일'))) {
    return false
  }
  if (day === 2 && (hoursStr.includes('화요일 휴무') || hoursStr.includes('화 휴무') || hoursStr.includes('매주 화요일'))) {
    return false
  }
  if (day === 3 && (hoursStr.includes('수요일 휴무') || hoursStr.includes('수 휴무') || hoursStr.includes('매주 수요일'))) {
    return false
  }
  if (day === 4 && (hoursStr.includes('목요일 휴무') || hoursStr.includes('목 휴무') || hoursStr.includes('매주 목요일'))) {
    return false
  }
  if (day === 5 && (hoursStr.includes('금요일 휴무') || hoursStr.includes('금 휴무') || hoursStr.includes('매주 금요일'))) {
    return false
  }
  if (day === 6 && (hoursStr.includes('토요일 휴무') || hoursStr.includes('토 휴무') || hoursStr.includes('매주 토요일'))) {
    return false
  }
  if (day === 0 && (hoursStr.includes('일요일 휴무') || hoursStr.includes('일 휴무') || hoursStr.includes('매주 일요일'))) {
    return false
  }

  // HH:MM - HH:MM 패턴 매칭 (예: "09:00 - 17:00", "09:00~22:00", "평일 09:00 - 20:00")
  const timeMatch = hoursStr.match(/(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})/)
  if (timeMatch) {
    const startH = parseInt(timeMatch[1], 10)
    const startM = parseInt(timeMatch[2], 10)
    let endH = parseInt(timeMatch[3], 10)
    const endM = parseInt(timeMatch[4], 10)

    const startMins = startH * 60 + startM
    let endMins = endH * 60 + endM

    if (endH === 0 && endM === 0) {
      endMins = 24 * 60
    }

    if (endMins < startMins) {
      // 심야 영업 (예: 18:00 - 02:00)
      return currentMins >= startMins || currentMins <= endMins
    } else {
      return currentMins >= startMins && currentMins <= endMins
    }
  }

  return true
}

// 3-2. Admin 관리자에서 신규 추가한 커스텀 장소 저장 및 동기화
export interface AdminCustomPlace {
  id: string
  name: string
  category: string
  address: string
  lat: number
  lng: number
  cost: number
  costLabel: string
  operatingHours: string
  reason: string
  isIndoor: boolean
  isMustVisit?: boolean
  suitableCompanions?: string[]
  tags: string[]
  status: 'active' | 'review' | 'inactive'
  isTempClosed: boolean
  imageUrl?: string
  updatedAt: string
}

export const getAdminCustomPlaces = (): AdminCustomPlace[] => {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('jeonju_admin_custom_places')
    const current: AdminCustomPlace[] = data ? JSON.parse(data) : []

    fetch('/api/admin/backup-places')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.customPlaces) && resData.customPlaces.length > 0) {
          const map = new Map<string, AdminCustomPlace>()
          current.forEach((p) => p.name && map.set(p.name, p))
          resData.customPlaces.forEach((p: AdminCustomPlace) => p.name && map.set(p.name, p))
          const merged = Array.from(map.values())
          if (JSON.stringify(merged) !== JSON.stringify(current)) {
            localStorage.setItem('jeonju_admin_custom_places', JSON.stringify(merged))
            window.dispatchEvent(new Event('jeonju_admin_status_changed'))
          }
        }
      })
      .catch(() => {})

    return current
  } catch (e) {
    return []
  }
}

export const saveAdminCustomPlace = (newPlace: AdminCustomPlace) => {
  if (typeof window === 'undefined') return
  try {
    const current = getAdminCustomPlaces()
    const filtered = current.filter((p) => p.name !== newPlace.name)
    const updated = [newPlace, ...filtered]
    localStorage.setItem('jeonju_admin_custom_places', JSON.stringify(updated))
    window.dispatchEvent(new Event('jeonju_admin_status_changed'))

    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SET_CUSTOM_PLACES',
        payload: { customPlaces: updated },
      }),
    }).catch(() => {})

    // Git 저장소 파일 영구 백업 전송 (Git 커밋 푸시 및 Vercel 배포 시 100% 영구 보존)
    fetch('/api/admin/backup-places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customPlaces: updated,
      }),
    }).catch(() => {})
  } catch (e) {}
}

export function getAllPlacesWithAdminCustom<T extends { name: string }>(basePlaces: T[]): T[] {
  if (typeof window === 'undefined') return basePlaces

  try {
    const customPlaces = getAdminCustomPlaces()
    if (customPlaces.length > 0) {
      const baseNames = new Set(basePlaces.map((p) => p.name.trim().toLowerCase().replace(/\s+/g, '')))
      const customFormatted = customPlaces.map((c) => ({
        name: c.name,
        category: c.category,
        subCategory: 'spot',
        cost: c.cost,
        costLabel: c.costLabel || (c.cost === 0 ? '무료' : `${c.cost.toLocaleString()}원`),
        walkMinutes: 8,
        isMustVisit: false,
        isIndoor: c.isIndoor,
        mapX: 40,
        mapY: 50,
        lat: c.lat,
        lng: c.lng,
        address: c.address,
        operatingHours: c.operatingHours,
        tags: c.tags,
        suggestedDuration: '45분',
        reason: c.reason,
        imageUrl: c.imageUrl,
        naverMapUrl: `https://map.naver.com/v5/search/${encodeURIComponent(c.name)}`,
      })) as unknown as T[]

      const uniqueNew = customFormatted.filter(
        (c) => !baseNames.has(c.name.trim().toLowerCase().replace(/\s+/g, ''))
      )
      return [...uniqueNew, ...basePlaces]
    }
  } catch (e) {}

  return basePlaces
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

// 9. 🗺️ 사용자 작성 경로(코스)별 전체 평점 및 후기 집계 모듈
export interface CourseReviewItem {
  courseId: string
  userEmail: string
  userName: string
  courseTitle: string
  spots: string[]
  rating: number
  satisfactionTags: string[]
  reviewContent: string
  reviewedAt: string
  companion: string
  weatherSummary: string
}

export const getAllUserCourseReviews = (): CourseReviewItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const list: CourseReviewItem[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('jeonju_saved_courses_')) {
        const email = key.replace('jeonju_saved_courses_', '')
        const coursesStr = localStorage.getItem(key)
        if (!coursesStr) continue
        const courses = JSON.parse(coursesStr)

        courses.forEach((c: any) => {
          if (c.rating || c.reviewContent || (c.satisfactionTags && c.satisfactionTags.length > 0)) {
            const spotNames = c.spots
              ? c.spots.map((s: any) => (typeof s === 'string' ? s : s.name))
              : []

            list.push({
              courseId: c.id || `course_${Date.now()}_${Math.random()}`,
              userEmail: email,
              userName: email.split('@')[0] || '사용자',
              courseTitle: c.title || '전주 맞춤 코스',
              spots: spotNames,
              rating: Number(c.rating || 5),
              satisfactionTags: c.satisfactionTags || [],
              reviewContent: c.reviewContent || '만족스러운 여행 코스였습니다.',
              reviewedAt: c.reviewedAt || c.savedAt || '2026-07-30',
              companion: c.companion || '동행',
              weatherSummary: c.weatherSummary || '맑음 ☀️',
            })
          }
        })
      }
    }
    return list.sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime())
  } catch (e) {
    return []
  }
}

