import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Mail, Compass, Bookmark, Trash2, Calendar, Clock, Wallet, Check, ExternalLink, Play, Star, Edit3, Send, MapPin, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RegisteredUser } from '@/components/auth-modal'
import { getAppLang, setAppLang, t, tPlaceName, tWeatherSummary, type AppLang } from '@/lib/i18n'
import {
  getSavedCourses,
  deleteCourseFromUser,
  SavedCourse,
  updateCourseReviewInStorage,
  deleteCourseReviewFromStorage,
  SpotRating,
} from '@/lib/course-storage'

interface MyPageModalProps {
  isOpen: boolean
  onClose: () => void
  user: RegisteredUser | null
}

const SATISFACTION_TAG_OPTIONS = [
  '🚀 최적의 최단 동선',
  '🎒 여유롭고 한적함',
  '🍱 알찬 맛집 배치',
  '🌧️ 날씨 맞춤 유용함',
  '📸 인스타 감성 포토존',
  '💰 가성비 만점',
  '👟 걷기 좋은 코스',
  '☕ 특색있는 카페',
]

const TAG_EN_MAP: Record<string, string> = {
  '🚀 최적의 최단 동선': '🚀 Optimal Shortest Route',
  '🎒 여유롭고 한적함': '🎒 Relaxed & Peaceful',
  '🍱 알찬 맛집 배치': '🍱 Great Food Places',
  '🌧️ 날씨 맞춤 유용함': '🌧️ Useful Weather Match',
  '📸 인스타 감성 포토존': '📸 Instagrammable Photo Spot',
  '💰 가성비 만점': '💰 Great Value for Money',
  '👟 걷기 좋은 코스': '👟 Great Walking Course',
  '☕ 특색있는 카페': '☕ Unique Cafe Experience',
}

function tTag(tag: string, lang: AppLang): string {
  if (lang === 'ko') return tag
  return TAG_EN_MAP[tag] || tag
}

function tCourseTitle(title: string, lang: AppLang): string {
  if (lang === 'ko' || !title) return title
  return title
    .replace('전주 실시간:', 'Jeonju Live:')
    .replace('맞춤 즉흥 코스', 'Customized Course')
    .replace('개 스팟', ' Spots')
    .replace('맑음', 'Sunny')
    .replace('구름 많음', 'Cloudy')
    .replace('흐림', 'Overcast')
    .replace('비 옴', 'Rainy')
    .replace('눈 옴', 'Snowy')
}

export function MyPageModal({ isOpen, onClose, user }: MyPageModalProps) {
  const router = useRouter()
  const [courses, setCourses] = useState<SavedCourse[]>([])
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('')
  const [lang, setLang] = useState<AppLang>('ko')

  // 👤 현재 로그인 유저 세션 및 다국어 상태 관리
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(user)

  useEffect(() => {
    setLang(getAppLang())
    const handleLangChange = () => setLang(getAppLang())
    window.addEventListener('jeonju_lang_changed', handleLangChange)
    window.addEventListener('storage', handleLangChange)

    return () => {
      window.removeEventListener('jeonju_lang_changed', handleLangChange)
      window.removeEventListener('storage', handleLangChange)
    }
  }, [])

  useEffect(() => {
    if (user) {
      setCurrentUser(user)
    } else if (isOpen) {
      try {
        const saved = localStorage.getItem('jeonju_current_user')
        if (saved) {
          setCurrentUser(JSON.parse(saved))
        } else {
          setCurrentUser(null)
        }
      } catch (e) {
        setCurrentUser(null)
      }
    }
  }, [isOpen, user])

  // 현재 리뷰 편집 중인 코스 ID
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [editTags, setEditTags] = useState<string[]>(['🚀 최적의 최단 동선', '🍱 알찬 맛집 배치'])
  const [editContent, setEditContent] = useState<string>('')

  // 📍 장소별 개별 평점 (날씨 어울림 & 재미)
  const [editSpotRatings, setEditSpotRatings] = useState<Record<string, { weatherScore: number; funScore: number; comment: string }>>({})

  useEffect(() => {
    if (isOpen && currentUser?.email) {
      const saved = getSavedCourses(currentUser.email)
      setCourses(saved)
    }
  }, [isOpen, currentUser?.email])

  if (!isOpen) return null

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4 font-sans">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
          <div className="size-12 mx-auto flex items-center justify-center rounded-2xl bg-amber-100 text-amber-900 text-2xl font-bold">
            📂
          </div>
          <h3 className="text-lg font-bold text-slate-900">{t('로그인이 필요한 서비스입니다', 'Login Required', lang)}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('저장한 여행 코스 관리 및 세부 평점 기능을 이용하시려면 먼저 상단에서 로그인해 주세요!', 'Please log in to manage saved courses and leave reviews!', lang)}
          </p>
          <Button
            onClick={onClose}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold cursor-pointer"
          >
            {t('확인', 'OK', lang)}
          </Button>
        </div>
      </div>
    )
  }

  const handleDeleteCourse = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation()
    if (!confirm(t('이 저장된 여행 코스를 삭제하시겠습니까?', 'Delete this saved course?', lang))) return
    const success = deleteCourseFromUser(currentUser.email, courseId)
    if (success) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
      setDeleteSuccessMsg(t('코스가 삭제되었습니다.', 'Course deleted.', lang))
      setTimeout(() => setDeleteSuccessMsg(''), 2000)
    }
  }

  // 리뷰 작성/수정 창 열기
  const handleStartReview = (e: React.MouseEvent, c: SavedCourse) => {
    e.stopPropagation()
    setEditingCourseId(c.id)
    setEditRating(c.rating || 5)
    setEditTags(c.satisfactionTags || ['🚀 최적의 최단 동선', '🍱 알찬 맛집 배치'])
    setEditContent(c.reviewContent || '')

    // 장소별 개별 평점 초기화
    const initialSpotRatings: Record<string, { weatherScore: number; funScore: number; comment: string }> = {}
    c.spots.forEach((spot) => {
      const existing = c.spotRatings?.find((sr) => sr.spotName === spot.name)
      initialSpotRatings[spot.name] = {
        weatherScore: existing?.weatherScore || 5,
        funScore: existing?.funScore || 5,
        comment: existing?.comment || '',
      }
    })
    setEditSpotRatings(initialSpotRatings)
  }

  // 리뷰 및 평점 저장
  const handleSaveReview = (e: React.FormEvent, courseId: string, c: SavedCourse) => {
    e.stopPropagation()
    e.preventDefault()

    const spotRatingsList: SpotRating[] = c.spots.map((spot) => {
      const rating = editSpotRatings[spot.name] || { weatherScore: 5, funScore: 5, comment: '' }
      return {
        spotName: spot.name,
        weatherScore: rating.weatherScore,
        funScore: rating.funScore,
        comment: rating.comment ? rating.comment.trim() : undefined,
      }
    })

    const success = updateCourseReviewInStorage(currentUser.email, courseId, {
      rating: editRating,
      satisfactionTags: editTags,
      reviewContent: editContent.trim(),
      spotRatings: spotRatingsList,
    })

    if (success) {
      setCourses((prev) =>
        prev.map((item) =>
          item.id === courseId
            ? {
                ...item,
                rating: editRating,
                satisfactionTags: editTags,
                reviewContent: editContent.trim(),
                spotRatings: spotRatingsList,
                reviewedAt: new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }),
              }
            : item
        )
      )
      setEditingCourseId(null)
      setDeleteSuccessMsg(t('🎉 코스 및 장소별 세부 별점·후기가 저장되었습니다!', '🎉 Review and ratings saved!', lang))
      setTimeout(() => setDeleteSuccessMsg(''), 3000)
    }
  }

  // 리뷰 삭제
  const handleDeleteReview = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation()
    if (!confirm(t('작성하신 별점과 후기를 삭제하시겠습니까?', 'Delete rating and review?', lang))) return

    const success = deleteCourseReviewFromStorage(currentUser.email, courseId)
    if (success) {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id === courseId) {
            const { rating, satisfactionTags, reviewContent, reviewedAt, spotRatings, ...rest } = c
            return rest
          }
          return c
        })
      )
      setDeleteSuccessMsg(t('후기가 삭제되었습니다.', 'Review deleted.', lang))
      setTimeout(() => setDeleteSuccessMsg(''), 2000)
    }
  }

  const toggleTag = (tag: string) => {
    if (editTags.includes(tag)) {
      setEditTags(editTags.filter((t) => t !== tag))
    } else {
      setEditTags([...editTags, tag])
    }
  }

  // 🎯 저장한 요약 코스를 누르면 결과화면(인터랙티브 지도/가이드북 풀버전)으로 그대로 이동
  const handleOpenSavedCourse = (c: SavedCourse) => {
    const params = new URLSearchParams()
    if (c.startLocation) params.set('startLocation', c.startLocation)
    if (c.startAddress) params.set('startAddress', c.startAddress)
    if (c.mustVisit) params.set('mustVisit', c.mustVisit)
    if (c.timeOption) params.set('time', c.timeOption)
    params.set('budget', String(c.totalBudget || 50000))
    if (c.companion) params.set('companion', c.companion)
    if (c.weatherParam) params.set('weather', c.weatherParam)
    if (c.transport) params.set('transport', c.transport)

    onClose()
    router.push(`/result?${params.toString()}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 font-bold">
              📂
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('내 정보 관리 & 저장한 코스', 'My Info & Saved Courses', lang)}</h2>
              <p className="text-xs text-slate-500">{t('저장된 코스에서 전체 평점 및 장소별 세부 평점(날씨 조화 & 재미)을 기록해보세요', 'Manage saved courses and ratings', lang)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 🌐 다국어 언어 설정 (Language Settings) 카드 */}
          <div className="flex items-center justify-between rounded-xl border border-amber-300/80 bg-amber-50/80 px-4 py-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Globe className="size-4 text-amber-700" />
              <span>🌐 {t('언어 설정 (Language)', 'Language Settings', lang)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAppLang('ko')}
                className={`px-3 py-1 rounded-lg font-black transition-all text-xs cursor-pointer ${
                  lang === 'ko'
                    ? 'bg-amber-500 text-amber-950 shadow-xs border border-amber-400'
                    : 'bg-white text-slate-700 hover:bg-amber-100/70 border border-slate-200'
                }`}
              >
                🇰🇷 한국어
              </button>
              <button
                type="button"
                onClick={() => setAppLang('en')}
                className={`px-3 py-1 rounded-lg font-black transition-all text-xs cursor-pointer ${
                  lang === 'en'
                    ? 'bg-amber-500 text-amber-950 shadow-xs border border-amber-400'
                    : 'bg-white text-slate-700 hover:bg-amber-100/70 border border-slate-200'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-amber-100/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-amber-500 text-amber-950 font-extrabold text-lg shadow-2xs">
                  {currentUser.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{currentUser.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/70 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      ⚡ {currentUser.travelStyle === 'J' ? t('계획형 (J)', 'Planner (J)', lang) : t('즉흥형 (P)', 'Spontaneous (P)', lang)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="size-3.5" /> {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold bg-white/80 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-950 shadow-2xs">
                <Bookmark className="size-4 text-amber-600" />
                {t('저장한 코스', 'Saved Courses', lang)} <span className="text-amber-700 font-extrabold">{courses.length}</span>{t('개', '', lang)}
              </div>
            </div>
          </div>

          {/* Delete Feedback Message */}
          {deleteSuccessMsg && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
              <Check className="size-4 text-emerald-600" /> {deleteSuccessMsg}
            </div>
          )}

          {/* Saved Courses Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Compass className="size-4 text-sky-600" /> {t('내가 저장한 여행 코스 목록 (코스 및 장소별 세부 평점 작성)', 'My Saved Travel Courses (Course & Spot Ratings)', lang)}
            </h3>

            {courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <p className="text-2xl mb-2">📌</p>
                <p className="text-sm font-semibold text-slate-700">{t('아직 저장한 여행 코스가 없습니다', 'No saved travel courses yet', lang)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {t('메인 화면에서 날씨·위치·예산 맞춤 코스를 추천받은 후', 'Get custom course recommendations on the main page and click', lang)} <br />
                  <span className="font-bold text-amber-800">[{t('📌 이 코스 내 정보에 저장하기', '📌 Save Course to My Info', lang)}]</span> {t('버튼을 눌러보세요!', 'to save courses!', lang)}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleOpenSavedCourse(c)}
                    className="group relative rounded-xl border border-sky-100 bg-white p-4.5 shadow-sm hover:border-sky-400 hover:shadow-md transition-all cursor-pointer overflow-hidden space-y-3"
                  >
                    {/* Hover Highlight Banner */}
                    <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>{t('결과화면 풀버전 열기', 'Open Full Result Page', lang)}</span>
                      <ExternalLink className="size-3" />
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition-colors">
                            {tCourseTitle(c.title, lang)}
                          </span>
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {c.weatherEmoji} {tWeatherSummary(c.weatherSummary, lang)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar className="size-3" /> {t('저장일시:', 'Saved:', lang)} {c.savedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleStartReview(e, c)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors cursor-pointer border border-amber-300"
                          title={t('이 코스 및 장소별 평점 작성', 'Edit rating & review', lang)}
                        >
                          <Edit3 className="size-3.5 text-amber-700" />
                          <span>{c.rating ? t('✏️ 평점/후기 수정', '✏️ Edit Rating / Review', lang) : t('✍️ 평점/후기 작성', '✍️ Write Rating / Review', lang)}</span>
                        </button>

                        <button
                          onClick={(e) => handleDeleteCourse(e, c.id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="코스 삭제"
                        >
                          <Trash2 className="size-3.5" /> {t('삭제', 'Delete', lang)}
                        </button>
                      </div>
                    </div>

                    {/* Course Summary Chips */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100 font-medium">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="size-3.5 text-amber-600" /> {t('총', 'Total', lang)} {c.totalTravelMinutes}{t('분', ' min', lang)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Wallet className="size-3.5 text-emerald-600" /> ~{c.totalCost.toLocaleString()} {t('원', 'KRW', lang)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {t('동행:', 'Companion:', lang)} {c.companion} · {t('이동:', 'Transport:', lang)} {c.transport}
                      </span>
                    </div>

                    {/* Spots Route Path */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-700">📍 {t('추천 방문 코스 순서:', 'Course Order:', lang)}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-800 font-medium">
                        {c.spots.map((spot, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="rounded-md bg-white border border-sky-200 px-2 py-0.5 text-sky-950 font-bold shadow-xs">
                              {idx + 1}. {tPlaceName(spot.name, lang)}
                            </span>
                            {idx < c.spots.length - 1 && (
                              <span className="text-slate-300 font-bold">➔</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ✍️ 작성된 평점 & 후기 및 장소별 세부 평가 리스트 표시 */}
                    {c.rating && editingCourseId !== c.id && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            <span>{t('코스 총 평점:', 'Overall Course Rating:', lang)} {c.rating}.0 / 5.0 {t('점', 'pts', lang)}</span>
                          </div>

                          <button
                            onClick={(e) => handleDeleteReview(e, c.id)}
                            className="text-[11px] text-slate-400 hover:text-red-600 font-semibold cursor-pointer"
                          >
                            {t('후기 삭제', 'Delete Review', lang)}
                          </button>
                        </div>

                        {c.satisfactionTags && c.satisfactionTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {c.satisfactionTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-white border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900"
                              >
                                {tTag(tag, lang)}
                              </span>
                            ))}
                          </div>
                        )}

                        {c.reviewContent && (
                          <p className="text-slate-800 font-medium bg-white/90 p-2.5 rounded-lg border border-amber-100 leading-relaxed">
                            💬 "{c.reviewContent}"
                          </p>
                        )}

                        {/* 📍 장소별 세부 점수 카드 리스트 */}
                        {c.spotRatings && c.spotRatings.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-amber-200/80">
                            <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                              <MapPin className="size-3.5 text-amber-700" />
                              <span>📍 {t('장소별 세부 평점 (🌤️ 날씨 어울림 / 🎉 재미)', 'Spot Ratings (🌤️ Weather Fit / 🎉 Fun)', lang)}</span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                              {c.spotRatings.map((sr, srIdx) => (
                                <div key={srIdx} className="flex flex-col bg-white/90 p-2 rounded-lg border border-amber-200/80 shadow-2xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 truncate max-w-[130px]">{srIdx + 1}. {tPlaceName(sr.spotName, lang)}</span>
                                    <div className="flex items-center gap-1.5 font-bold text-[10px]">
                                      <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">🌤️ {sr.weatherScore}{t('점', ' pts', lang)}</span>
                                      <span className="text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">🎉 {sr.funScore}{t('점', ' pts', lang)}</span>
                                    </div>
                                  </div>
                                  {sr.comment && (
                                    <p className="text-[10.5px] text-slate-700 bg-amber-50/60 p-1.5 rounded border border-amber-100 font-normal">
                                      ✍️ "{sr.comment}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ✍️ 코스 & 장소별 인라인 작성/수정 박스 */}
                    {editingCourseId === c.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3.5 animate-in fade-in"
                      >
                        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                          <span className="font-bold text-amber-950 text-xs flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span>{t('이 저장 코스 & 포함 장소별 평점 작성하기', 'Rate this saved course & spots', lang)}</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCourseId(null)
                            }}
                            className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            {t('취소 ✕', 'Cancel ✕', lang)}
                          </button>
                        </div>

                        {/* 1. 코스 전체 별점 선택 */}
                        <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-200">
                          <span className="text-xs font-bold text-slate-800">{t('코스 전체 별점:', 'Overall Course Rating:', lang)}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setEditRating(star)}
                                className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`size-5 transition-colors ${
                                    star <= (hoverRating || editRating)
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-300 fill-slate-100'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-amber-800 ml-1">
                            {(hoverRating || editRating)}.0{t('점', ' pts', lang)}
                          </span>
                        </div>

                        {/* 2. 코스 만족도 키워드 칩 선택 */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-700">{t('만족도 키워드:', 'Satisfaction Keywords:', lang)}</span>
                          <div className="flex flex-wrap gap-1">
                            {SATISFACTION_TAG_OPTIONS.map((tag) => {
                              const isSelected = editTags.includes(tag)
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleTag(tag)}
                                  className={`rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all border cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-500 text-amber-950 border-amber-500'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {isSelected ? `✓ ${tTag(tag, lang)}` : tTag(tag, lang)}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* 3. 코스 소감 글 작성 */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-700">{t('코스 전체 소감:', 'Overall Course Review:', lang)}</span>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                            maxLength={300}
                            placeholder={t('이 여행 코스의 맛집, 동선, 팁 등 솔직한 소감을 작성해 보세요.', 'Write your honest review on food, route, tips, etc.', lang)}
                            className="w-full rounded-lg border border-amber-200 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-300 font-medium"
                          />
                        </div>

                        {/* 4. 📍 장소별 개별 세부 평점 (날씨 어울림 & 재미) */}
                        <div className="space-y-2 pt-2 border-t border-amber-200/80">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                              <MapPin className="size-3.5 text-amber-700" />
                              <span>📍 {t('장소별 개별 평점 (날씨 조화 & 재미 평가):', 'Spot Ratings (Weather Fit & Fun):', lang)}</span>
                            </span>
                            <span className="text-[10px] text-amber-800 font-medium">
                              {t('각 장소가 날씨에 어울렸는지, 얼마나 재미있었는지 평가해보세요!', 'Rate how well each spot fit the weather and how fun it was!', lang)}
                            </span>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {c.spots.map((spot, sIdx) => {
                              const sRating = editSpotRatings[spot.name] || { weatherScore: 5, funScore: 5, comment: '' }
                              return (
                                <div key={sIdx} className="rounded-lg border border-amber-200 bg-white p-2.5 space-y-1.5 text-xs shadow-2xs">
                                  <div className="font-bold text-slate-900 flex items-center justify-between">
                                    <span>{sIdx + 1}. {tPlaceName(spot.name, lang)} <span className="text-[10px] font-normal text-slate-400">({spot.category})</span></span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-amber-50/50 p-2 rounded-md border border-amber-100">
                                    {/* 🌤️ 날씨 어울림 점수 */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-medium text-slate-700">🌤️ {t('날씨 어울림:', 'Weather Fit:', lang)}</span>
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                              setEditSpotRatings({
                                                ...editSpotRatings,
                                                [spot.name]: { ...sRating, weatherScore: star },
                                              })
                                            }}
                                            className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                                          >
                                            <Star
                                              className={`size-3.5 ${
                                                star <= sRating.weatherScore
                                                  ? 'text-sky-500 fill-sky-400'
                                                  : 'text-slate-300 fill-slate-100'
                                              }`}
                                            />
                                          </button>
                                        ))}
                                        <span className="text-[10px] font-bold text-sky-800 ml-1">{sRating.weatherScore}{t('점', ' pts', lang)}</span>
                                      </div>
                                    </div>

                                    {/* 🎉 재미 / 만족도 점수 */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-medium text-slate-700">🎉 {t('재미/즐거움:', 'Fun/Enjoyment:', lang)}</span>
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                              setEditSpotRatings({
                                                ...editSpotRatings,
                                                [spot.name]: { ...sRating, funScore: star },
                                              })
                                            }}
                                            className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                                          >
                                            <Star
                                              className={`size-3.5 ${
                                                star <= sRating.funScore
                                                  ? 'text-amber-500 fill-amber-400'
                                                  : 'text-slate-300 fill-slate-100'
                                              }`}
                                            />
                                          </button>
                                        ))}
                                        <span className="text-[10px] font-bold text-amber-800 ml-1">{sRating.funScore}{t('점', ' pts', lang)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* ✍️ 장소별 개별 한줄평 입력 */}
                                  <div className="pt-0.5">
                                    <input
                                      type="text"
                                      value={sRating.comment || ''}
                                      onChange={(e) => {
                                        setEditSpotRatings({
                                          ...editSpotRatings,
                                          [spot.name]: { ...sRating, comment: e.target.value },
                                        })
                                      }}
                                      placeholder={t('✍️ 이 장소 한줄평 후기 (선택사항 - 안 적어도 평점 100% 저장됨)', '✍️ One-line spot review (Optional)', lang)}
                                      className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-800 outline-none focus:border-amber-400 placeholder:text-slate-400 font-normal"
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => handleSaveReview(e, c.id, c)}
                            className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-1.5 text-xs shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <Send className="size-3" />
                            <span>{t('평점/후기 저장', 'Save Rating & Review', lang)}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Button Banner */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-700 group-hover:underline flex items-center gap-1">
                        <Play className="size-3 fill-sky-700" />
                        {t('이 코스 풀 모드로 길찾기 & 지도·가이드북 상세보기', 'Open full navigation & interactive map guidebook', lang)}
                      </span>
                      <span className="text-[11px] font-extrabold text-white bg-slate-900 group-hover:bg-sky-600 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-xs">
                        {t('결과화면 열기', 'Open Result', lang)} <ArrowIcon />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl px-5 py-2 cursor-pointer"
          >
            {t('확인 및 닫기', 'Confirm & Close', lang)}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg className="size-3 fill-current" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}
