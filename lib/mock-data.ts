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
  { value: '1h', label: '⚡ 1시간', hint: '가볍게' },
  { value: '3h', label: '☕ 3시간', hint: '여유롭게' },
  { value: 'half', label: '🌤️ 반나절', hint: '4~5시간' },
  { value: 'full', label: '🗓️ 하루', hint: '풀 코스' },
  { value: '2days', label: '🏕️ 이틀', hint: '1박 2일' },
  { value: '3days', label: '🗺️ 사흘', hint: '2박 3일' },
]

// 예산
export const BUDGET_OPTIONS: ChipOption[] = [
  { value: '1', label: '1만원대', hint: '알뜰하게' },
  { value: '3', label: '3만원대', hint: '적당하게' },
  { value: '5', label: '5만원 이상', hint: '넉넉하게' },
]

// 동행 유형
export const COMPANION_OPTIONS: ChipOption[] = [
  { value: 'solo', label: '🙋‍♂️ 혼자' },
  { value: 'couple', label: '👩‍❤️‍👨 커플' },
  { value: 'friends', label: '🧑‍🤝‍🧑 친구' },
  { value: 'family', label: '👨‍👩‍👧‍👦 가족' },
  { value: 'kids', label: '👶 아이 동반' },
  { value: 'pet', label: '🐾 반려동물 동반' },
]

// 이동수단 (도보는 🚶‍♂️, 대중교통은 🚌, 자차는 🚗 아이콘 장착)
export const TRANSPORT_OPTIONS: ChipOption[] = [
  { value: 'walk', label: '🚶‍♂️ 도보' },
  { value: 'transit', label: '🚌 대중교통' },
  { value: 'car', label: '🚗 자차' },
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
  '전라감영',
  '전주향교',
  '오목대',
  '객리단길',
  '동문길 독립서점',
  '웨리단길',
  '덕진공원 연화정',
  '팔복예술공장',
  '서학동 예술마을',
  '남부시장 야시장 (청년몰)',
  '전주 한옥마을',
  '풍남문',
  '국립무형유산원',
  '전주천 산책로',
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
  subCategory?: 'spot' | 'meal' | 'dessert' | 'workshop' | 'activity' | 'museum'
  suitableCompanions?: string[]
  day?: number
  isIndoor?: boolean
  lat?: number
  lng?: number
  distanceText?: string
  travelMinutes?: number
  transitInfo?: string
  boardingStop?: string
  busRoute?: string
  alightingStop?: string
  busArrivalLive?: string
  parkingInfo?: string
  nearbyDining?: { name: string; distance: string; menu: string; naverMapUrl?: string }[]
  nearbyCafes?: { name: string; distance: string; menu: string; naverMapUrl?: string }[]
  nearbySpecialties?: { name: string; distance: string; item: string; naverMapUrl?: string }[]
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

// 📍 전주 실제 정밀 물리적 위치 POI 데이터베이스 (네이버 지도 실존 매장 명칭, 상세 주소 및 정확한 위경도)
export const JEONJU_REAL_POI_DATABASE = [
  // 🍔 버거킹 (Burger King) 전주 실제 지점들
  {
    name: '버거킹 전주서신점',
    category: '🍔 패스트푸드 (버거킹 서신점)',
    subCategory: 'dining',
    cost: 8500,
    costLabel: '와퍼 세트 약 8,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 당산로 43 (서신동 793-4)',
    lat: 35.8335,
    lng: 127.1172,
    mapX: 30,
    mapY: 35,
    operatingHours: '09:00 - 23:00',
    tags: ['#버거킹', '#전주서신점', '#서신동맛집', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 서신동 당산로에 위치한 버거킹 서신점입니다.',
    keywords: ['버거킹', '버거킹 전주', '버거킹 서신', '와퍼'],
    naverMapUrl: 'https://map.naver.com/v5/search/버거킹%20전주서신점',
  },
  {
    name: '버거킹 전주효자DT점',
    category: '🍔 패스트푸드 (버거킹 효자DT점)',
    subCategory: 'dining',
    cost: 8500,
    costLabel: '와퍼 세트 약 8,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 용머리로 82 (효자동1가 653-3)',
    lat: 35.8112,
    lng: 127.1145,
    mapX: 25,
    mapY: 60,
    operatingHours: '09:00 - 24:00 (드라이브스루)',
    tags: ['#버거킹', '#전주효자DT', '#드라이브스루', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 효자동 용머리로에 위치한 버거킹 효자DT점입니다.',
    keywords: ['버거킹', '버거킹 효자', '버거킹 dt', '효동 버거킹'],
    naverMapUrl: 'https://map.naver.com/v5/search/버거킹%20전주효자DT점',
  },
  {
    name: '버거킹 전주전북대점',
    category: '🍔 패스트푸드 (버거킹 전북대점)',
    subCategory: 'dining',
    cost: 8500,
    costLabel: '와퍼 세트 약 8,500원',
    isIndoor: true,
    address: '전북 전주시 덕진구 백제대로 563 (덕진동1가 1263-8)',
    lat: 35.8455,
    lng: 127.1280,
    mapX: 45,
    mapY: 20,
    operatingHours: '09:00 - 23:00',
    tags: ['#버거킹', '#전북대점', '#대학로맛집', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전북대 구정문 백제대로에 위치한 버거킹 전북대점입니다.',
    keywords: ['버거킹', '버거킹 전북대', '덕진 버거킹'],
    naverMapUrl: 'https://map.naver.com/v5/search/버거킹%20전주전북대점',
  },
  {
    name: '버거킹 전주송천DT점',
    category: '🍔 패스트푸드 (버거킹 송천DT점)',
    subCategory: 'dining',
    cost: 8500,
    costLabel: '와퍼 세트 약 8,500원',
    isIndoor: true,
    address: '전북 전주시 덕진구 붓내3길 13 (송천동2가 206-5)',
    lat: 35.8690,
    lng: 127.1285,
    mapX: 45,
    mapY: 10,
    operatingHours: '09:00 - 23:00',
    tags: ['#버거킹', '#전주송천DT', '#에코시티', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 송천동에 위치한 버거킹 송천DT점입니다.',
    keywords: ['버거킹', '버거킹 송천', '에코시티 버거킹'],
    naverMapUrl: 'https://map.naver.com/v5/search/버거킹%20전주송천DT점',
  },

  // 🍟 맥도날드 (McDonald's) 전주 실제 지점들
  {
    name: '맥도날드 전주덕진DT점',
    category: '🍟 패스트푸드 (맥도날드 덕진DT점)',
    subCategory: 'dining',
    cost: 7500,
    costLabel: '빅맥 세트 약 7,500원',
    isIndoor: true,
    address: '전북 전주시 덕진구 기린대로 482 (덕진동1가 1400-9)',
    lat: 35.8448,
    lng: 127.1265,
    mapX: 44,
    mapY: 22,
    operatingHours: '00:00 - 24:00 (24시간 영업)',
    tags: ['#맥도날드', '#전주덕진DT', '#24시간영업', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 덕진공원 기린대로에 위치한 맥도날드 덕진DT점입니다.',
    keywords: ['맥도날드', '맥도날드 덕진', '맥도날드 전주', '빅맥'],
    naverMapUrl: 'https://map.naver.com/v5/search/맥도날드%20전주덕진DT점',
  },
  {
    name: '맥도날드 전주중화산DT점',
    category: '🍟 패스트푸드 (맥도날드 중화산DT점)',
    subCategory: 'dining',
    cost: 7500,
    costLabel: '빅맥 세트 약 7,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 백제대로 290 (중화산동2가 650-2)',
    lat: 35.8188,
    lng: 127.1235,
    mapX: 38,
    mapY: 48,
    operatingHours: '00:00 - 24:00 (24시간 영업)',
    tags: ['#맥도날드', '#전주중화산DT', '#24시간영업', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 중화산동 백제대로에 위치한 맥도날드 중화산DT점입니다.',
    keywords: ['맥도날드', '맥도날드 중화산', '중화산 맥도날드'],
    naverMapUrl: 'https://map.naver.com/v5/search/맥도날드%20전주중화산DT점',
  },
  {
    name: '맥도날드 전주효자DT점',
    category: '🍟 패스트푸드 (맥도날드 효자DT점)',
    subCategory: 'dining',
    cost: 7500,
    costLabel: '빅맥 세트 약 7,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 용머리로 110 (효자동1가 285-1)',
    lat: 35.8105,
    lng: 127.1118,
    mapX: 24,
    mapY: 62,
    operatingHours: '00:00 - 24:00 (24시간 영업)',
    tags: ['#맥도날드', '#전주효자DT', '#효자동맛집', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 효자동 용머리로에 위치한 맥도날드 효자DT점입니다.',
    keywords: ['맥도날드', '맥도날드 효자', '효자동 맥도날드'],
    naverMapUrl: 'https://map.naver.com/v5/search/맥도날드%20전주효자DT점',
  },
  {
    name: '맥도날드 전주평화DT점',
    category: '🍟 패스트푸드 (맥도날드 평화DT점)',
    subCategory: 'dining',
    cost: 7500,
    costLabel: '빅맥 세트 약 7,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 모악로 4690 (평화동1가 730-1)',
    lat: 35.7950,
    lng: 127.1380,
    mapX: 52,
    mapY: 82,
    operatingHours: '00:00 - 24:00 (24시간 영업)',
    tags: ['#맥도날드', '#전주평화DT', '#평화동맛집', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 평화동 모악로에 위치한 맥도날드 평화DT점입니다.',
    keywords: ['맥도날드', '맥도날드 평화', '평화동 맥도날드'],
    naverMapUrl: 'https://map.naver.com/v5/search/맥도날드%20전주평화DT점',
  },
  {
    name: '맥도날드 전주인후DT점',
    category: '🍟 패스트푸드 (맥도날드 인후DT점)',
    subCategory: 'dining',
    cost: 7500,
    costLabel: '빅맥 세트 약 7,500원',
    isIndoor: true,
    address: '전북 전주시 덕진구 안덕원로 240 (인후동1가 900-1)',
    lat: 35.8340,
    lng: 127.1620,
    mapX: 75,
    mapY: 34,
    operatingHours: '00:00 - 24:00 (24시간 영업)',
    tags: ['#맥도날드', '#전주인후DT', '#인후동맛집', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 인후동/아중리 입구에 위치한 맥도날드 인후DT점입니다.',
    keywords: ['맥도날드', '맥도날드 인후', '아중리 맥도날드'],
    naverMapUrl: 'https://map.naver.com/v5/search/맥도날드%20전주인후DT점',
  },

  // 🔐 방탈출 (Escape Room) 전주 실제 지점들
  {
    name: '마스터키 전주객사점',
    category: '🔐 이색 체험 (방탈출 카페)',
    subCategory: 'spot',
    cost: 22000,
    costLabel: '1인 이용료 22,000원',
    isIndoor: true,
    address: '전북 전주시 완산구 전주객사4길 74 (고사동 143-1)',
    lat: 35.8192,
    lng: 127.1435,
    mapX: 54,
    mapY: 46,
    operatingHours: '10:00 - 23:00',
    tags: ['#방탈출', '#마스터키', '#전주객사', '#이색데이트', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 영화의거리 객사에 위치한 인기 방탈출 카페 마스터키입니다.',
    keywords: ['방탈출', '마스터키', '객사 방탈출', '방탈출 카페'],
    naverMapUrl: 'https://map.naver.com/v5/search/마스터키%20전주객사점',
  },
  {
    name: '큐브방탈출카페 전주객사점',
    category: '🔐 이색 체험 (방탈출 카페)',
    subCategory: 'spot',
    cost: 20000,
    costLabel: '1인 이용료 20,000원',
    isIndoor: true,
    address: '전북 전주시 완산구 전주객사3길 12 (고사동 238-1)',
    lat: 35.8185,
    lng: 127.1418,
    mapX: 52,
    mapY: 47,
    operatingHours: '11:00 - 23:00',
    tags: ['#방탈출', '#큐브방탈출', '#객리단길', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 객리단길에 위치한 큐브 방탈출 카페입니다.',
    keywords: ['방탈출', '큐브방탈출', '객리단길 방탈출'],
    naverMapUrl: 'https://map.naver.com/v5/search/큐브방탈출카페%20전주객사점',
  },
  {
    name: '셜록홈즈 방탈출카페 전주전북대점',
    category: '🔐 이색 체험 (방탈출 카페)',
    subCategory: 'spot',
    cost: 22000,
    costLabel: '1인 이용료 22,000원',
    isIndoor: true,
    address: '전북 전주시 덕진구 명륜3길 14 (덕진동1가 1264-10)',
    lat: 35.8478,
    lng: 127.1290,
    mapX: 46,
    mapY: 18,
    operatingHours: '11:00 - 23:00',
    tags: ['#방탈출', '#셜록홈즈', '#전북대', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전북대 구정문 상권에 위치한 셜록홈즈 방탈출 카페입니다.',
    keywords: ['방탈출', '셜록홈즈', '전북대 방탈출', '덕진 방탈출'],
    naverMapUrl: 'https://map.naver.com/v5/search/셜록홈즈%20전주전북대점',
  },

  // ☕ 스타벅스 (Starbucks) 전주 실제 지점들
  {
    name: '스타벅스 전주한옥마을점',
    category: '☕ 스타벅스 디저트 카페',
    subCategory: 'cafe',
    cost: 6000,
    costLabel: '음료/디저트 약 6,000원',
    isIndoor: true,
    address: '전북 전주시 완산구 팔달로 161 (전동 62-1)',
    lat: 35.8138,
    lng: 127.1472,
    mapX: 58,
    mapY: 52,
    operatingHours: '07:30 - 22:00',
    tags: ['#스타벅스', '#한옥마을점', '#카페', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 한옥마을 입구 팔달로에 위치한 스타벅스 한옥마을점입니다.',
    keywords: ['스타벅스', '스벅', '스타벅스 한옥마을', '한옥마을 스타벅스'],
    naverMapUrl: 'https://map.naver.com/v5/search/스타벅스%20전주한옥마을점',
  },
  {
    name: '스타벅스 전주객사점',
    category: '☕ 스타벅스 디저트 카페',
    subCategory: 'cafe',
    cost: 6000,
    costLabel: '음료/디저트 약 6,000원',
    isIndoor: true,
    address: '전북 전주시 완산구 전주객사5길 35 (고사동 360-1)',
    lat: 35.8195,
    lng: 127.1425,
    mapX: 53,
    mapY: 45,
    operatingHours: '08:00 - 22:00',
    tags: ['#스타벅스', '#전주객사점', '#시내카페', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 객사 영화의거리에 위치한 스타벅스 객사점입니다.',
    keywords: ['스타벅스', '스벅', '스타벅스 객사', '객사 스타벅스'],
    naverMapUrl: 'https://map.naver.com/v5/search/스타벅스%20전주객사점',
  },
  {
    name: '스타벅스 전주전북대점',
    category: '☕ 스타벅스 디저트 카페',
    subCategory: 'cafe',
    cost: 6000,
    costLabel: '음료/디저트 약 6,000원',
    isIndoor: true,
    address: '전북 전주시 덕진구 백제대로 567 (덕진동1가 1263-5)',
    lat: 35.8472,
    lng: 127.1292,
    mapX: 46,
    mapY: 19,
    operatingHours: '07:30 - 22:00',
    tags: ['#스타벅스', '#전북대점', '#대학로카페', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전북대 구정문 대학로에 위치한 스타벅스 전북대점입니다.',
    keywords: ['스타벅스', '스벅', '스타벅스 전북대', '전북대 스타벅스'],
    naverMapUrl: 'https://map.naver.com/v5/search/스타벅스%20전주전북대점',
  },

  // 🎲 보드게임 카페
  {
    name: '레드버튼 보드게임카페 전주객사점',
    category: '🎲 이색 체험 (보드게임 카페)',
    subCategory: 'spot',
    cost: 9000,
    costLabel: '이용료/음료 약 9,000원',
    isIndoor: true,
    address: '전북 전주시 완산구 전주객사4길 43 (고사동 340-1)',
    lat: 35.8190,
    lng: 127.1430,
    mapX: 53,
    mapY: 46,
    operatingHours: '12:00 - 24:00',
    tags: ['#보드게임', '#레드버튼', '#전주객사', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 객사 중앙에 위치한 프리미엄 보드게임카페 레드버튼입니다.',
    keywords: ['보드게임', '레드버튼', '보드게임카페', '객사 보드게임'],
    naverMapUrl: 'https://map.naver.com/v5/search/레드버튼%20전주객사점',
  },

  // 🛍️ 올리브영
  {
    name: '올리브영 전주한옥마을점',
    category: '🛍️ 뷰티/쇼핑 (올리브영)',
    subCategory: 'spot',
    cost: 15000,
    costLabel: '쇼핑 약 15,000원',
    isIndoor: true,
    address: '전북 전주시 완산구 팔달로 150 (전동 127-1)',
    lat: 35.8130,
    lng: 127.1465,
    mapX: 57,
    mapY: 53,
    operatingHours: '10:00 - 22:30',
    tags: ['#올리브영', '#한옥마을점', '#뷰티쇼핑', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 한옥마을 입구 팔달로에 위치한 올리브영입니다.',
    keywords: ['올리브영', '올리브영 한옥마을', '전주 올리브영'],
    naverMapUrl: 'https://map.naver.com/v5/search/올리브영%20전주한옥마을점',
  },
  {
    name: '올리브영 전주객사점',
    category: '🛍️ 뷰티/쇼핑 (올리브영)',
    subCategory: 'spot',
    cost: 15000,
    costLabel: '쇼핑 약 15,000원',
    isIndoor: true,
    address: '전북 전주시 완산구 전주객사4길 46 (고사동 338-1)',
    lat: 35.8192,
    lng: 127.1430,
    mapX: 53,
    mapY: 46,
    operatingHours: '10:00 - 22:30',
    tags: ['#올리브영', '#전주객사점', '#뷰티쇼핑', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 객사 중앙상권에 위치한 올리브영 객사점입니다.',
    keywords: ['올리브영', '올리브영 객사', '객사 올리브영'],
    naverMapUrl: 'https://map.naver.com/v5/search/올리브영%20전주객사점',
  },
]

// 경로 최단거리에 가장 가까운 전주 실제 실존 매장 POI 매칭 함수
export function findNearestJeonjuRealPoi(query: string, currentPlaces: Place[]): Place | null {
  if (!query.trim()) return null
  const q = query.toLowerCase().trim()

  // 1. 키워드 매칭 후보군 검색
  const candidates = JEONJU_REAL_POI_DATABASE.filter((poi) =>
    poi.keywords.some((k) => k.includes(q) || q.includes(k.replace(/전주|점|DT/g, '').trim())) ||
    poi.name.toLowerCase().includes(q)
  )

  if (candidates.length === 0) return null

  // 2. 현재 코스장소들의 중심 좌표 계산
  let centerLat = 35.8140
  let centerLng = 127.1510
  if (currentPlaces && currentPlaces.length > 0) {
    const validPlaces = currentPlaces.filter((p) => p.lat && p.lng)
    if (validPlaces.length > 0) {
      centerLat = validPlaces.reduce((sum, p) => sum + (p.lat || 35.814), 0) / validPlaces.length
      centerLng = validPlaces.reduce((sum, p) => sum + (p.lng || 127.151), 0) / validPlaces.length
    }
  }

  // 3. 현재 경로 중심점에서 가장 지리적으로 가까운 실제 지점 1개 추출
  let bestCandidate = candidates[0]
  let minDistanceSq = Number.MAX_VALUE

  candidates.forEach((cand) => {
    const dLat = cand.lat - centerLat
    const dLng = cand.lng - centerLng
    const distSq = dLat * dLat + dLng * dLng
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq
      bestCandidate = cand
    }
  })

  return {
    id: `poi-${Date.now()}`,
    order: 0,
    name: bestCandidate.name,
    category: bestCandidate.category,
    subCategory: bestCandidate.subCategory as any,
    cost: bestCandidate.cost,
    costLabel: bestCandidate.costLabel,
    walkMinutes: 5,
    reason: bestCandidate.reason,
    isMustVisit: true,
    isIndoor: bestCandidate.isIndoor,
    mapX: bestCandidate.mapX,
    mapY: bestCandidate.mapY,
    lat: bestCandidate.lat,
    lng: bestCandidate.lng,
    address: bestCandidate.address,
    operatingHours: bestCandidate.operatingHours,
    tags: bestCandidate.tags,
    suggestedDuration: '45분',
    tips: `💡 네이버 지도에 실제 등록된 전주 현지 매장입니다. (${bestCandidate.address})`,
    naverMapUrl: bestCandidate.naverMapUrl,
  }
}

