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

// 날씨 선택지 (실시간 및 예보/가상 날씨)
export const WEATHER_OPTIONS: ChipOption[] = [
  { value: 'auto', label: '🛰️ 실시간', hint: '기상청 연동' },
  { value: 'clear', label: '☀️ 맑음·더위', hint: '시원한 실내' },
  { value: 'rain', label: '☔ 비 옴', hint: '우천 공방/찻집' },
  { value: 'cloudy', label: '☁️ 구름 많음', hint: '선선한 산책' },
  { value: 'snow', label: '❄️ 눈 옴', hint: '한옥 설경/따뜻' },
  { value: 'wind', label: '🥶 바람·한파', hint: '따뜻한 국밥/실내' },
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
  condition: 'rain' | 'clear' | 'cloudy' | 'snow' | 'wind'
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
  // 네이버 지도 바탕 풍부한 정보 및 이동수단별 경로 정보
  address?: string
  operatingHours?: string
  phone?: string
  tags?: string[]
  suggestedDuration?: string
  tips?: string
  naverMapUrl?: string
  isMeal?: boolean
  isDessert?: boolean
  day?: number
  isIndoor?: boolean
  lat?: number
  lng?: number
  distanceText?: string
  travelMinutes?: number
  transitInfo?: string
  parkingInfo?: string
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
    address: '전북 전주시 완산구 태조로 51',
    operatingHours: '09:00 - 17:00 (일요일 미사시간 제외)',
    phone: '063-284-3222',
    tags: ['#사적지', '#사진맛집', '#비잔틴양식', '#한옥마을입구'],
    suggestedDuration: '30분',
    tips: '💡 현지인 팁: 성당 본당 정면도 예쁘지만, 뒤편 사제관 건물과 성모상 앞 정원이 한적한 숨은 포토존입니다.',
    naverMapUrl: 'https://map.naver.com/v5/search/전주%20전동성당',
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
    address: '전북 전주시 완산구 은행로 65-1',
    operatingHours: '10:00 - 22:00 (연중무휴)',
    phone: '063-282-1234',
    tags: ['#전통차', '#쌍화차', '#마당정원', '#고즈넉함'],
    suggestedDuration: '45분',
    tips: '💡 현지인 팁: 툇마루 자리에 앉아 고즈넉한 한옥 마당을 바라보며 수제 유과와 한방차를 즐겨보세요.',
    naverMapUrl: 'https://map.naver.com/v5/search/전주%20한옥마을%20전통찻집',
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
    address: '전북 전주시 완산구 한지길 32',
    operatingHours: '10:00 - 18:00 (매주 월요일 휴무)',
    phone: '063-288-5678',
    tags: ['#한지공예', '#이색체험', '#실내액티비티', '#기념품만들기'],
    suggestedDuration: '1시간 15분',
    tips: '💡 현지인 팁: 직접 만든 한지 엽서는 당일 말려서 예쁜 봉투에 담아 기념품으로 가져가실 수 있습니다.',
    naverMapUrl: 'https://map.naver.com/v5/search/전주%20한지체험관',
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
    address: '전북 전주시 완산구 풍남문2길 63',
    operatingHours: '09:00 - 22:00 (야시장 금·토 18:00 - 24:00)',
    phone: '063-284-1344',
    tags: ['#피순대', '#청년몰', '#전통시장', '#야먹거리'],
    suggestedDuration: '1시간 30분',
    tips: '💡 현지인 팁: 2층 청년몰의 핸드메이드 소품샵과 독특한 분위기의 레트로 카페도 함께 둘러보세요.',
    naverMapUrl: 'https://map.naver.com/v5/search/전주%20남부시장',
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
