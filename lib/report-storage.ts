// ---------------------------------------------------------------------------
// 전주 여행 P들 어디가 — 실사용자 오류 신고 관리 및 동기화 모듈
// ---------------------------------------------------------------------------

export interface UserReportItem {
  id: string
  placeName: string
  reportType: string
  content: string
  createdAt: string
  status: 'pending' | 'processing' | 'resolved'
}

// 1. 저장된 실사용자 오류 신고 목록 읽기 (Local + Vercel Global Sync)
export const getStoredReports = (): UserReportItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('jeonju_user_reports')
    const reports: UserReportItem[] = data ? JSON.parse(data) : []

    // Vercel 프로덕션 전역 서버 동기화
    fetch('/api/admin/sync')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data?.reports)) {
          const serverReports = resData.data.reports
          if (serverReports.length > reports.length) {
            localStorage.setItem('jeonju_user_reports', JSON.stringify(serverReports))
            window.dispatchEvent(new Event('jeonju_report_submitted'))
          }
        }
      })
      .catch(() => {})

    return reports
  } catch (e) {
    return []
  }
}

// 2. 소비자가 프론트엔드에서 신규 오류 신고 접수
export const addReportToStorage = (report: {
  placeName: string
  reportType: string
  content: string
}) => {
  if (typeof window === 'undefined') return
  try {
    const existing = getStoredReports()
    const newReport: UserReportItem = {
      id: `rep_${Date.now()}`,
      placeName: report.placeName,
      reportType: report.reportType,
      content: report.content,
      createdAt: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'pending',
    }

    const updated = [newReport, ...existing]
    localStorage.setItem('jeonju_user_reports', JSON.stringify(updated))
    window.dispatchEvent(new Event('jeonju_report_submitted'))

    // Vercel 글로벌 동기화 전송
    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'SUBMIT_REPORT', payload: newReport }),
    }).catch(() => {})
  } catch (e) {}
}

// 3. Admin에서 신고 처리 상태 업데이트 (접수 ➔ 확인중 ➔ 해결완료)
export const updateReportStatusInStorage = (
  id: string,
  status: 'pending' | 'processing' | 'resolved'
) => {
  if (typeof window === 'undefined') return
  try {
    const existing = getStoredReports()
    const updated = existing.map((r) => (r.id === id ? { ...r, status } : r))
    localStorage.setItem('jeonju_user_reports', JSON.stringify(updated))
    window.dispatchEvent(new Event('jeonju_report_submitted'))

    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'UPDATE_REPORT_STATUS', payload: { id, status } }),
    }).catch(() => {})
  } catch (e) {}
}

// 4. Admin에서 신고 항목 삭제 처리
export const deleteReportFromStorage = (id: string) => {
  if (typeof window === 'undefined') return
  try {
    const existing = getStoredReports()
    const updated = existing.filter((r) => r.id !== id)
    localStorage.setItem('jeonju_user_reports', JSON.stringify(updated))
    window.dispatchEvent(new Event('jeonju_report_submitted'))

    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'DELETE_REPORT', payload: { id } }),
    }).catch(() => {})
  } catch (e) {}
}
