'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Compass, Bookmark, Trash2, Calendar, Clock, Wallet, MapPin, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RegisteredUser } from '@/components/auth-modal'
import { getSavedCourses, deleteCourseFromUser, SavedCourse } from '@/lib/course-storage'

interface MyPageModalProps {
  isOpen: boolean
  onClose: () => void
  user: RegisteredUser | null
}

export function MyPageModal({ isOpen, onClose, user }: MyPageModalProps) {
  const [courses, setCourses] = useState<SavedCourse[]>([])
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('')

  useEffect(() => {
    if (isOpen && user?.email) {
      const saved = getSavedCourses(user.email)
      setCourses(saved)
    }
  }, [isOpen, user?.email])

  if (!isOpen || !user) return null

  const handleDeleteCourse = (courseId: string) => {
    if (!confirm('이 저장된 여행 코스를 삭제하시겠습니까?')) return
    const success = deleteCourseFromUser(user.email, courseId)
    if (success) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
      setDeleteSuccessMsg('코스가 삭제되었습니다.')
      setTimeout(() => setDeleteSuccessMsg(''), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
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
              <p className="text-xs text-slate-500">내 계정 정보와 저장된 나만의 전주 여행 경로를 확인하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
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
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{user.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/70 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      ⚡ {user.travelStyle === 'J' ? '계획형 (J)' : '즉흥형 (P)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="size-3.5" /> {user.email}
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
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 flex items-center gap-1.5">
              <Check className="size-4 text-emerald-600" /> {deleteSuccessMsg}
            </div>
          )}

          {/* Saved Courses Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Compass className="size-4 text-sky-600" /> 내가 저장한 여행 코스 목록
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
              <div className="space-y-3.5">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-amber-300 transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{c.title}</span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {c.weatherEmoji} {c.weatherSummary}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="size-3" /> 저장일시: {c.savedAt}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="코스 삭제"
                      >
                        <Trash2 className="size-3.5" /> 삭제
                      </button>
                    </div>

                    {/* Course Summary Chips */}
                    <div className="my-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5 text-amber-600" /> 총 {c.totalTravelMinutes}분
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet className="size-3.5 text-emerald-600" /> 약 {c.totalCost.toLocaleString()}원
                      </span>
                      <span className="text-[11px] text-slate-500">
                        동행: {c.companion} · 이동: {c.transport}
                      </span>
                    </div>

                    {/* Spots Route Path */}
                    <div className="space-y-1 pt-1">
                      <p className="text-[11px] font-bold text-slate-700">📍 추천 방문 코스 순서:</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-800 font-medium">
                        {c.spots.map((spot, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-sky-950 font-semibold">
                              {idx + 1}. {spot.name}
                            </span>
                            {idx < c.spots.length - 1 && (
                              <span className="text-slate-300 font-bold">➔</span>
                            )}
                          </div>
                        ))}
                      </div>
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
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl px-5 py-2"
          >
            확인 및 닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
