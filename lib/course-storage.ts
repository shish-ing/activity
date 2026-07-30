export interface SpotRating {
  spotName: string
  weatherScore: number // 1 ~ 5점 (날씨 조화 점수)
  funScore: number // 1 ~ 5점 (재미/만족도 점수)
  comment?: string // 장소별 미니 후기
}

export interface SavedCourseSpot {
  name: string
  category: string
  costLabel: string
}

export interface SavedCourse {
  id: string
  title: string
  savedAt: string
  startLocation?: string
  startAddress?: string
  mustVisit?: string
  timeOption: string
  weatherSummary: string
  weatherEmoji: string
  weatherParam?: string
  companion: string
  transport: string
  totalBudget: number
  totalCost: number
  totalTravelMinutes: number
  spots: SavedCourseSpot[]
  savedPlaces?: any[]

  // ✍️ 저장한 코스별 평점 & 후기
  rating?: number // 1 ~ 5점
  satisfactionTags?: string[]
  reviewContent?: string
  reviewedAt?: string
  spotRatings?: SpotRating[]
}

export const getSavedCourses = (userEmail: string): SavedCourse[] => {
  if (typeof window === 'undefined' || !userEmail) return []
  try {
    const key = `jeonju_saved_courses_${userEmail.toLowerCase()}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

export const saveCourseToUser = (userEmail: string, course: Omit<SavedCourse, 'id' | 'savedAt'>): { success: boolean; isDuplicate?: boolean } => {
  if (typeof window === 'undefined' || !userEmail) return { success: false }
  try {
    const key = `jeonju_saved_courses_${userEmail.toLowerCase()}`
    const existing = getSavedCourses(userEmail)

    const newCourse: SavedCourse = {
      ...course,
      id: `course_${Date.now()}`,
      savedAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    const updated = [newCourse, ...existing]
    localStorage.setItem(key, JSON.stringify(updated))
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}

export const deleteCourseFromUser = (userEmail: string, courseId: string): boolean => {
  if (typeof window === 'undefined' || !userEmail) return false
  try {
    const key = `jeonju_saved_courses_${userEmail.toLowerCase()}`
    const existing = getSavedCourses(userEmail)
    const updated = existing.filter((c) => c.id !== courseId)
    localStorage.setItem(key, JSON.stringify(updated))
    return true
  } catch (e) {
    return false
  }
}

// ✍️ 저장한 코스의 평점 및 후기 업데이트/삭제 함수
export const updateCourseReviewInStorage = (
  userEmail: string,
  courseId: string,
  review: {
    rating: number
    satisfactionTags: string[]
    reviewContent: string
    spotRatings?: SpotRating[]
  }
): boolean => {
  if (typeof window === 'undefined' || !userEmail) return false
  try {
    const key = `jeonju_saved_courses_${userEmail.toLowerCase()}`
    const existing = getSavedCourses(userEmail)
    const updated = existing.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          rating: review.rating,
          satisfactionTags: review.satisfactionTags,
          reviewContent: review.reviewContent,
          spotRatings: review.spotRatings,
          reviewedAt: new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      }
      return c
    })
    localStorage.setItem(key, JSON.stringify(updated))
    return true
  } catch (e) {
    return false
  }
}

export const deleteCourseReviewFromStorage = (
  userEmail: string,
  courseId: string
): boolean => {
  if (typeof window === 'undefined' || !userEmail) return false
  try {
    const key = `jeonju_saved_courses_${userEmail.toLowerCase()}`
    const existing = getSavedCourses(userEmail)
    const updated = existing.map((c) => {
      if (c.id === courseId) {
        const { rating, satisfactionTags, reviewContent, reviewedAt, spotRatings, ...rest } = c
        return rest
      }
      return c
    })
    localStorage.setItem(key, JSON.stringify(updated))
    return true
  } catch (e) {
    return false
  }
}
