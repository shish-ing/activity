// ---------------------------------------------------------------------------
// 전주 여행 P들 어디가 — 글로벌 다국어 (한국어 / English) 번역 시스템
// ---------------------------------------------------------------------------

export type AppLang = 'ko' | 'en'

export const getAppLang = (): AppLang => {
  if (typeof window === 'undefined') return 'ko'
  try {
    const saved = localStorage.getItem('jeonju_app_lang')
    if (saved === 'en' || saved === 'ko') return saved
  } catch (e) {}
  return 'ko'
}

export const setAppLang = (lang: AppLang) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('jeonju_app_lang', lang)
    window.dispatchEvent(new Event('jeonju_lang_changed'))
  } catch (e) {}
}

// 텍스트 다국어 변환 헬퍼 함수
export function t(koText: string, enText: string, lang: AppLang): string {
  return lang === 'en' ? enText : koText
}

// 전주 주요 장소명 영어 번역 사전
const PLACE_NAME_DICTIONARY: Record<string, string> = {
  // 대표 문학관 / 박물관 / 사적지
  '전주 최명희문학관': 'Choi Myeong-hui Literature Hall',
  '최명희문학관': 'Choi Myeong-hui Literature Hall',
  '최명희 문학관': 'Choi Myeong-hui Literature Hall',
  '전동성당': 'Jeondong Cathedral',
  '전주 한옥마을': 'Jeonju Hanok Village',
  '전주 한옥마을 (전동성당)': 'Jeonju Hanok Village (Jeondong Cathedral)',
  '경기전': 'Gyeonggijeon Shrine',
  '경기전 & 대나무숲길': 'Gyeonggijeon Shrine & Bamboo Forest',
  '풍남문': 'Pungnammun Gate',
  '남부시장': 'Nambu Market',
  '남부시장 야시장': 'Nambu Market Night Market',
  '남부시장 청년몰 & 야시장': 'Nambu Market Youth Mall & Night Market',
  '자만벽화마을': 'Jaman Mural Village',
  '자만벽화마을 & 한벽굴 (스물다섯 스물하나)': 'Jaman Mural Village & Hanbyeok Tunnel',
  '오목대': 'Omokdae Historic Pavilion',
  '이목대': 'Imokdae Historic Site',
  '오목대 & 이목대 (전주 야경 명소)': 'Omokdae & Imokdae Pavilions',
  '전주향교': 'Jeonju Hyanggyo (Confucian School)',
  '전주향교 (성균관스캔들 촬영지)': 'Jeonju Hyanggyo (Confucian School)',
  '한벽굴': 'Hanbyeok Tunnel',
  '한벽당': 'Hanbyeokdang Pavilion',
  '팔복예술공장': 'Palbok Art Factory',
  '전주수목원': 'Jeonju Arboretum',
  '한국도로공사 전주 수목원': 'Jeonju Arboretum',
  '덕진공원': 'Deokjin Park',
  '전주 덕진공원 연화정': 'Deokjin Park (Yeonhwajeong)',
  '전주 덕진공원 연화정 도서관': 'Deokjin Park Yeonhwajeong Library',
  '전북대학교': 'Jeonbuk National University',
  '전북대학교 전주캠퍼스': 'Jeonbuk National University',
  '전주 객사': 'Jeonju Gaeksa',
  '전주 객사 (객리단길)': 'Jeonju Gaeksa (Gaekridan-gil)',
  '객리단길': 'Gaekridan-gil Street',
  '전라감영': 'Jeollagamyeong Provincial Office',
  '아중호수': 'Ajung Lake',
  '전주 아중호수': 'Ajung Lake',
  '전주 아중호수 수중 데크 산책로': 'Ajung Lake Boardwalk Trail',
  '서학동 예술마을': 'Seohak-dong Art Village',
  '어진박물관': 'Eojin Royal Portrait Museum',
  '국립전주박물관': 'National Jeonju Museum',
  '전주 한옥마을 전통 술박물관': 'Jeonju Traditional Korean Wine Museum',
  '전주 한지산업지원센터 & 한지체험관': 'Jeonju Hanji Center & Workshop',
  '완산칠봉 꽃동산': 'Wansanchilbong Flower Hill',
  '청년몰': 'Youth Mall',
  '전주역': 'Jeonju Station',
  '전주역 (KTX/SRT)': 'Jeonju Station (KTX/SRT)',
  '전주고속버스터미널': 'Jeonju Express Bus Terminal',
  '전주시외버스터미널': 'Jeonju Intercity Bus Terminal',
  'CGV 효자 (몰오브효자)': 'CGV Hyoja (Mall of Hyoja)',
  '전북도청 (효자동)': 'Jeonbuk Provincial Office',
  'CGV 객사 (영화의거리)': 'CGV Gaeksa (Cinema Street)',

  // 주요 로컬 맛집 / 카페 / 특산품 매장
  '한국집': 'Hankookjib Bibimbap',
  '한국집 (전주 3대 비빔밥/미슐랭)': 'Hankookjib Bibimbap',
  '현대옥 한옥마을점': 'Hyundaeok Bean Sprout Soup',
  '베테랑 칼국수': 'Veteran Kalguksu',
  '교동떡갈비': 'Gyodong Tteokgalbi',
  '풍남문 비빔밥': 'Pungnammun Bibimbap',
  '풍남문 비빔밥 노포': 'Pungnammun Bibimbap',
  '조점례 피순대': 'Jo Jeom-rye Blood Sausage',
  '자매갈비전골': 'Jamae Galbi Jeongol',
  '자매갈비전골 (객리단길)': 'Jamae Galbi Jeongol',
  '진미집': 'Jinmijib (Charcoal Pork Bulgogi)',
  '진미집 (연탄 돼지불고기 노포)': 'Jinmijib (Charcoal Pork Bulgogi)',
  '서학동 사진관 갤러리 카페': 'Seohak-dong Photo Gallery Cafe',
  '서학동 사진관': 'Seohak-dong Photo Gallery Cafe',
  '교동 다원': 'Gyodong Tea House',
  '전망 카페': 'Jeonmang Hanok View Cafe',
  '마스커피': 'Mars Coffee',
  '외할머니솜씨': 'Grandma\'s Best Shaved Ice',
  '행원 전통찻집': 'Haengwon Traditional Tea House',
  '노트릭 객사점': 'Notrick Coffee Gaeksa',
  '차경 한옥 디저트 카페': 'Chagyeong Hanok Cafe',
  '마레 실내 정원 카페': 'Mare Garden Cafe',
  'PNB 풍년제과 본점': 'PNB Poongnyun Bakery',
  'PNB Poongnyun Bakery': 'PNB Poongnyun Bakery',
  '교동 한지공예관 / 한지체험관': 'Gyodong Hanji Crafts Center',
  '전주 전통 모주도가': 'Jeonju Traditional Moju Brewery',
  '억조당 전통과자점': 'Eokjodang Traditional Confectionery',
  '카카오파이 수제 베이커리': 'Cacao Pie Handmade Bakery',
  '전주 Craft 수제맥주 바틀샵': 'Jeonju Craft Beer Bottle Shop',
  '서학동 작가 공예샵': 'Seohak-dong Crafts Shop',
  '전주 전통 합죽선 명인관': 'Jeonju Traditional Fan Master Hall',
  '남부시장 청년몰 수제 굿즈': 'Youth Mall Handmade Goods',
  '오목대 수제 한과 방앗간': 'Omokdae Traditional Rice Cake Shop',
  '팔복예술공장 디자인 아트숍': 'Palbok Art Factory Design Shop',
  '덕진 연꽃 수제 공방': 'Deokjin Lotus Flower Workshop',
  '전주 수제과일청 공방': 'Jeonju Handmade Fruit Syrup Workshop',
  '동문길 전통 다구 공방': 'Dongmun-gil Traditional Tea Set Workshop',
}

export function tPlaceName(koName: string, lang: AppLang): string {
  if (lang === 'ko' || !koName) return koName
  if (PLACE_NAME_DICTIONARY[koName]) return PLACE_NAME_DICTIONARY[koName]
  
  // 부분 매칭 헬퍼
  for (const [key, val] of Object.entries(PLACE_NAME_DICTIONARY)) {
    if (koName.includes(key)) {
      return koName.replace(key, val)
    }
  }

  let res = koName
  if (res.includes('문학관')) res = res.replace('문학관', ' Literature Hall')
  if (res.includes('박물관')) res = res.replace('박물관', ' Museum')
  if (res.includes('미술관')) res = res.replace('미술관', ' Art Museum')
  if (res.includes('공방')) res = res.replace('공방', ' Workshop')
  if (res.includes('한옥마을')) res = res.replace('한옥마을', ' Hanok Village')
  if (res.includes('전주 ')) res = res.replace('전주 ', 'Jeonju ')

  return res
}

// 영업시간 정보 다국어 변환
export function tHours(hours: string, lang: AppLang): string {
  if (lang === 'ko' || !hours) return hours
  return hours
    .replace('(월요일 휴무)', '(Closed Mon)')
    .replace('(화요일 휴무)', '(Closed Tue)')
    .replace('(수요일 휴무)', '(Closed Wed)')
    .replace('(목요일 휴무)', '(Closed Thu)')
    .replace('(금요일 휴무)', '(Closed Fri)')
    .replace('(토요일 휴무)', '(Closed Sat)')
    .replace('(일요일 휴무)', '(Closed Sun)')
    .replace('(매주 월요일 휴관)', '(Closed Every Mon)')
    .replace('(연중무휴)', '(Open All Year)')
    .replace('상시 개방', 'Always Open')
    .replace('(야간 조명 21:00까지)', '(Night Lights until 21:00)')
    .replace('24시간 영업', '24 Hours Open')
}

// 도보 거리 배지 다국어 변환 (예: "도보 7분 (468m)" ➔ "7m walk (468m)")
export function tDistance(distance: string, lang: AppLang): string {
  if (lang === 'ko' || !distance) return distance
  return distance.replace('도보 ', '').replace('분', 'm walk')
}

// 현지인 팁 다국어 변환
export function tTip(tip: string, lang: AppLang): string {
  if (lang === 'ko' || !tip) return tip
  if (tip.includes('사제관')) return '💡 The garden in front of the priest\'s house and St. Mary\'s statue behind is a hidden photo spot.'
  if (tip.includes('대나무')) return '💡 The bamboo forest garden with sunlight filtering through is a great photo spot.'
  if (tip.includes('한복')) return '💡 Free entry in Hanbok! Be sure to visit the Ginkgo tree path and Myeongryundang.'
  if (tip.includes('야경')) return '💡 The #1 night view spot in Jeonju looking over the Hanok Village.'
  if (tip.includes('굴 입구')) return '💡 Take drama-like snapshot photos at the tunnel entrance and stream walk.'
  if (tip.includes('연화정')) return '💡 Enjoy the lotus flower view from the library\'s glass window seats.'
  if (tip.includes('온실')) return '💡 Beautiful landscaping all 4 seasons with famous greenhouse & bamboo arch photo spots.'
  if (tip.includes('호수')) return '💡 Romantic boardwalk trail around the lake with night lighting.'
  if (tip.includes('공방')) return '💡 Full of charming workshop galleries and alley mural photo spots.'
  if (tip.includes('청년몰')) return '💡 Unique shops on the 2nd floor Youth Mall and night market snacks.'
  return tip
}

// 경고/주의사항 다국어 변환
export function tWarning(warning: string, lang: AppLang): string {
  if (lang === 'ko' || !warning) return warning
  if (warning.includes('악천후') || warning.includes('한파') || warning.includes('땡볕')) {
    return '⚠️ Severe Weather Warning: Hot sun or cold wind ahead. Take indoor breaks at museums/workshops.'
  }
  return warning
}

// 장소 카테고리 (예: 📖 실내 · 전주 문학 기념관) 영어 변환
export function tCategory(cat: string, lang: AppLang): string {
  if (lang === 'ko' || !cat) return cat

  return cat
    .replace('실내', 'Indoor')
    .replace('실외', 'Outdoor')
    .replace('역사 사적지', 'Historical Site')
    .replace('역사 문화재', 'Cultural Heritage')
    .replace('전통 유교 문화재', 'Confucian Heritage')
    .replace('전주 문학 기념관', 'Jeonju Literature Memorial')
    .replace('현대 미술 & 문화 예술공간', 'Contemporary Art & Culture Center')
    .replace('자연 수목원', 'Nature Arboretum')
    .replace('수변 호수 공원', 'Lakeside Park')
    .replace('전통 찻집 & 디저트 카페', 'Traditional Tea & Dessert Cafe')
    .replace('전주 로컬 맛집', 'Jeonju Local Restaurant')
    .replace('전통 특산품 & 공예점', 'Traditional Souvenir & Crafts')
    .replace('전망대 · 역사 유적', 'Observatory & Heritage')
    .replace('벽화마을 · 촬영지', 'Mural Village & Filming Site')
    .replace('공원 · 한옥 도서관', 'Park & Hanok Library')
    .replace('예술마을 · 공방', 'Art Village & Workshop')
    .replace('청년몰 · 야시장 · 시장', 'Youth Mall & Night Market')
    .replace('검색 추가 · 명소', 'Custom Spot')
}

// 기상청 날씨 요약 영어 번역 사전
export function tWeatherSummary(summary: string, lang: AppLang): string {
  if (lang === 'ko' || !summary) return summary
  let res = summary
    .replace('실시간: ', 'Live: ')
    .replace('구름 많음', 'Cloudy')
    .replace('맑음', 'Sunny')
    .replace('흐림', 'Overcast')
    .replace('비 옴', 'Rainy')
    .replace('비', 'Rain')
    .replace('눈 옴', 'Snowy')
    .replace('눈', 'Snow')
    .replace('바람·한파', 'Windy & Cold')
    .replace('바람', 'Windy')
  return res
}

export function tWeatherDetail(detail: string, lang: AppLang): string {
  if (lang === 'ko' || !detail) return detail
  return detail
    .replace('선선해서 야외 걷기 좋은 날씨예요', 'Breezy and pleasant weather for walking')
    .replace('기온', 'Temp')
    .replace('체감', 'Feels like')
    .replace('강수확률', 'Precipitation')
}
