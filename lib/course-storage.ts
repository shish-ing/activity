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
