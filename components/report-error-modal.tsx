'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Send, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addReportToStorage } from '@/lib/report-storage'

interface ReportErrorModalProps {
  isOpen: boolean
  onClose: () => void
  defaultPlaceName?: string
}

export function ReportErrorModal({
  isOpen,
  onClose,
  defaultPlaceName = '',
}: ReportErrorModalProps) {
  const [placeName, setPlaceName] = useState(defaultPlaceName)
  const [reportType, setReportType] = useState('영업시간/관람시간 오기')
  const [content, setContent] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (defaultPlaceName) {
      setPlaceName(defaultPlaceName)
    }
  }, [defaultPlaceName])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!placeName.trim()) {
      alert('신고할 장소명을 입력해 주세요!')
      return
    }
    if (!content.trim()) {
      alert('오류 내용을 작성해 주세요!')
      return
    }

    addReportToStorage({
      placeName: placeName.trim(),
      reportType,
      content: content.trim(),
    })

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setContent('')
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-amber-50/60">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500 text-amber-950 font-bold">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">정보 오류 신고 접수</h3>
              <p className="text-[11px] text-slate-500">잘못된 영업시간이나 위치 정보를 신고해 주시면 관리자가 빠르게 수정합니다.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="size-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 text-lg">오류 신고 접수 완료!</h4>
            <p className="text-xs text-slate-600">
              신고해 주신 소중한 정보가 관리자 콘솔 센터로 즉시 전달되었습니다. 빠르게 확인 후 수정하겠습니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">신고 대상 장소명 *</label>
              <input
                type="text"
                required
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="예: 경기전, 전동성당, 객리단길 보드게임카페"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-semibold outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">오류 유형 *</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-semibold outline-none focus:border-amber-400 focus:bg-white"
              >
                <option value="영업시간/관람시간 오기">⏱️ 영업시간/관람시간 오기</option>
                <option value="임시휴업/폐업 미반영">🔴 임시휴업/폐업 미반영</option>
                <option value="주차장/위치 정보 오류">🚗 주차장/위치 정보 오류</option>
                <option value="가격/입장료 비용 오기">💰 가격/입장료 비용 오기</option>
                <option value="기타 정보 오류">💡 기타 정보 오류</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">오류 세부 내용 *</label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="예: 주말 미사 시간 중 내부 관람 제한 시간이 누락되어 있습니다. 수정 부탁드립니다."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-normal outline-none focus:border-amber-400 focus:bg-white leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400 font-extrabold text-xs gap-1.5 shadow-md cursor-pointer"
              >
                <Send className="size-3.5" />
                <span>관리자에게 신고 접수</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
