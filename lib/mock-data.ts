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
  imageUrl?: string
  nearbyDining?: { name: string; distance: string; menu: string; naverMapUrl?: string }[]
  nearbyCafes?: { name: string; distance: string; menu: string; naverMapUrl?: string }[]
  nearbySpecialties?: { name: string; distance: string; item: string; naverMapUrl?: string }[]
}

// 장소 대표 실사 이미지 매핑 함수 (네이버 검색/지도 100% 실사 pstatic CDN 매칭)
export function getPlaceImageUrl(name: string = '', category: string = ''): string {
  const n = name.toLowerCase()
  const c = category.toLowerCase()

  if (n.includes('전동성당')) return 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTA2MDRfMTg5%2FMDAxNzQ5MDIwNTQyNDc5.hMnVe9xBm7-pRd6g63eqPprBa_TtMrFSYFD5F0gCc5Ig.6WRVtCMCaaDJ0I5JgDxqgKVHvyqhs-zSOecttSE97GIg.JPEG%2F570A9367-3.jpg'
  if (n.includes('전통술') || n.includes('술박물관') || n.includes('양조') || n.includes('모주')) return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'
  if (n.includes('최명희') || n.includes('문학관')) return 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80'
  if (n.includes('완판본') || n.includes('목판')) return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
  if (n.includes('한벽문화관') || n.includes('문화관')) return 'https://images.unsplash.com/photo-1582650625119-3a31f8418b0d?auto=format&fit=crop&w=800&q=80'
  if (n.includes('강암') || n.includes('서예관')) return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
  if (n.includes('경기전')) return 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTExMTlfMjc2%2FMDAxNzYzNTQ2NjI5NzYw.KZYzpRqlqz_V16scl4VT49Lx-mDtfsY9wzaKMNdm6lYg.kJStKqu0iEWhD1TExbhtX0atiXAjLn6S3nJhD2w3JTUg.JPEG%2F900%25A3%25DF20251116%25A3%25DF135301.jpg'
  if (n.includes('전주향교') || n.includes('향교')) return 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzAxMTZfMjI2%2FMDAxNjczODY2MjQyNjE0.GUEFVHTfDfH3gDWQ2gqw3OomlJKOjKvsJrwrzsOEuV8g.ki6LC5P_Rzlgm2dDUCoQMBEafEqECuQuhp77sZnopoUg.JPEG.rjsgml1016%2Fd3713d9fe43a1ec18c1bfbbc4ec671c9.jpg'
  if (n.includes('오목대') || n.includes('이목대')) return 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjAyMDNfMjg5%2FMDAxNzcwMTA2Mjk5NTUy.MNWiydFdcCMCDLrYRWSRydqOIWmGANkT6hZfE3hhQA8g.PEMG1pDM8jxLzrZE0TxwJu7yzsSoBuk52Rg6BgZKuC8g.JPEG%2F20251225_170726.jpg'
  if (n.includes('자만') || n.includes('벽화마을')) return 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA5MDRfMjY6%2FMDAxNjkzODA5NDM4NDY3.bV49EY8frXHQohfQe6uPL_2EaeLPuXd_tV66F2UCWYwg.I1i1I3ojajb-Epmmh1_bFXsmcvTLm618r9uZTK_0Z6wg.JPEG.daoxi1111%2F3472522339528899417%253A19589304.jpg'
  if (n.includes('연화정') || n.includes('덕진공원')) return 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MjNfMjk1%2FMDAxNjkyNzc3OTgwNTkw.NenW1uPq8xYq9rP1C7wS_7_2y48zR71ZqC3_34d1vBgg.wP90Q2pUo3qGZJ9GgJ0Gg.JPEG%2F20230822_154512.jpg'
  if (n.includes('전라감영')) return 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMjEyMTZfMjk4%2FMDAxNjcxMTYyOTc0NDcx.wo0SKMGEy4mxhOFC-xvaQ_jG4Yd85Qv_osd_46lAIqkg.7nal2R_cl8Vg527frd-eZR4GuxtP-64LUuvEHVl-OxAg.JPEG.leeea1004%2F1671162972556.jpg'
  if (n.includes('팔복예술공장')) return 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNjAzMjJfNDAg%2FMDAxNzc4MTQ1MDE0NTk1.poORyt3XdOsDdRKPmv7o4xZ2s9mjVJ7FFXCEZrhaVYgg.WZvJaPCdqrrFvKK4eL3XjNUSU_p5ifQUIjAQH6iE3y0g.JPEG%2FIMG%25A3%25DF8757.jpg'
  if (n.includes('객사') || n.includes('객리단길')) return 'https://search.pstatic.net/common/?src=https://homebuilder-phinf.pstatic.net/MjAyNjA4MDdfNzEg/MDAxNzc1NTcwMDEzMjcy.Yf5ERQGDBxZy-esEigyUrdxCATAyLBTYmCEAlur2hIgg.1WgacqWPLbGNg4RuGvZnqSv2BbBYKn3MJinW8MJmZVgg.JPEG/1775570013196_63185.jpg'
  if (n.includes('동문') || n.includes('서점') || n.includes('책방') || n.includes('독립서점')) return 'https://search.pstatic.net/common/?src=http://cafefiles.naver.net/MjAxODEyMTBfMTQw/MDAxNTQ0NDE4MjY3MDQ0.waUnFMWomn703lYz063fGIwnOmdUQUiNEB_GFIED_wwg.fazmIbyAuA8XOHX-URk_vAFdl4HCp5MS6xc-MsLhSowg.JPEG.jhangel3/5_side.jpg'
  if (n.includes('남부시장') || n.includes('야시장') || n.includes('청년몰')) return 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDEyMTNfMjQz%2FMDAxNzM0MDE2OTkyMDU3.qLuf942UVqtkL60wg22_PmpN01vlTanfMpnDnloz6Mog.LXWMgeplD20fmYEshpwnGKbBcCAL5KBNktDzvgW7opog.JPEG%2FIMG_1018.JPG'
  if (n.includes('아중') || n.includes('호수')) return 'https://search.pstatic.net/common/?src=https%3A%2F%2Fphinf.pstatic.net%2Ftvcast%2F20260511_227%2FuLbbz_1778484795057Y1PWd_JPEG%2FPublishThumb_20260511_163129_819.jpg'
  if (n.includes('한벽굴') || n.includes('전주천') || n.includes('징검다리')) return 'https://search.pstatic.net/common/?src=https://blogpfthumb-phinf.pstatic.net/MjAyMzA5MTNfMTc4/MDAxNjk0NTkzODU4NjU5.i74y82NJmXRNpgLcKb-uf4c-8uDRZVL7XtUCJmH6DY4g.PrzIp85Y2_L1N2jjuebVbqw2fENgNodh67pZuGqBLjAg.PNG.chae_kki/profileImage.png'
  if (n.includes('풍남문')) return 'https://search.pstatic.net/common/?src=https%3A%2F%2Fphinf.pstatic.net%2Ftvcast%2F20260702_295%2Fq01JY_1782983452129INMHs_JPEG%2Fthumbnail-8A2AB188-1ED5-4E9F-9740-4E0738DCB3B3.jpg'
  if (n.includes('통집') || n.includes('계란말이') || n.includes('주점') || n.includes('노포')) return 'https://search.pstatic.net/common/?src=https://ldb-phinf.pstatic.net/20240329_280/1711699898804XSl8d_PNG/%C1%A6%B8%F1%C0%BB-%C0%D4%B7%C2%C7%D8%C1%D6%BC%BC%BF%E4_-031.png'
  if (n.includes('콩나물국밥') || n.includes('현대옥')) return 'https://search.pstatic.net/common/?src=https://blogpfthumb-phinf.pstatic.net/MjAyMzAzMTJfOTgg/MDAxNjc4NjI3NjE1NTQy.z96yUCqV-jyXo9s3pnzfyKRt6Wu1CFo4dk2foEFRIqwg.v8qJosUv-hrno0LDVud0oWw8N2jXezH_sDwqAfQ1u-0g.JPEG.ckdbqls0804/KakaoTalk_20230312_222206166.jpg'
  if (n.includes('비빔밥') || n.includes('한국집') || n.includes('성미당')) return 'https://search.pstatic.net/common/?src=https%3A%2F%2Fphinf.pstatic.net%2Ftvcast%2F20260727_144%2Fj9f6I_17851468622980lNaF_JPEG%2FPublishThumb_20260727_190556_782.jpg'
  if (n.includes('피순대') || n.includes('조점례')) return 'https://search.pstatic.net/common/?src=https%3A%2F%2Fphinf.pstatic.net%2Ftvcast%2F20260727_140%2F0B3sM_1785114262462CCrIr_JPEG%2Fthumbnail-12BF3D79-43D9-42E0-875E-4FD3EB677ED8.jpg'
  if (n.includes('떡갈비') || n.includes('교동떡갈비')) return 'https://search.pstatic.net/common/?src=https://blogpfthumb-phinf.pstatic.net/MjAyMTA3MDZfMTIz/MDAxNic1NTY1NjA3Mzc4.t-InaivQMvzLWYma0BfPrxNCSgw2fI5i_HrJXFZ1aL4g.YbSGHlmtEh5_PoMmvUdpSdSqD32tTroRKMQ39hsasbUg.JPEG.flowerface1/KakaoTalk_20210615_221208964.jpg'
  if (n.includes('초코파이') || n.includes('풍년제과') || n.includes('pnb')) return 'https://search.pstatic.net/common/?src=http://blogpfthumb.phinf.naver.net/MjAyNjAzMDVfMTc0/MDAxNzcyNjc5NjQ2MzQz.gSd_YgMhVfOkupVHdgLT12Bf4r3rBbzfrjAhaxbNILQg.9GRIEjBRDccWaBIXE4SoY8HMejh05bw3pgI_mCjxizYg.PNG/profileImage.png'
  if (n.includes('외할머니솜씨')) return 'https://search.pstatic.net/common/?src=https%3A%2F%2Fphinf.pstatic.net%2Ftvcast%2F20260728_251%2FDd7Es_1785246631783UuepL_JPEG%2Fthumbnail-566E5ECF-A1CA-423E-AAAE-227D73BE944B.jpg'
  if (n.includes('메가MGC') || n.includes('메가커피')) return 'https://search.pstatic.net/common/?src=https://blogpfthumb-phinf.pstatic.net/MjAyNjA6MjdfMjUg/MDAxNzgyNTE4NzExMjM3.pzN0_WpGnTBMdevaolfMbAaVyswSmztLS08N2BiZRzkg.4eTwDMl8WQuJ8vMpdHYEpPDzPoK2orwtTVUQaE-oqEwg.PNG/profileImage.png'
  if (n.includes('빽다방')) return 'https://search.pstatic.net/common/?src=https%3A%2F%2Fphinf.pstatic.net%2Fcontact%2F20180731_121%2F1532997335601Ya7zT_PNG%2F%25A9%25A7.PNG'
  if (n.includes('스타벅스') || n.includes('스벅')) return 'https://search.pstatic.net/common/?src=https%3A%2F%2Fphinf.pstatic.net%2Ftvcast%2F20260718_80%2FxWQvZ_1784335419338eNwqz_JPEG%2Fthumbnail-09C19579-F91B-4DA6-AF1B-1D70DF3792DE.jpg'
  if (n.includes('버거킹')) return 'https://search.pstatic.net/common/?src=http://image.nmv.naver.net/blog_2023_10_03_1505/9246c4c1-61aa-11ee-8382-505dacfbaa5c_01.jpg'
  if (n.includes('맥도날드')) return 'https://search.pstatic.net/common/?src=https%3A%2F%2Fphinf.pstatic.net%2Ftvcast%2F20240923_116%2FTYTJg_1727019164562NcATs_JPEG%2F0EE5BF7D-A02D-4E9E-A4AC-D9A29E7F4D21.jpg'
  if (n.includes('맘스터치')) return 'https://search.pstatic.net/common/?src=https://blogpfthumb-phinf.pstatic.net/MjAyNjA6MzBfOTkg/MDAxNzgyODA8MDIyODYx.RaCzcqfa_kuZA9cqEgi4aLoyLEyBvVtwM9-N2Keyi-Mg.uhk5OZCGvlxGQiU-kt5dmL4y745rxPyswZ4e2cOpUwog.JPEG/profileImage.jpg'
  if (n.includes('롯데리아')) return 'https://search.pstatic.net/common/?src=https://homebuilder-phinf.pstatic.net/MjAyNDAzMTlfMTY3/MDAxNzEwODM4NDM0NTI4.P3MjwYiVqmEY6Os52CJf9fUWOBgFejpotBpqSGNTrCcg.JNT2B6r8Lpp-4xfPD-_zSiBcUIdXJxCwDtWThMQfUWwg.JPEG/1710838434424_1000034247-01.jpeg'
  if (n.includes('투썸')) return 'https://search.pstatic.net/common/?src=https://blogpfthumb-phinf.pstatic.net/MjAyNTA4MTBfMTUx/MDAxNzU4ODA5NTc3OTg0.CqVhOLtTZRqNDo3419fuWOd6BMY3h_VOxVKJ5W0EJ9wg.kAO038HZyak7TBUHfJRaGEUWuCaYWe2BLo4039IICK4g.JPEG/profileImage.jpg'
  if (n.includes('설빙')) return 'https://search.pstatic.net/common/?src=https://blogpfthumb-phinf.pstatic.net/MjAyMzA3MjRfMTQ0/MDAxNjkwMTYwMzYwODY5.ing5oZSGpbbNCyx0di6CHLnDYQ1A1uNev0I4wPif698g.9kJIuywk03aIV9krLG1HHIrLPwlA8eTnwdxwyamKp3kg.JPEG.wjddbwls8008/profileImage.jpg'
  if (n.includes('다이소')) return 'https://search.pstatic.net/common/?src=https%3A%2F%2Fphinf.pstatic.net%2Ftvcast%2F20250416_141%2FmNXLN_1744809209519NWlVt_JPEG%2FPublishThumb_20250416_221311_201.jpg'
  if (n.includes('올리브영')) return 'https://search.pstatic.net/common/?src=https://blogpfthumb-phinf.pstatic.net/MjAyMjA4MjlfNjEg/MDAxNjYxNzM4NDA0NTUz.jdwc85AWWgZ9icIW5hqPoBglLAEuhwHZ9xIkgdPV0DUg.ZME2BUfNTU3vfat9CBreNPxA8pQr9ypkxMyipIKzjQAg.JPEG.tamnarang/profileImage.jpg'
  if (c.includes('카페') || c.includes('디저트') || c.includes('찻집')) return 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
  if (c.includes('식당') || c.includes('맛집') || c.includes('패스트푸드') || c.includes('버거') || c.includes('먹거리')) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
  if (c.includes('체험') || c.includes('공방')) return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
  return 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80'
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
  // ☕ 메가MGC커피 (Mega Coffee) 전주 실제 지점들 (100% 네이버 지도 실제 주소)
  {
    name: '메가MGC커피 전주한옥마을점',
    category: '☕ 디저트/카페 (메가커피 한옥마을점)',
    subCategory: 'cafe',
    cost: 3500,
    costLabel: '음료 약 3,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 태조로 31 (전동 59-1, 경기전 부근)',
    lat: 35.8145,
    lng: 127.1480,
    mapX: 58,
    mapY: 52,
    operatingHours: '08:00 - 22:00',
    tags: ['#메가커피', '#메가MGC커피', '#전주한옥마을점', '#가성비커피', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 한옥마을 경기전 앞 태조로 31에 위치한 메가MGC커피 한옥마을점입니다.',
    keywords: ['메가커피', '메가MGC커피', '메가커피 한옥마을', '한옥마을 메가커피', '전주 메가커피', '메가MGC커피 전주한옥마을점'],
    naverMapUrl: 'https://map.naver.com/v5/search/메가MGC커피%20전주한옥마을점',
  },
  {
    name: '메가MGC커피 전주객사점',
    category: '☕ 디저트/카페 (메가커피 객사점)',
    subCategory: 'cafe',
    cost: 3500,
    costLabel: '음료 약 3,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 전주객사4길 28 (고사동 144-1)',
    lat: 35.8187,
    lng: 127.1433,
    mapX: 54,
    mapY: 47,
    operatingHours: '08:00 - 22:00',
    tags: ['#메가커피', '#메가MGC커피', '#전주객사점', '#객리단길', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 객사 영화의거리에 위치한 메가MGC커피 전주객사점입니다.',
    keywords: ['메가커피', '메가MGC커피', '메가커피 객사', '객사 메가커피'],
    naverMapUrl: 'https://map.naver.com/v5/search/메가MGC커피%20전주객사점',
  },
  {
    name: '메가MGC커피 전북대점',
    category: '☕ 디저트/카페 (메가커피 전북대점)',
    subCategory: 'cafe',
    cost: 3500,
    costLabel: '음료 약 3,500원',
    isIndoor: true,
    address: '전북 전주시 덕진구 명륜3길 10 (덕진동1가 1264-12)',
    lat: 35.8475,
    lng: 127.1290,
    mapX: 45,
    mapY: 18,
    operatingHours: '08:00 - 22:00',
    tags: ['#메가커피', '#메가MGC커피', '#전북대점', '#대학로카페', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전북대 구정문 대학로에 위치한 메가MGC커피 전북대점입니다.',
    keywords: ['메가커피', '메가MGC커피', '메가커피 전북대', '전북대 메가커피'],
    naverMapUrl: 'https://map.naver.com/v5/search/메가MGC커피%20전북대점',
  },
  {
    name: '메가MGC커피 전주신시가지점',
    category: '☕ 디저트/카페 (메가커피 신시가지점)',
    subCategory: 'cafe',
    cost: 3500,
    costLabel: '음료 약 3,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 홍산남로 56 (효자동3가 1535-2)',
    lat: 35.8155,
    lng: 127.1075,
    mapX: 22,
    mapY: 55,
    operatingHours: '08:00 - 22:00',
    tags: ['#메가커피', '#메가MGC커피', '#전주신시가지점', '#효자동', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 도청 신시가지에 위치한 메가MGC커피 신시가지점입니다.',
    keywords: ['메가커피', '메가MGC커피', '메가커피 신시가지', '효자동 메가커피'],
    naverMapUrl: 'https://map.naver.com/v5/search/메가MGC커피%20전주신시가지점',
  },
  // 🍔 버거킹 (Burger King) 전주 실제 지점들
  {
    name: '버거킹 전주중앙점',
    category: '🍔 패스트푸드 (버거킹 전주중앙점)',
    subCategory: 'dining',
    cost: 8500,
    costLabel: '와퍼 세트 약 8,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 팔달로 190 (고사동 1-4, 객사 입구)',
    lat: 35.8178,
    lng: 127.1442,
    mapX: 54,
    mapY: 48,
    operatingHours: '09:00 - 23:00',
    tags: ['#버거킹', '#전주중앙점', '#전주객사', '#중앙동맛집', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 객사 영화의거리 입구 팔달로에 위치한 버거킹 전주중앙점입니다.',
    keywords: ['버거킹', '버거킹 전주', '버거킹 중앙', '전주중앙점 버거킹', '버거킹 전주중앙점', '버거킹 객사', '객사 버거킹', '중앙동 버거킹', '와퍼'],
    naverMapUrl: 'https://map.naver.com/v5/search/버거킹%20전주중앙점',
  },
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
  {
    name: '롯데리아 전주객사점',
    category: '🍔 패스트푸드 (롯데리아 전주객사점)',
    subCategory: 'dining',
    cost: 7500,
    costLabel: '불고기버거 세트 약 7,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 팔달로 186 (고사동 1-1)',
    lat: 35.8175,
    lng: 127.1440,
    mapX: 54,
    mapY: 48,
    operatingHours: '08:00 - 23:00',
    tags: ['#롯데리아', '#전주객사점', '#불고기버거', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 객사 팔달로 입구에 위치한 롯데리아 전주객사점입니다.',
    keywords: ['롯데리아', '롯데리아 객사', '객사 롯데리아'],
    naverMapUrl: 'https://map.naver.com/v5/search/롯데리아%20전주객사점',
  },
  {
    name: '롯데리아 전북대점',
    category: '🍔 패스트푸드 (롯데리아 전북대점)',
    subCategory: 'dining',
    cost: 7500,
    costLabel: '불고기버거 세트 약 7,500원',
    isIndoor: true,
    address: '전북 전주시 덕진구 백제대로 567 (덕진동1가 1263-5)',
    lat: 35.8470,
    lng: 127.1290,
    mapX: 46,
    mapY: 19,
    operatingHours: '08:00 - 23:00',
    tags: ['#롯데리아', '#전북대점', '#대학로맛집', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전북대 구정문 대학로에 위치한 롯데리아 전북대점입니다.',
    keywords: ['롯데리아', '롯데리아 전북대', '전북대 롯데리아'],
    naverMapUrl: 'https://map.naver.com/v5/search/롯데리아%20전북대점',
  },
  {
    name: '맘스터치 전주객사점',
    category: '🍗 버거/치킨 (맘스터치 전주객사점)',
    subCategory: 'dining',
    cost: 7500,
    costLabel: '싸이버거 세트 약 7,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 전주객사4길 25 (고사동 143-1)',
    lat: 35.8185,
    lng: 127.1432,
    mapX: 54,
    mapY: 48,
    operatingHours: '10:30 - 22:00',
    tags: ['#맘스터치', '#전주객사점', '#싸이버거', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 객사 영화의거리에 위치한 맘스터치 전주객사점입니다.',
    keywords: ['맘스터치', '맘스터치 객사', '객사 맘스터치', '싸이버거'],
    naverMapUrl: 'https://map.naver.com/v5/search/맘스터치%20전주객사점',
  },
  {
    name: '맘스터치 전북대점',
    category: '🍗 버거/치킨 (맘스터치 전북대점)',
    subCategory: 'dining',
    cost: 7500,
    costLabel: '싸이버거 세트 약 7,500원',
    isIndoor: true,
    address: '전북 전주시 덕진구 명륜3길 14 (덕진동1가 1264-10)',
    lat: 35.8475,
    lng: 127.1290,
    mapX: 45,
    mapY: 18,
    operatingHours: '10:30 - 22:00',
    tags: ['#맘스터치', '#전북대점', '#대학로맛집', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전북대 구정문 대학로에 위치한 맘스터치 전북대점입니다.',
    keywords: ['맘스터치', '맘스터치 전북대', '전북대 맘스터치'],
    naverMapUrl: 'https://map.naver.com/v5/search/맘스터치%20전북대점',
  },
  {
    name: '빽다방 전주객사점',
    category: '☕ 가성비 카페 (빽다방 전주객사점)',
    subCategory: 'cafe',
    cost: 3500,
    costLabel: '아메리카노/라떼 약 3,500원',
    isIndoor: true,
    address: '전북 전주시 완산구 전주객사4길 32 (고사동 144-2)',
    lat: 35.8188,
    lng: 127.1435,
    mapX: 54,
    mapY: 47,
    operatingHours: '08:00 - 22:00',
    tags: ['#빽다방', '#전주객사점', '#가성비커피', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전주 객사 영화의거리에 위치한 빽다방 전주객사점입니다.',
    keywords: ['빽다방', '빽다방 객사', '객사 빽다방', '빽사이즈'],
    naverMapUrl: 'https://map.naver.com/v5/search/빽다방%20전주객사점',
  },
  {
    name: '빽다방 전북대점',
    category: '☕ 가성비 카페 (빽다방 전북대점)',
    subCategory: 'cafe',
    cost: 3500,
    costLabel: '아메리카노/라떼 약 3,500원',
    isIndoor: true,
    address: '전북 전주시 덕진구 권삼득로 300 (덕진동1가 1262-1)',
    lat: 35.8465,
    lng: 127.1285,
    mapX: 45,
    mapY: 19,
    operatingHours: '08:00 - 22:00',
    tags: ['#빽다방', '#전북대점', '#가성비커피', '#네이버지도실제위치'],
    reason: '네이버 지도로 실제 전북대 구정문에 위치한 빽다방 전북대점입니다.',
    keywords: ['빽다방', '빽다방 전북대', '전북대 빽다방'],
    naverMapUrl: 'https://map.naver.com/v5/search/빽다방%20전북대점',
  },
]

// 경로 최단거리에 가장 가까운 순서대로 전주 실제 실존 매장 POI 목록 정렬 반환 함수
export function findNearestJeonjuRealPois(query: string, currentPlaces: Place[]): Place[] {
  if (!query.trim()) return []
  const rawQ = query.trim()
  const q = rawQ.toLowerCase()
  const cleanQ = q.replace(/\s+/g, '')

  // 1. 100% 실존 POI 데이터베이스 검색 (가상 지점 생성 없음)
  const candidates = JEONJU_REAL_POI_DATABASE.filter((poi) => {
    const poiNameLower = poi.name.toLowerCase()
    const poiAddressLower = poi.address?.toLowerCase() || ''
    const poiNameClean = poiNameLower.replace(/\s+/g, '')

    if (poiNameLower.includes(q) || poiNameClean.includes(cleanQ) || cleanQ.includes(poiNameClean)) return true
    if (poiAddressLower.includes(q)) return true

    return poi.keywords.some((k) => {
      const kClean = k.toLowerCase().replace(/\s+/g, '')
      const kShort = kClean.replace(/전주|점|dt/g, '').trim()
      return (
        kClean.includes(cleanQ) ||
        cleanQ.includes(kClean) ||
        (kShort.length >= 2 && cleanQ.includes(kShort)) ||
        (cleanQ.length >= 2 && kShort.includes(cleanQ))
      )
    })
  })

  if (candidates.length === 0) return []

  // 2. 현재 코스 장소들의 중심 좌표 계산
  let centerLat = 35.8140
  let centerLng = 127.1510
  if (currentPlaces && currentPlaces.length > 0) {
    const validPlaces = currentPlaces.filter((p) => p.lat && p.lng)
    if (validPlaces.length > 0) {
      centerLat = validPlaces.reduce((sum, p) => sum + (p.lat || 35.814), 0) / validPlaces.length
      centerLng = validPlaces.reduce((sum, p) => sum + (p.lng || 127.151), 0) / validPlaces.length
    }
  }

  // 3. 지리적 거리(km/m) 계산 및 최단거리 오름차순 정렬
  const mapped = candidates.map((cand) => {
    const dLat = (cand.lat - centerLat) * 111
    const dLng = (cand.lng - centerLng) * 88
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng)
    return { cand, distKm }
  })

  mapped.sort((a, b) => {
    const aName = a.cand.name.toLowerCase()
    const bName = b.cand.name.toLowerCase()
    const aExact = aName.includes(q) || cleanQ.includes(aName.replace(/\s+/g, ''))
    const bExact = bName.includes(q) || cleanQ.includes(bName.replace(/\s+/g, ''))

    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1
    return a.distKm - b.distKm
  })

  return mapped.map(({ cand, distKm }, idx) => {
    const distText = distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`
    const isNearest = idx === 0

    return {
      id: `poi-${cand.name}-${Date.now()}-${idx}`,
      order: 0,
      name: cand.name,
      category: cand.category,
      subCategory: cand.subCategory as any,
      cost: cand.cost,
      costLabel: cand.costLabel,
      walkMinutes: Math.max(3, Math.round(distKm * 12)),
      reason: isNearest
        ? `🎯 현재 동선에서 가장 가까운 실제 매장입니다! (거리 약 ${distText})`
        : `📍 전주 현지 실존 매장 (${cand.address} · 거리 약 ${distText})`,
      isMustVisit: true,
      isIndoor: cand.isIndoor,
      mapX: cand.mapX,
      mapY: cand.mapY,
      lat: cand.lat,
      lng: cand.lng,
      address: cand.address,
      operatingHours: cand.operatingHours,
      tags: [
        isNearest ? '#🎯현재동선최단추천' : '#실제위치',
        `#거리_${distText}`,
        `#${cand.name}`,
        '#네이버지도실존',
      ],
      suggestedDuration: '45분',
      tips: `💡 네이버 지도에 실제 등록된 전주 현지 매장입니다. (${cand.address})`,
      naverMapUrl: cand.naverMapUrl,
    }
  })
}

// 하위 호환성을 위한 단일 매장 추출 보조 함수
export function findNearestJeonjuRealPoi(query: string, currentPlaces: Place[]): Place | null {
  const results = findNearestJeonjuRealPois(query, currentPlaces)
  return results.length > 0 ? results[0] : null
}

