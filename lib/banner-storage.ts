// ---------------------------------------------------------------------------
// 전주 여행 P들 어디가 — 메인 축제 & 팝업 스토어 이벤트 배너 저장소
// ---------------------------------------------------------------------------

export interface EventBannerItem {
  id: string
  category: string // e.g. '🎉 축제·행사' | '🎁 팝업스토어' | '🌙 야간이벤트' | '🍲 푸드페스타'
  title: string
  period: string // e.g. '2026.08.01 ~ 08.10'
  location: string // e.g. '전주 경기전 & 태조로 일원'
  description: string
  badgeColor?: 'amber' | 'emerald' | 'sky' | 'purple' | 'rose'
  isActive: boolean
  updatedAt: string
}

// 📌 기본 시드 팝업 & 축제 배너 목록 (상시 보장)
export const INITIAL_BANNERS: EventBannerItem[] = [
  {
    id: 'banner_1',
    category: '🎉 축제·행사',
    title: '2026 전주 한옥마을 야행 (夜行)',
    period: '2026.08.01 ~ 08.10 (매일 18:00~23:00)',
    location: '전주 경기전 & 태조로 거리 일원',
    description: '달빛 아래 수놓아지는 낭만 한옥 야경 탐방과 전통 가야금 연주회 & 밤빛 포토존 페스티벌',
    badgeColor: 'amber',
    isActive: true,
    updatedAt: '2026-07-30 20:00',
  },
  {
    id: 'banner_2',
    category: '🎁 팝업스토어',
    title: '전주 청년 아티스트 한옥 팝업스토어',
    period: '이번 주말 특별 오픈 (토/일 11:00~19:00)',
    location: '전주 팔복예술공장 B동 & 한옥마을',
    description: '전주 로컬 디자이너 20팀의 수제 한지 굿즈, 공방 일러스트 굿즈 및 한정판 수제 에디션',
    badgeColor: 'purple',
    isActive: true,
    updatedAt: '2026-07-30 20:00',
  },
  {
    id: 'banner_3',
    category: '🍺 푸드페스타',
    title: '2026 전주 가맥 & 전통 모주 쿨 페스타',
    period: '2026.08.15 ~ 08.20 (6일간)',
    location: '전주 종합경기장 & 남부시장 가맥거리',
    description: '당일 생산된 당일 가맥 맥주와 달콤 시원한 전통 모주 칵테일을 즐기는 로컬 피서 페스티벌!',
    badgeColor: 'emerald',
    isActive: true,
    updatedAt: '2026-07-30 20:00',
  },
]

// 1. 등록된 이벤트 배너 목록 동기식 안전 읽기 (상시 100% 리턴 보장)
export const getAdminBanners = (): EventBannerItem[] => {
  if (typeof window === 'undefined') return INITIAL_BANNERS
  try {
    const data = localStorage.getItem('jeonju_admin_banners')
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {}

  // LocalStorage 데이터가 없거나 손상되었으면 INITIAL_BANNERS 복원 및 저장
  try {
    localStorage.setItem('jeonju_admin_banners', JSON.stringify(INITIAL_BANNERS))
  } catch (e) {}
  return INITIAL_BANNERS
}

// 2. 활성화된 배너만 필터링 (항상 최소 1개 이상 배너 반환 보장)
export const getActiveBanners = (): EventBannerItem[] => {
  const all = getAdminBanners()
  const active = all.filter((b) => b && b.isActive !== false)
  if (active.length > 0) return active
  if (all.length > 0) return all
  return INITIAL_BANNERS
}

// 3. 배너 목록 저장 및 이벤트 전파
export const saveAdminBanners = (banners: EventBannerItem[]) => {
  if (typeof window === 'undefined') return
  try {
    const validBanners = Array.isArray(banners) && banners.length > 0 ? banners : INITIAL_BANNERS
    localStorage.setItem('jeonju_admin_banners', JSON.stringify(validBanners))
    window.dispatchEvent(new Event('jeonju_banners_changed'))

    // Vercel 글로벌 동기화 전송
    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SET_BANNERS',
        payload: validBanners,
      }),
    }).catch(() => {})
  } catch (e) {}
}
