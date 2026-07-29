// ---------------------------------------------------------------------------
// 지금, 전주 — 프론트엔드 디자인 초안용 더미(mock) 데이터
// 실제 API/DB 연동은 없음. 모든 값은 하드코딩된 예시 데이터.
// ---------------------------------------------------------------------------

export type ChipOption = {
  value: string
  label: string
  hint?: string
}

// 남은 시간
export const TIME_OPTIONS: ChipOption[] = [
  { value: '1h', label: '1시간', hint: '가볍게' },
  { value: '3h', label: '3시간', hint: '여유롭게' },
  { value: 'half', label: '반나절', hint: '4~5시간' },
  { value: 'full', label: '하루', hint: '풀 코스' },
  { value: '2days', label: '이틀', hint: '1박 2일' },
  { value: '3days', label: '사흘', hint: '2박 3일' },
]

// 예산
export const BUDGET_OPTIONS: ChipOption[] = [
  { value: '1', label: '1만원대', hint: '알뜰하게' },
  { value: '3', label: '3만원대', hint: '적당하게' },
  { value: '5', label: '5만원 이상', hint: '넉넉하게' },
]

// 동행 유형
export const COMPANION_OPTIONS: ChipOption[] = [
  { value: 'solo', label: '혼자' },
  { value: 'couple', label: '커플' },
  { value: 'friends', label: '친구' },
  { value: 'family', label: '가족' },
  { value: 'kids', label: '아이 동반' },
  { value: 'pet', label: '반려동물 동반' },
]

// 이동수단
export const TRANSPORT_OPTIONS: ChipOption[] = [
  { value: 'walk', label: '도보' },
  { value: 'transit', label: '대중교통' },
  { value: 'car', label: '자차' },
]

// 필수 방문지 검색 더미 결과 (검색창에 입력 시 노출)
export const SEARCH_SUGGESTIONS: string[] = [
  '전동성당',
  '경기전',
  '전주향교',
  '오목대',
  '자만벽화마을',
  '남부시장 야시장',
  '전주 한옥마을',
  '풍남문',
  '전주천 산책로',
  '객리단길',
]

// 현재 날씨 요약 (결과 화면 상단 배지)
export type Weather = {
  condition: 'rain' | 'clear' | 'cloudy'
  emoji: string
  summary: string
  detail: string
}

export const CURRENT_WEATHER: Weather = {
  condition: 'rain',
  emoji: '☔',
  summary: '비 오는 중',
  detail: '실내 위주로 추천드려요 · 기온 18°C · 강수확률 80%',
}

// 추천 장소 카드
export type Place = {
  id: string
  order: number
  name: string
  category: string
  cost: number // 원 단위
  costLabel: string
  walkMinutes: number
  reason: string
  isMustVisit: boolean
  warning?: string
  // 지도 플레이스홀더 위 핀 위치 (0~100 %)
  mapX: number
  mapY: number
}

export const RECOMMENDED_PLACES: Place[] = [
  {
    id: 'p1',
    order: 1,
    name: '전동성당',
    category: '실내 · 명소',
    cost: 0,
    costLabel: '무료',
    walkMinutes: 0,
    reason: '현재 위치에서 가장 가까운 비 피하기 좋은 실내 명소예요.',
    isMustVisit: true,
    warning: '우천 시 우산 필요 (야외 정원 구간 있음)',
    mapX: 30,
    mapY: 62,
  },
  {
    id: 'p2',
    order: 2,
    name: '한옥마을 전통찻집',
    category: '실내 · 카페',
    cost: 9000,
    costLabel: '9,000원',
    walkMinutes: 6,
    reason: '우천으로 실내 로컬 액티비티로 대체됨. 비 오는 날 분위기 좋아요.',
    isMustVisit: false,
    mapX: 46,
    mapY: 48,
  },
  {
    id: 'p3',
    order: 3,
    name: '수제 한지 공방 체험',
    category: '실내 · 체험',
    cost: 18000,
    costLabel: '18,000원',
    walkMinutes: 9,
    reason: '비 오는 날 실내에서 즐기기 좋은 전주 전통 체험이에요.',
    isMustVisit: false,
    warning: '예산 초과 항목 포함됨',
    mapX: 62,
    mapY: 58,
  },
  {
    id: 'p4',
    order: 4,
    name: '남부시장 야시장',
    category: '실내외 · 먹거리',
    cost: 12000,
    costLabel: '12,000원',
    walkMinutes: 12,
    reason: '아케이드가 있어 비가 와도 즐기기 좋은 필수 코스예요.',
    isMustVisit: true,
    mapX: 74,
    mapY: 40,
  },
]

// "다른 곳 추천" 클릭 시 교체될 대체 후보 (id별)
export const ALTERNATIVE_PLACES: Record<string, Place> = {
  p2: {
    id: 'p2-alt',
    order: 2,
    name: '한옥마을 갤러리 카페',
    category: '실내 · 카페',
    cost: 11000,
    costLabel: '11,000원',
    walkMinutes: 8,
    reason: '실내 전시를 함께 볼 수 있어 비 오는 날 시간 보내기 좋아요.',
    isMustVisit: false,
    mapX: 42,
    mapY: 52,
  },
  p3: {
    id: 'p3-alt',
    order: 3,
    name: '전주 부채 만들기 공방',
    category: '실내 · 체험',
    cost: 14000,
    costLabel: '14,000원',
    walkMinutes: 7,
    reason: '예산에 더 맞는 실내 전통 체험으로 대체했어요.',
    isMustVisit: false,
    mapX: 58,
    mapY: 62,
  },
}

// 현재 위치 더미 문구
export const MOCK_LOCATION = '현재 위치: 전주 한옥마을 인근'
