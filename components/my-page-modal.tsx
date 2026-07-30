import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Mail, Compass, Bookmark, Trash2, Calendar, Clock, Wallet, Check, ExternalLink, Play, Star, MessageSquarePlus, Edit3, Tag, Send, MapPin, SunMedium } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RegisteredUser } from '@/components/auth-modal'
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

export function MyPageModal({ isOpen, onClose, user }: MyPageModalProps) {
  const router = useRouter()
  const [courses, setCourses] = useState<SavedCourse[]>([])
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('')

  // 👤 현재 로그인 유저 세션 관리 (부모 user prop 또는 localStorage 자동 복원)
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(user)

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
          <h3 className="text-lg font-bold text-slate-900">로그인이 필요한 서비스입니다</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            저장한 여행 코스 관리 및 세부 평점 기능을 이용하시려면 먼저 상단에서 로그인해 주세요!
          </p>
          <Button
            onClick={onClose}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold cursor-pointer"
          >
            확인
          </Button>
        </div>
      </div>
    )
  }

  const handleDeleteCourse = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation()
    if (!confirm('이 저장된 여행 코스를 삭제하시겠습니까?')) return
    const success = deleteCourseFromUser(currentUser.email, courseId)
    if (success) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
      setDeleteSuccessMsg('코스가 삭제되었습니다.')
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

  // 리뷰 저장
  const handleSaveReview = (e: React.FormEvent, courseId: string, c: SavedCourse) => {
    e.stopPropagation()
    e.preventDefault()

    if (!editContent.trim()) {
      alert('후기 소감 내용을 작성해주세요!')
      return
    }

    const spotRatingsList: SpotRating[] = c.spots.map((spot) => {
      const rating = editSpotRatings[spot.name] || { weatherScore: 5, funScore: 5, comment: '' }
      return {
        spotName: spot.name,
        weatherScore: rating.weatherScore,
        funScore: rating.funScore,
        comment: rating.comment,
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
      setDeleteSuccessMsg('🎉 코스 및 장소별 세부 별점·후기가 저장되었습니다!')
      setTimeout(() => setDeleteSuccessMsg(''), 3000)
    }
  }

  // 리뷰 삭제
  const handleDeleteReview = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation()
    if (!confirm('작성하신 별점과 후기를 삭제하시겠습니까?')) return

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
      setDeleteSuccessMsg('후기가 삭제되었습니다.')
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
              <h2 className="text-base font-bold text-slate-900">내 정보 관리 & 저장한 코스</h2>
              <p className="text-xs text-slate-500">저장된 코스에서 전체 평점 및 장소별 세부 평점(날씨 조화 & 재미)을 기록해보세요</p>
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
                      ⚡ {currentUser.travelStyle === 'J' ? '계획형 (J)' : '즉흥형 (P)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="size-3.5" /> {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold bg-white/80 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-950 shadow-2xs">
                <Bookmark className="size-4 text-amber-600" />
                저장한 코스 <span className="text-amber-700 font-extrabold">{courses.length}</span>개
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
              <Compass className="size-4 text-sky-600" /> 내가 저장한 여행 코스 목록 (코스 및 장소별 세부 평점 작성)
            </h3>

            {courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <p className="text-2xl mb-2">📌</p>
                <p className="text-sm font-semibold text-slate-700">아직 저장한 여행 코스가 없습니다</p>
                <p className="text-xs text-slate-500 mt-1">
                  메인 화면에서 날씨·위치·예산 맞춤 코스를 추천받은 후 <br />
                  <span className="font-bold text-amber-800">[📌 이 코스 내 정보에 저장하기]</span> 버튼을 눌러보세요!
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
                      <span>결과화면 풀버전 열기</span>
                      <ExternalLink className="size-3" />
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition-colors">
                            {c.title}
                          </span>
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {c.weatherEmoji} {c.weatherSummary}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar className="size-3" /> 저장일시: {c.savedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleStartReview(e, c)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors cursor-pointer border border-amber-300"
                          title="이 코스 및 장소별 평점 작성"
                        >
                          <Edit3 className="size-3.5 text-amber-700" />
                          <span>{c.rating ? '✏️ 평점/후기 수정' : '✍️ 평점/후기 작성'}</span>
                        </button>

                        <button
                          onClick={(e) => handleDeleteCourse(e, c.id)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="코스 삭제"
                        >
                          <Trash2 className="size-3.5" /> 삭제
                        </button>
                      </div>
                    </div>

                    {/* Course Summary Chips */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100 font-medium">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="size-3.5 text-amber-600" /> 총 {c.totalTravelMinutes}분
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Wallet className="size-3.5 text-emerald-600" /> 약 {c.totalCost.toLocaleString()}원
                      </span>
                      <span className="text-[11px] text-slate-500">
                        동행: {c.companion} · 이동: {c.transport}
                      </span>
                    </div>

                    {/* Spots Route Path */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-700">📍 추천 방문 코스 순서:</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-800 font-medium">
                        {c.spots.map((spot, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="rounded-md bg-white border border-sky-200 px-2 py-0.5 text-sky-950 font-bold shadow-xs">
                              {idx + 1}. {spot.name}
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
                            <span>코스 총 평점: {c.rating}.0 / 5.0 점</span>
                          </div>

                          <button
                            onClick={(e) => handleDeleteReview(e, c.id)}
                            className="text-[11px] text-slate-400 hover:text-red-600 font-semibold cursor-pointer"
                          >
                            후기 삭제
                          </button>
                        </div>

                        {c.satisfactionTags && c.satisfactionTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {c.satisfactionTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-white border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900"
                              >
                                {tag}
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
                              <span>📍 장소별 세부 평점 (🌤️ 날씨 어울림 / 🎉 재미)</span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                              {c.spotRatings.map((sr, srIdx) => (
                                <div key={srIdx} className="flex items-center justify-between bg-white/90 px-2.5 py-1.5 rounded-lg border border-amber-200/80 shadow-2xs">
                                  <span className="font-bold text-slate-900 truncate max-w-[130px]">{srIdx + 1}. {sr.spotName}</span>
                                  <div className="flex items-center gap-2 font-bold text-[10px]">
                                    <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">🌤️ {sr.weatherScore}점</span>
                                    <span className="text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">🎉 {sr.funScore}점</span>
                                  </div>
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
                            <span>이 저장 코스 & 포함 장소별 평점 작성하기</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCourseId(null)
                            }}
                            className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            취소 ✕
                          </button>
                        </div>

                        {/* 1. 코스 전체 별점 선택 */}
                        <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-200">
                          <span className="text-xs font-bold text-slate-800">코스 전체 별점:</span>
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
                            {(hoverRating || editRating)}.0점
                          </span>
                        </div>

                        {/* 2. 코스 만족도 키워드 칩 선택 */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-700">만족도 키워드:</span>
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
                                  {isSelected ? `✓ ${tag}` : tag}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* 3. 코스 소감 글 작성 */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-700">코스 전체 소감:</span>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                            maxLength={300}
                            placeholder="이 여행 코스의 맛집, 동선, 팁 등 솔직한 소감을 작성해 보세요."
                            className="w-full rounded-lg border border-amber-200 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-300 font-medium"
                          />
                        </div>

                        {/* 4. 📍 장소별 개별 세부 평점 (날씨 어울림 & 재미) */}
                        <div className="space-y-2 pt-2 border-t border-amber-200/80">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                              <MapPin className="size-3.5 text-amber-700" />
                              <span>📍 장소별 개별 평점 (날씨 조화 & 재미 평가):</span>
                            </span>
                            <span className="text-[10px] text-amber-800 font-medium">
                              각 장소가 날씨에 어울렸는지, 얼마나 재미있었는지 평가해보세요!
                            </span>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {c.spots.map((spot, sIdx) => {
                              const sRating = editSpotRatings[spot.name] || { weatherScore: 5, funScore: 5, comment: '' }
                              return (
                                <div key={sIdx} className="rounded-lg border border-amber-200 bg-white p-2.5 space-y-1.5 text-xs shadow-2xs">
                                  <div className="font-bold text-slate-900 flex items-center justify-between">
                                    <span>{sIdx + 1}. {spot.name} <span className="text-[10px] font-normal text-slate-400">({spot.category})</span></span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-amber-50/50 p-2 rounded-md border border-amber-100">
                                    {/* 🌤️ 날씨 어울림 점수 */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-medium text-slate-700">🌤️ 날씨 어울림:</span>
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
                                        <span className="text-[10px] font-bold text-sky-800 ml-1">{sRating.weatherScore}점</span>
                                      </div>
                                    </div>

                                    {/* 🎉 재미 / 만족도 점수 */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-medium text-slate-700">🎉 재미/즐거움:</span>
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
                                        <span className="text-[10px] font-bold text-amber-800 ml-1">{sRating.funScore}점</span>
                                      </div>
                                    </div>
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
                            <span>평점/후기 저장</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Button Banner */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-700 group-hover:underline flex items-center gap-1">
                        <Play className="size-3 fill-sky-700" />
                        이 코스 풀 모드로 길찾기 & 지도·가이드북 상세보기
                      </span>
                      <span className="text-[11px] font-extrabold text-white bg-slate-900 group-hover:bg-sky-600 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-xs">
                        결과화면 열기 <ArrowIcon />
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
            확인 및 닫기
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
