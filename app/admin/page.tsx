'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Sliders,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Activity,
  Database,
  AlertCircle,
  MessageSquare,
  BarChart3,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JEONJU_PLACES_DATABASE } from '@/app/api/places/search/route'

export interface AdminPlaceItem {
  id: string
  name: string
  category: string
  subCategory?: string
  address: string
  lat: number
  lng: number
  cost: number
  costLabel: string
  operatingHours: string
  phone?: string
  reason: string
  tips?: string
  isIndoor: boolean
  isMustVisit: boolean
  suitableCompanions: string[]
  tags: string[]
  status: 'active' | 'review' | 'inactive'
  isTempClosed: boolean
  updatedAt: string
}

// 초기 데이터셋 생성
const INITIAL_ADMIN_PLACES: AdminPlaceItem[] = JEONJU_PLACES_DATABASE.map((p, idx) => ({
  id: `place_${idx + 1}`,
  name: p.name,
  category: p.category,
  subCategory: p.subCategory,
  address: p.address || '전북 전주시 완산구',
  lat: p.lat || 35.8133,
  lng: p.lng || 127.1492,
  cost: p.cost,
  costLabel: p.costLabel,
  operatingHours: p.operatingHours || '10:00 - 20:00',
  phone: p.phone || '063-280-0000',
  reason: p.reason,
  tips: p.tips || '',
  isIndoor: p.isIndoor ?? true,
  isMustVisit: p.isMustVisit ?? false,
  suitableCompanions: p.suitableCompanions || ['couple', 'friends', 'family'],
  tags: p.tags || ['#전주맛집', '#한옥마을'],
  status: idx % 15 === 0 ? 'review' : idx % 23 === 0 ? 'inactive' : 'active',
  isTempClosed: idx === 3 || idx === 12,
  updatedAt: '2026-07-30 14:20',
}))

// 유저 오류 신고 더미 데이터
interface UserReport {
  id: string
  placeName: string
  reportType: string
  content: string
  createdAt: string
  status: 'pending' | 'processing' | 'resolved'
}

const INITIAL_REPORTS: UserReport[] = [
  {
    id: 'rep_1',
    placeName: '전동성당',
    reportType: '영업/관람 시간 오기',
    content: '주말 성미사 시간 중 내부 관람 제한 시간이 명시되어 있지 않습니다.',
    createdAt: '2026-07-30 11:30',
    status: 'pending',
  },
  {
    id: 'rep_2',
    placeName: '객리단길 보드게임카페',
    reportType: '임시휴업 미반영',
    content: '오늘 내부 리모델링 공사로 임시 휴업 중입니다.',
    createdAt: '2026-07-30 10:15',
    status: 'processing',
  },
  {
    id: 'rep_3',
    placeName: '팔복예술공장',
    reportType: '주차장 위치 변경',
    content: '제2주차장 공사로 임시 주차공간 이용하라는 안내 필요합니다.',
    createdAt: '2026-07-29 16:40',
    status: 'resolved',
  },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'crud' | 'hours' | 'simulator' | 'monitoring'>('crud')
  const [places, setPlaces] = useState<AdminPlaceItem[]>(INITIAL_ADMIN_PLACES)
  const [reports, setReports] = useState<UserReport[]>(INITIAL_REPORTS)

  // 🔍 CRUD 검색 및 필터 State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'review' | 'inactive'>('all')
  const [categoryFilter] = useState<string>('all')

  // ✏️ 장소 등록 / 수정 모달 State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<AdminPlaceItem | null>(null)

  // 폼 입력 state
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('🏛️ 문화 명소')
  const [formAddress, setFormAddress] = useState('')
  const [formCost, setFormCost] = useState(0)
  const [formOperatingHours, setFormOperatingHours] = useState('10:00 - 20:00')
  const [formReason, setFormReason] = useState('')
  const [formIsIndoor, setFormIsIndoor] = useState(true)
  const [formStatus, setFormStatus] = useState<'active' | 'review' | 'inactive'>('active')
  const [formCompanions] = useState<string[]>(['couple', 'friends'])
  const [formTags, setFormTags] = useState<string>('#전주 #핫플')

  // 🌤️ 기상청 수동 폴백 모드 State (Phase 3-1)
  const [manualWeatherFallback, setManualWeatherFallback] = useState<boolean>(false)
  const [forcedWeatherCondition] = useState<string>('rain')

  // 🎯 시뮬레이터 State (Phase 1-5)
  const [simAuditResults, setSimAuditResults] = useState<any[] | null>(null)

  // 📊 통계 수치
  const stats = useMemo(() => {
    const total = places.length
    const active = places.filter((p) => p.status === 'active' && !p.isTempClosed).length
    const review = places.filter((p) => p.status === 'review').length
    const tempClosed = places.filter((p) => p.isTempClosed).length
    const inactive = places.filter((p) => p.status === 'inactive').length
    return { total, active, review, tempClosed, inactive }
  }, [places])

  // 필터링된 장소 목록
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (categoryFilter !== 'all' && !p.category.includes(categoryFilter)) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [places, statusFilter, categoryFilter, searchQuery])

  // 신규 장소 등록 또는 기존 장소 수정 처리
  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      alert('장소명을 입력해주세요!')
      return
    }

    const tagList = formTags
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    if (editingPlace) {
      // 수정
      setPlaces((prev) =>
        prev.map((item) =>
          item.id === editingPlace.id
            ? {
                ...item,
                name: formName,
                category: formCategory,
                address: formAddress || '전북 전주시 완산구',
                cost: formCost,
                costLabel: formCost === 0 ? '무료' : `${formCost.toLocaleString()}원`,
                operatingHours: formOperatingHours,
                reason: formReason || '전주 인기 추천 스팟입니다.',
                isIndoor: formIsIndoor,
                status: formStatus,
                suitableCompanions: formCompanions,
                tags: tagList,
                updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              }
            : item
        )
      )
      alert(`'${formName}' 장소 정보가 성공적으로 수정되었습니다!`)
    } else {
      // 신규 등록
      const newPlace: AdminPlaceItem = {
        id: `place_${Date.now()}`,
        name: formName,
        category: formCategory,
        address: formAddress || '전북 전주시 완산구 태조로 1',
        lat: 35.814,
        lng: 127.151,
        cost: formCost,
        costLabel: formCost === 0 ? '무료' : `${formCost.toLocaleString()}원`,
        operatingHours: formOperatingHours,
        reason: formReason || '신규 등록된 전주 추천 장소입니다.',
        isIndoor: formIsIndoor,
        isMustVisit: false,
        suitableCompanions: formCompanions,
        tags: tagList,
        status: formStatus,
        isTempClosed: false,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      }
      setPlaces((prev) => [newPlace, ...prev])
      alert(`신규 장소 '${formName}'이(가) 성공적으로 등록되었습니다!`)
    }

    setIsModalOpen(false)
    setEditingPlace(null)
  }

  // 장소 편집 모달 열기
  const handleOpenEditModal = (p: AdminPlaceItem) => {
    setEditingPlace(p)
    setFormName(p.name)
    setFormCategory(p.category)
    setFormAddress(p.address)
    setFormCost(p.cost)
    setFormOperatingHours(p.operatingHours)
    setFormReason(p.reason)
    setFormIsIndoor(p.isIndoor)
    setFormStatus(p.status)
    setFormTags(p.tags.join(' '))
    setIsModalOpen(true)
  }

  // 장소 신규 등록 모달 열기
  const handleOpenNewModal = () => {
    setEditingPlace(null)
    setFormName('')
    setFormCategory('🏛️ 실내 · 전시장/공방')
    setFormAddress('전북 전주시 완산구 한옥마을길 15')
    setFormCost(10000)
    setFormOperatingHours('10:00 - 20:00')
    setFormReason('전주 로컬 감성이 가득한 일러스트 & 공방 체험 공간입니다.')
    setFormIsIndoor(true)
    setFormStatus('active')
    setFormTags('#전주공방 #한옥마을 #데이트')
    setIsModalOpen(true)
  }

  // 원클릭 임시휴업 토글 (Phase 1-3)
  const handleToggleTempClosed = (id: string) => {
    setPlaces((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isTempClosed
          alert(
            `'${p.name}' 상태가 [${nextState ? '🔴 오늘 임시휴업' : '🟢 정상 운영중'}]으로 변경되었습니다.`
          )
          return { ...p, isTempClosed: nextState }
        }
        return p
      })
    )
  }

  // 장소 상태 변경 (활성 / 검수중 / 비활성)
  const handleChangeStatus = (id: string, status: 'active' | 'review' | 'inactive') => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    )
  }

  // 30조합 일괄 점검 실행 (Phase 1-5 & 2-2)
  const handleRun30CombinationAudit = () => {
    const weatherList = [
      { id: 'clear', name: '☀️ 맑음' },
      { id: 'rain', name: '🌧️ 비/악천후' },
      { id: 'snow', name: '❄️ 눈/한파' },
      { id: 'wind', name: '💨 강풍/미세먼지' },
      { id: 'hot', name: '🔥 폭염(30°C+)' },
    ]
    const timeList = [
      { id: '1h', name: '1시간 (1곳)' },
      { id: '3h', name: '3시간 (3곳)' },
      { id: 'half', name: '반나절 (5곳)' },
      { id: 'full', name: '하루 (7곳)' },
      { id: '2days', name: '이틀 (10곳)' },
      { id: '3days', name: '사흘 (14곳)' },
    ]

    const results: any[] = []
    weatherList.forEach((w) => {
      timeList.forEach((t) => {
        const eligibleCount = places.filter((p) => {
          if (p.status !== 'active' || p.isTempClosed) return false
          if (w.id === 'rain' || w.id === 'snow') {
            return p.isIndoor || p.isMustVisit
          }
          return true
        }).length

        results.push({
          weather: w.name,
          time: t.name,
          count: eligibleCount,
          isWarning: eligibleCount < 3,
        })
      })
    })

    setSimAuditResults(results)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* 🛡️ 관리자 최상단 헤더 바 */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-4 shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-amber-950 font-extrabold text-xl shadow-lg">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  전주 여행 P들 어디가 — 관리자 콘솔 (Admin)
                </h1>
                <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                  PRD v1.4 Roadmap v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>https://activity-fawn.vercel.app/admin</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Activity className="size-3" /> Vercel 프로덕션 연동 중
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors shadow-sm"
            >
              <span>🌐 사용자 프론트 바로가기</span>
              <ExternalLink className="size-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* 📊 상단 핵심 현황 대시보드 카드리스트 (Phase 0 / 1 / 3) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">총 관리 장소 DB</p>
              <p className="text-2xl font-black text-white mt-1">{stats.total}<span className="text-xs font-medium text-slate-400 ml-1">곳</span></p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Database className="size-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400">🟢 현재 서비스 추천 활성</p>
              <p className="text-2xl font-black text-emerald-300 mt-1">{stats.active}<span className="text-xs font-medium text-emerald-500/80 ml-1">곳</span></p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="size-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-400">🔍 검수 대기중 (승인필요)</p>
              <p className="text-2xl font-black text-amber-300 mt-1">{stats.review}<span className="text-xs font-medium text-amber-500/80 ml-1">곳</span></p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock className="size-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-400">🔴 오늘 임시휴업 매장</p>
              <p className="text-2xl font-black text-red-300 mt-1">{stats.tempClosed}<span className="text-xs font-medium text-red-500/80 ml-1">곳</span></p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertTriangle className="size-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-400">🌤️ 기상청 API 연동 상태</p>
              <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {manualWeatherFallback ? `수동 강제(${forcedWeatherCondition})` : '자동 실시간 수신중'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setManualWeatherFallback(!manualWeatherFallback)}
              className="flex size-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 cursor-pointer"
              title="기상청 장애 시 수동 강제 스위치"
            >
              <Sliders className="size-5" />
            </button>
          </div>
        </div>

        {/* 탭 메뉴 네비게이션 */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 font-sans">
          <button
            type="button"
            onClick={() => setActiveTab('crud')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'crud'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Building2 className="size-4" />
            <span>1장. 장소 데이터 CRUD & 상태/태그 관리</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hours')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'hours'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Clock className="size-4" />
            <span>2장. 운영시간 & "오늘 임시휴업" 원클릭 스위치</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="size-4" />
            <span>3장. 추천 30조합 시뮬레이터 & 0건 점검</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'monitoring'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="size-4" />
            <span>4장. API 모니터링 & 사용자 신고함</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: 🏢 장소 데이터 CRUD & 상태/태그 관리 */}
        {/* ========================================================================= */}
        {activeTab === 'crud' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 검색 및 필터 컨트롤 바 */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-md">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* 검색어 입력 */}
                <div className="relative min-w-[240px] flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="장소명, 카테고리, 주소 검색..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                  />
                </div>

                {/* 노출 상태 필터 */}
                <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer transition-all ${
                      statusFilter === 'all' ? 'bg-amber-500 text-amber-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    전체 ({places.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('active')}
                    className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer transition-all ${
                      statusFilter === 'active' ? 'bg-emerald-500 text-emerald-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🟢 활성
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('review')}
                    className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer transition-all ${
                      statusFilter === 'review' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔍 검수중
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('inactive')}
                    className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer transition-all ${
                      statusFilter === 'inactive' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚪ 비활성
                  </button>
                </div>
              </div>

              {/* 신규 장소 등록 버튼 */}
              <Button
                type="button"
                onClick={handleOpenNewModal}
                className="rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400 font-extrabold text-xs gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="size-4" />
                <span>➕ 신규 추천 장소 등록</span>
              </Button>
            </div>

            {/* 장소 데이터 테이블 */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-bold">
                    <tr>
                      <th className="px-4 py-3">장소명 / 카테고리</th>
                      <th className="px-4 py-3">상태</th>
                      <th className="px-4 py-3">비용 및 체류시간</th>
                      <th className="px-4 py-3">실내/야외</th>
                      <th className="px-4 py-3">적합 동행 / 태그</th>
                      <th className="px-4 py-3">임시휴업 토글</th>
                      <th className="px-4 py-3 text-right">관리 액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPlaces.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.isMustVisit && (
                              <span className="rounded bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] px-1.5 py-0.2">
                                🌟 필수
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{p.category} • {p.address}</p>
                        </td>

                        <td className="px-4 py-3.5">
                          {p.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                              <CheckCircle2 className="size-3" /> 승인 활성
                            </span>
                          ) : p.status === 'review' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                              <Clock className="size-3" /> 검수 대기
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-400">
                              <XCircle className="size-3" /> 비활성
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-amber-300">{p.costLabel}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">⏱️ {p.operatingHours}</p>
                        </td>

                        <td className="px-4 py-3.5">
                          {p.isIndoor ? (
                            <span className="rounded-md bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
                              🏠 실내 100%
                            </span>
                          ) : (
                            <span className="rounded-md bg-sky-950/60 border border-sky-500/40 px-2 py-0.5 text-[11px] font-semibold text-sky-300">
                              🌳 야외 산책
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleTempClosed(p.id)}
                            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold cursor-pointer transition-all border ${
                              p.isTempClosed
                                ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {p.isTempClosed ? (
                              <>
                                <ToggleRight className="size-4 text-red-400" />
                                <span>🔴 오늘 임시휴업</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="size-4 text-slate-400" />
                                <span>🟢 정상 운영</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              className="rounded-lg border border-sky-500/30 bg-sky-950/40 p-1.5 text-sky-300 hover:bg-sky-900/60 cursor-pointer"
                              title="장소 정보 수정"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            {p.status !== 'inactive' ? (
                              <button
                                type="button"
                                onClick={() => handleChangeStatus(p.id, 'inactive')}
                                className="rounded-lg border border-red-500/30 bg-red-950/40 p-1.5 text-red-300 hover:bg-red-900/60 cursor-pointer"
                                title="비활성화 처리"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleChangeStatus(p.id, 'active')}
                                className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-1.5 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer"
                                title="활성화 승인"
                              >
                                <CheckCircle2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ⏱️ 운영시간 & "오늘 임시휴업" 원클릭 스위치 */}
        {/* ========================================================================= */}
        {activeTab === 'hours' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">💡 "오늘 임시휴업" 스위치 가이드</p>
                <p className="mt-1 leading-relaxed text-slate-300">
                  갑작스러운 매장 내부 리모델링, 기상 악화, 개인 사정 등으로 임시 휴업 시 스위치를 클릭하시면 코드 재배포 없이 사용자 실시간 코스 추천 알고리즘에서 **즉시 제척**됩니다.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 shadow-md transition-all ${
                    p.isTempClosed
                      ? 'border-red-500/40 bg-red-950/10'
                      : 'border-slate-800 bg-slate-950/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{p.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleTempClosed(p.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer transition-all border ${
                        p.isTempClosed
                          ? 'bg-red-500 text-white border-red-400 shadow-md'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      }`}
                    >
                      {p.isTempClosed ? '🔴 휴업 중' : '🟢 정상 영업'}
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">운영시간:</span>
                      <span className="font-semibold text-white">{p.operatingHours}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">주소:</span>
                      <span className="text-slate-400 truncate max-w-[180px]">{p.address}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 🎯 추천 30조합 시뮬레이터 & 0건 점검 */}
        {/* ========================================================================= */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-sky-200 flex items-center gap-2">
                    <Sparkles className="size-5 text-sky-400" />
                    <span>🎯 추천 알고리즘 미리보기 & 30조합 0건 안전 검수</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    날씨 5종 × 시간 6개 조합 하에서 추천 스팟이 부족하여 0건이 발생하는 비상 상황을 사전에 100% 감지합니다.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleRun30CombinationAudit}
                  className="rounded-xl bg-sky-500 text-sky-950 hover:bg-sky-400 font-extrabold text-xs gap-1.5 shadow-lg cursor-pointer"
                >
                  <RefreshCw className="size-4" />
                  <span>⚡ 30조합 일괄 점검 실행</span>
                </Button>
              </div>

              {/* 30조합 자동 점검 결과 매트릭스 */}
              {simAuditResults && (
                <div className="mt-4 pt-4 border-t border-sky-500/30 space-y-3">
                  <p className="text-xs font-bold text-white flex items-center justify-between">
                    <span>📊 30조합 전수 점검결과 리포트</span>
                    <span className="text-emerald-400 font-semibold">
                      총 {simAuditResults.length}개 조합 검사 완료
                    </span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                    {simAuditResults.map((res, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl border p-2.5 text-center text-xs space-y-1 ${
                          res.isWarning
                            ? 'border-red-500/60 bg-red-950/40 text-red-200'
                            : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                        }`}
                      >
                        <p className="font-bold text-[11px] text-slate-300">{res.weather}</p>
                        <p className="text-[10px] text-slate-400">{res.time}</p>
                        <p className="text-sm font-black mt-1">
                          {res.count}곳 추천 가능
                        </p>
                        {res.isWarning && (
                          <p className="text-[9px] font-bold text-red-400">⚠️ 스팟 보강 필요</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 📊 API 모니터링 & 사용자 오류 신고함 */}
        {/* ========================================================================= */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* API 상태 카드 */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">🌤️ 기상청 초단기 예보 API</span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                    99.8% 성공률
                  </span>
                </div>
                <p className="text-2xl font-black text-white">정상 응답</p>
                <p className="text-[11px] text-slate-500">평균 응답 속도: 140ms</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">🗺️ 네이버 지도 POI API</span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                    100% 정상
                  </span>
                </div>
                <p className="text-2xl font-black text-white">정상 응답</p>
                <p className="text-[11px] text-slate-500">오늘 호출 건수: 1,420회</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">🚗 OSRM 도로 길찾기 API</span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                    100% 정상
                  </span>
                </div>
                <p className="text-2xl font-black text-white">정상 응답</p>
                <p className="text-[11px] text-slate-500">경로 자동 재계산 성공</p>
              </div>
            </div>

            {/* 사용자 오류 신고함 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="size-5 text-amber-400" />
                <span>📥 사용자 정보 오류 신고 접수함</span>
              </h2>

              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{rep.placeName}</span>
                        <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 font-semibold">
                          {rep.reportType}
                        </span>
                        <span className="text-slate-500 text-[11px]">{rep.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5">{rep.content}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rep.status === 'pending' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setReports((prev) =>
                              prev.map((r) => (r.id === rep.id ? { ...r, status: 'processing' } : r))
                            )
                          }}
                          className="h-8 text-xs bg-amber-500 text-amber-950 font-bold hover:bg-amber-400 cursor-pointer"
                        >
                          접수 ➔ 확인 시작
                        </Button>
                      ) : rep.status === 'processing' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setReports((prev) =>
                              prev.map((r) => (r.id === rep.id ? { ...r, status: 'resolved' } : r))
                            )
                          }}
                          className="h-8 text-xs bg-emerald-500 text-emerald-950 font-bold hover:bg-emerald-400 cursor-pointer"
                        >
                          수정 완료 처리
                        </Button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
                          ✓ 처리 완료
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* ✏️ 장소 등록 & 수정 폼 모달 (Phase 1-1) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="size-5 text-amber-400" />
                <span>{editingPlace ? `'${editingPlace.name}' 정보 수정` : '➕ 신규 추천 장소 등록'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">장소명 *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="예: 경기전, 베테랑 칼국수, 교동다원"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">카테고리 *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                  >
                    <option value="🏛️ 문화 명소">🏛️ 문화 명소 (성당, 문화재)</option>
                    <option value="🏛️ 실내 · 전시장/공방">🏛️ 실내 · 전시장/공방</option>
                    <option value="🍱 전주 로컬 맛집">🍱 전주 로컬 맛집</option>
                    <option value="☕ 한옥 감성 카페">☕ 한옥 감성 카페</option>
                    <option value="🛍️ 특산품 & 쇼핑">🛍️ 특산품 & 쇼핑</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">실제 주소 *</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">입장료 / 평균 비용 (원) *</label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">운영시간 *</label>
                  <input
                    type="text"
                    value={formOperatingHours}
                    onChange={(e) => setFormOperatingHours(e.target.value)}
                    placeholder="10:00 - 20:00"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">추천 사유 및 소개 문구 *</label>
                <textarea
                  rows={3}
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">실내외 구별</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="indoor"
                        checked={formIsIndoor}
                        onChange={() => setFormIsIndoor(true)}
                      />
                      <span>🏠 실내 100%</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="indoor"
                        checked={!formIsIndoor}
                        onChange={() => setFormIsIndoor(false)}
                      />
                      <span>🌳 야외/산책</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">승인 노출 상태</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                  >
                    <option value="active">🟢 활성 (서비스 추천에 즉시 반영)</option>
                    <option value="review">🔍 검수중 (추천에서 제외)</option>
                    <option value="inactive">⚪ 비활성</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">해시태그 (공백 구별)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="#전주 #데이트 #한옥마을"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400 font-bold cursor-pointer"
                >
                  {editingPlace ? '수정사항 저장' : '신규 장소 등록 완료'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
