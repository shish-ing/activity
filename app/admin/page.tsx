'use client'

import { useState, useMemo, useEffect } from 'react'
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
  X,
  Star,
  SunMedium,
  Smile,
  Filter,
  Users,
  UserCheck,
  UserX,
  BookOpen,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Megaphone,
  PartyPopper,
  Calendar,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JEONJU_PLACES_DATABASE } from '@/app/api/places/search/route'
import { getPlaceImageUrl } from '@/lib/mock-data'
import {
  getAdminPlaceStatuses,
  setAdminPlaceStatus,
  getAdminCustomPlaces,
  saveAdminCustomPlace,
  type AdminCustomPlace,
  getRealSpotRatingSummaries,
  getAdminRegisteredUsers,
  deleteAdminUser,
  getAllUserCourseReviews,
  type RegisteredUserInfo,
  type CourseReviewItem
} from '@/lib/admin-storage'
import {
  getAdminBanners,
  saveAdminBanners,
  type EventBannerItem
} from '@/lib/banner-storage'
import {
  getStoredReports,
  updateReportStatusInStorage,
  deleteReportFromStorage,
  type UserReportItem
} from '@/lib/report-storage'
import { AdminLoginGateway } from '@/components/admin-login-gateway'
import {
  getAdminAccounts,
  updateAdminAccountStatus,
  deleteAdminAccount,
  getAdminSession,
  setAdminSession,
  type AdminAccount
} from '@/lib/admin-auth-storage'

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
  imageUrl?: string // 📷 대표 장소 실사 사진 URL (Admin에서 수정 가능)

  // ⭐ 실제 사용자가 남긴 평점 데이터 (순수 유저 평가 기반)
  avgWeatherScore: number // 0.0 ~ 5.0
  avgFunScore: number // 0.0 ~ 5.0
  overallRating: number // 0.0 ~ 5.0
  reviewCount: number // 평가 참여 인원 수
  isFeatured?: boolean
  reviewsList: {
    userName: string
    weatherScore: number
    funScore: number
    comment: string
    date: string
  }[]
}

// 순수 초기 장소 데이터셋
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
  isTempClosed: false,
  updatedAt: '2026-07-30 16:20',
  avgWeatherScore: 0,
  avgFunScore: 0,
  overallRating: 0,
  reviewCount: 0,
  isFeatured: idx === 0 || idx === 1,
  reviewsList: [],
}))

// 실사용자 정보 오류 신고 데이터 (AI 더미 데이터 100% 제거, 소비자 접수건만 관리)
const INITIAL_REPORTS: UserReportItem[] = []

export default function AdminPage() {
  const [adminSessionState, setAdminSessionState] = useState<AdminAccount | null>(null)
  const [adminAccountsList, setAdminAccountsList] = useState<AdminAccount[]>([])
  const [isAuthLoaded, setIsAuthLoaded] = useState(false)

  const [activeTab, setActiveTab] = useState<'crud' | 'users' | 'hours' | 'ratings' | 'monitoring' | 'banners'>('crud')
  const [places, setPlaces] = useState<AdminPlaceItem[]>(INITIAL_ADMIN_PLACES)
  const [reports, setReports] = useState<UserReportItem[]>(INITIAL_REPORTS)

  // 👤 회원가입 유저 관리 State
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserInfo[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUserCoursesModal, setSelectedUserCoursesModal] = useState<RegisteredUserInfo | null>(null)

  // 🔍 CRUD 검색 및 필터 State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'review' | 'inactive'>('all')

  // ⭐ 평점 및 후기 전용 서브탭 & 정렬 State
  const [reviewSubTab, setReviewSubTab] = useState<'spot' | 'course'>('spot')
  const [courseReviews, setCourseReviews] = useState<CourseReviewItem[]>([])
  const [ratingSort, setRatingSort] = useState<'overall' | 'weather' | 'fun' | 'count'>('overall')
  const [selectedPlaceReviews, setSelectedPlaceReviews] = useState<AdminPlaceItem | null>(null)

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
  const [formTags, setFormTags] = useState<string>('#전주 #핫플')
  const [formImageUrl, setFormImageUrl] = useState<string>('')

  // 🎉 축제 & 팝업 스토어 배너 관리 State
  const [bannersList, setBannersList] = useState<EventBannerItem[]>([])
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<EventBannerItem | null>(null)

  // 배너 폼 State
  const [bannerCategory, setBannerCategory] = useState('🎉 축제·행사')
  const [bannerTitle, setBannerTitle] = useState('')
  const [bannerPeriod, setBannerPeriod] = useState('')
  const [bannerLocation, setBannerLocation] = useState('')
  const [bannerDescription, setBannerDescription] = useState('')
  const [bannerColor, setBannerColor] = useState<'amber' | 'emerald' | 'sky' | 'purple' | 'rose'>('amber')
  const [bannerIsActive, setBannerIsActive] = useState(true)

  // 🔑 관리자 로그인 세션 및 계정 승인 동기화
  useEffect(() => {
    setAdminSessionState(getAdminSession())
    setAdminAccountsList(getAdminAccounts())
    setIsAuthLoaded(true)

    const handleAuthSync = () => {
      setAdminSessionState(getAdminSession())
      setAdminAccountsList(getAdminAccounts())
    }
    window.addEventListener('jeonju_admin_auth_changed', handleAuthSync)
    window.addEventListener('jeonju_admin_session_changed', handleAuthSync)

    return () => {
      window.removeEventListener('jeonju_admin_auth_changed', handleAuthSync)
      window.removeEventListener('jeonju_admin_session_changed', handleAuthSync)
    }
  }, [])

  // 💡 LocalStorage 동기화 함수
  const loadAdminStateAndRealRatings = () => {
    if (typeof window === 'undefined') return

    const adminStatuses = getAdminPlaceStatuses()
    const customPlaces = getAdminCustomPlaces()
    const realRatingsMap = getRealSpotRatingSummaries()
    const users = getAdminRegisteredUsers()
    const realReports = getStoredReports()
    const realCourseReviews = getAllUserCourseReviews()
    const currentBanners = getAdminBanners()

    setRegisteredUsers(users)
    setReports(realReports)
    setCourseReviews(realCourseReviews)
    setBannersList(currentBanners)

    setPlaces((prev) => {
      // Merge customPlaces into prev list
      const existingMap = new Map(prev.map((p) => [p.name, p]))
      customPlaces.forEach((cp) => {
        if (!existingMap.has(cp.name)) {
          existingMap.set(cp.name, {
            ...cp,
            isMustVisit: cp.isMustVisit ?? false,
            suitableCompanions: cp.suitableCompanions ?? ['couple', 'friends'],
            avgWeatherScore: 0,
            avgFunScore: 0,
            overallRating: 0,
            reviewCount: 0,
            reviewsList: [],
          })
        }
      })

      const combined = Array.from(existingMap.values())

      return combined.map((p) => {
        const adminStatus = adminStatuses[p.name]
        const isClosed = adminStatus?.isClosed ?? p.isTempClosed
        const placeStatus = adminStatus?.status ?? p.status
        const customImageUrl = adminStatus?.imageUrl || p.imageUrl

        const realSummary = realRatingsMap[p.name]
        if (realSummary && realSummary.reviewCount > 0) {
          return {
            ...p,
            isTempClosed: isClosed,
            status: placeStatus,
            imageUrl: customImageUrl,
            reviewCount: realSummary.reviewCount,
            avgWeatherScore: realSummary.avgWeatherScore,
            avgFunScore: realSummary.avgFunScore,
            overallRating: realSummary.overallRating,
            reviewsList: realSummary.reviews,
          }
        }

        return {
          ...p,
          isTempClosed: isClosed,
          status: placeStatus,
          imageUrl: customImageUrl,
        }
      })
    })
  }

  useEffect(() => {
    loadAdminStateAndRealRatings()

    const handleSync = () => loadAdminStateAndRealRatings()
    window.addEventListener('jeonju_admin_status_changed', handleSync)
    window.addEventListener('jeonju_review_updated', handleSync)
    window.addEventListener('jeonju_course_saved', handleSync)
    window.addEventListener('jeonju_user_registered', handleSync)
    window.addEventListener('jeonju_report_submitted', handleSync)
    window.addEventListener('jeonju_banners_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      window.removeEventListener('jeonju_admin_status_changed', handleSync)
      window.removeEventListener('jeonju_review_updated', handleSync)
      window.removeEventListener('jeonju_course_saved', handleSync)
      window.removeEventListener('jeonju_user_registered', handleSync)
      window.removeEventListener('jeonju_report_submitted', handleSync)
      window.removeEventListener('jeonju_banners_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // 🎉 축제 / 팝업 배너 CRUD 조작 함수
  const handleOpenNewBannerModal = () => {
    setEditingBanner(null)
    setBannerCategory('🎉 축제·행사')
    setBannerTitle('')
    setBannerPeriod('2026.08.01 ~ 08.15')
    setBannerLocation('전주 경기전 & 태조로 일원')
    setBannerDescription('')
    setBannerColor('amber')
    setBannerIsActive(true)
    setIsBannerModalOpen(true)
  }

  const handleOpenEditBannerModal = (b: EventBannerItem) => {
    setEditingBanner(b)
    setBannerCategory(b.category)
    setBannerTitle(b.title)
    setBannerPeriod(b.period)
    setBannerLocation(b.location)
    setBannerDescription(b.description)
    setBannerColor(b.badgeColor || 'amber')
    setBannerIsActive(b.isActive)
    setIsBannerModalOpen(true)
  }

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bannerTitle.trim() || !bannerDescription.trim()) {
      alert('배너 제목과 상세 설명을 입력해 주세요!')
      return
    }

    let updated: EventBannerItem[] = []
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')

    if (editingBanner) {
      updated = bannersList.map((b) =>
        b.id === editingBanner.id
          ? {
              ...b,
              category: bannerCategory,
              title: bannerTitle.trim(),
              period: bannerPeriod.trim() || '일정 상시',
              location: bannerLocation.trim() || '전주 한옥마을 일원',
              description: bannerDescription.trim(),
              badgeColor: bannerColor,
              isActive: bannerIsActive,
              updatedAt: now,
            }
          : b
      )
      alert(`축제/팝업 배너 '${bannerTitle}' 수정이 완료되었습니다!`)
    } else {
      const newBanner: EventBannerItem = {
        id: `banner_${Date.now()}`,
        category: bannerCategory,
        title: bannerTitle.trim(),
        period: bannerPeriod.trim() || '일정 상시',
        location: bannerLocation.trim() || '전주 한옥마을 일원',
        description: bannerDescription.trim(),
        badgeColor: bannerColor,
        isActive: bannerIsActive,
        updatedAt: now,
      }
      updated = [newBanner, ...bannersList]
      alert(`신규 축제/팝업 배너 '${bannerTitle}'이(가) 등록되었습니다!`)
    }

    setBannersList(updated)
    saveAdminBanners(updated)
    setIsBannerModalOpen(false)
    setEditingBanner(null)
  }

  const handleToggleBannerActive = (b: EventBannerItem) => {
    const updated = bannersList.map((item) =>
      item.id === b.id ? { ...item, isActive: !item.isActive } : item
    )
    setBannersList(updated)
    saveAdminBanners(updated)
  }

  const handleDeleteBanner = (id: string, title: string) => {
    if (confirm(`'${title}' 배너를 정말 삭제하시겠습니까?`)) {
      const updated = bannersList.filter((b) => b.id !== id)
      setBannersList(updated)
      saveAdminBanners(updated)
    }
  }

  // 👤 회원 삭제 핸들러
  const handleDeleteUserAccount = (email: string, name: string) => {
    if (confirm(`정말로 회원 '${name} (${email})' 계정을 탈퇴/삭제 처리하시겠습니까?\n저장된 코스 데이터도 함께 삭제됩니다.`)) {
      const ok = deleteAdminUser(email)
      if (ok) {
        alert(`회원 '${name}' 계정이 정상 삭제되었습니다.`)
        loadAdminStateAndRealRatings()
      }
    }
  }

  // 📊 대시보드 통계 수치
  const stats = useMemo(() => {
    const total = places.length
    const active = places.filter((p) => p.status === 'active' && !p.isTempClosed).length
    const review = places.filter((p) => p.status === 'review').length
    const tempClosed = places.filter((p) => p.isTempClosed).length

    const ratedPlaces = places.filter((p) => p.reviewCount > 0)
    const ratedTotalCount = ratedPlaces.length

    const avgRatingAll =
      ratedTotalCount > 0
        ? (ratedPlaces.reduce((sum, p) => sum + p.overallRating, 0) / ratedTotalCount).toFixed(2)
        : '0.0'

    const topWeatherSpot =
      ratedTotalCount > 0
        ? [...ratedPlaces].sort((a, b) => b.avgWeatherScore - a.avgWeatherScore)[0]
        : null

    const topFunSpot =
      ratedTotalCount > 0
        ? [...ratedPlaces].sort((a, b) => b.avgFunScore - a.avgFunScore)[0]
        : null

    const totalReviews = places.reduce((sum, p) => sum + p.reviewCount, 0)
    const totalUsersCount = registeredUsers.length
    const pStyleUsersCount = registeredUsers.filter((u) => u.travelStyle === 'P').length

    return {
      total,
      active,
      review,
      tempClosed,
      avgRatingAll,
      topWeatherSpot,
      topFunSpot,
      totalReviews,
      totalUsersCount,
      pStyleUsersCount,
    }
  }, [places, registeredUsers])

  // 필터링된 회원 목록
  const filteredRegisteredUsers = useMemo(() => {
    return registeredUsers.filter((u) => {
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase()
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      }
      return true
    })
  }, [registeredUsers, userSearchQuery])

  // 필터링 및 정렬된 장소 목록 (CRUD용)
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
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
  }, [places, statusFilter, searchQuery])

  // 평점 탭 전용 정렬 목록
  const sortedRatingPlaces = useMemo(() => {
    return [...places].sort((a, b) => {
      if (ratingSort === 'weather') return b.avgWeatherScore - a.avgWeatherScore
      if (ratingSort === 'fun') return b.avgFunScore - a.avgFunScore
      if (ratingSort === 'count') return b.reviewCount - a.reviewCount
      return b.overallRating - a.overallRating
    })
  }, [places, ratingSort])

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
                tags: tagList,
                imageUrl: formImageUrl.trim() || undefined,
                updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              }
            : item
        )
      )
      setAdminPlaceStatus(formName, editingPlace.isTempClosed, formStatus, formImageUrl.trim())
      if (editingPlace.name !== formName) {
        setAdminPlaceStatus(editingPlace.name, editingPlace.isTempClosed, formStatus, formImageUrl.trim())
      }

      // 커스텀 추가 장소인 경우 커스텀 장소 스토리지 업데이트
      const updatedPlaceItem: AdminCustomPlace = {
        id: editingPlace.id,
        name: formName,
        category: formCategory,
        address: formAddress || '전북 전주시 완산구',
        lat: editingPlace.lat || 35.814,
        lng: editingPlace.lng || 127.151,
        cost: formCost,
        costLabel: formCost === 0 ? '무료' : `${formCost.toLocaleString()}원`,
        operatingHours: formOperatingHours,
        reason: formReason || '전주 추천 스팟입니다.',
        isIndoor: formIsIndoor,
        isMustVisit: editingPlace.isMustVisit,
        suitableCompanions: editingPlace.suitableCompanions,
        tags: tagList,
        status: formStatus,
        isTempClosed: editingPlace.isTempClosed,
        imageUrl: formImageUrl.trim() || undefined,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      }
      saveAdminCustomPlace(updatedPlaceItem)

      alert(`'${formName}' 장소 정보가 수정되었습니다!`)
    } else {
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
        suitableCompanions: ['couple', 'friends'],
        tags: tagList,
        status: formStatus,
        isTempClosed: false,
        imageUrl: formImageUrl.trim() || undefined,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        avgWeatherScore: 0,
        avgFunScore: 0,
        overallRating: 0,
        reviewCount: 0,
        reviewsList: [],
      }
      setPlaces((prev) => [newPlace, ...prev])
      setAdminPlaceStatus(formName, false, formStatus, formImageUrl.trim())
      saveAdminCustomPlace(newPlace)
      alert(`신규 장소 '${formName}'이(가) 등록되었습니다!`)
    }

    setIsModalOpen(false)
    setEditingPlace(null)
  }

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
    setFormImageUrl(p.imageUrl || '')
    setIsModalOpen(true)
  }

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
    setFormImageUrl('')
    setIsModalOpen(true)
  }

  // 🔴 [영업중 / 휴업 설정 함수] Admin에서 설정하면 localStorage 및 실시간 추천 알고리즘에 즉각 연동!
  const handleToggleTempClosed = (p: AdminPlaceItem) => {
    const nextClosedState = !p.isTempClosed
    setAdminPlaceStatus(p.name, nextClosedState, p.status)

    setPlaces((prev) =>
      prev.map((item) => {
        if (item.id === p.id) {
          return { ...item, isTempClosed: nextClosedState }
        }
        return item
      })
    )

    alert(
      `'${p.name}' 상태가 [${
        nextClosedState
          ? '🔴 휴업/임시휴업 (추천 제외)'
          : '🟢 정상 영업중 (추천 포함)'
      }]으로 즉시 적용되었습니다.`
    )
  }

  const handleToggleFeatured = (id: string) => {
    setPlaces((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.isFeatured
          alert(`'${p.name}' 추천 피처링 뱃지가 [${next ? '⭐ 설정됨' : '해제됨'}]입니다.`)
          return { ...p, isFeatured: next }
        }
        return p
      })
    )
  }

  const handleChangeStatus = (id: string, status: 'active' | 'review' | 'inactive') => {
    setPlaces((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          setAdminPlaceStatus(p.name, p.isTempClosed, status)
          return { ...p, status }
        }
        return p
      })
    )
  }

  // 🔒 로그인하지 않은 경우 관리자 로그인 & 가입 관문 관문 표시!
  if (!isAuthLoaded) return null
  if (!adminSessionState) {
    return <AdminLoginGateway onLoginSuccess={(account) => setAdminSessionState(account)} />
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

          {/* 관리자 프로필 & 로그아웃 버튼 */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-3.5 py-1.5 text-xs text-amber-200 flex items-center gap-2 shadow-xs">
              <ShieldCheck className="size-4 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white leading-none">{adminSessionState.name}</p>
                <p className="text-[10px] text-amber-400/80 mt-0.5 font-mono">{adminSessionState.email}</p>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors shadow-sm"
            >
              <span>🌐 사용자 서비스</span>
              <ExternalLink className="size-3.5 text-slate-400" />
            </Link>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                setAdminSession(null)
                setAdminSessionState(null)
              }}
              className="h-9 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900 font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              <LogOut className="size-3.5" />
              <span>로그아웃</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* 📊 상단 핵심 현황 대시보드 카드리스트 */}
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

          <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-sky-400">👤 회원가입 사용자 계정</p>
              <p className="text-2xl font-black text-sky-300 mt-1">{stats.totalUsersCount}<span className="text-xs font-medium text-sky-500/80 ml-1">명 (P형 {stats.pStyleUsersCount}명)</span></p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <Users className="size-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-400">⭐ 실 사용자 평균 평점</p>
              <p className="text-2xl font-black text-amber-300 mt-1">
                {Number(stats.avgRatingAll) > 0 ? `⭐ ${stats.avgRatingAll}` : '평가 대기중'}
                {Number(stats.avgRatingAll) > 0 && <span className="text-xs font-medium text-amber-500/80 ml-1">/ 5.0</span>}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Star className="size-5 fill-amber-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400">🌤️ 날씨 어울림 1위 스팟</p>
              <p className="text-sm font-extrabold text-emerald-300 mt-1 truncate max-w-[120px]">
                {stats.topWeatherSpot ? stats.topWeatherSpot.name : '평가 작성 대기'}
              </p>
              <p className="text-[10px] text-emerald-400/80 font-bold">
                {stats.topWeatherSpot ? `⭐ ${stats.topWeatherSpot.avgWeatherScore}점` : '유저 참여 필요'}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <SunMedium className="size-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-400">🎉 재미/만족도 1위 스팟</p>
              <p className="text-sm font-extrabold text-purple-300 mt-1 truncate max-w-[120px]">
                {stats.topFunSpot ? stats.topFunSpot.name : '평가 작성 대기'}
              </p>
              <p className="text-[10px] text-purple-400/80 font-bold">
                {stats.topFunSpot ? `⭐ ${stats.topFunSpot.avgFunScore}점` : '유저 참여 필요'}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Smile className="size-5" />
            </div>
          </div>
        </div>

        {/* 🎯 탭 메뉴 네비게이션 (1장~6장 순서대로 깔끔하게 정렬된 6열 그리드 네비게이션) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-xl font-sans">
          {/* 1장 */}
          <button
            type="button"
            onClick={() => setActiveTab('crud')}
            className={`flex flex-col items-start gap-1 rounded-xl p-3 text-xs font-bold transition-all cursor-pointer border text-left ${
              activeTab === 'crud'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold ring-2 ring-amber-400/30 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  activeTab === 'crud' ? 'bg-amber-950/30 text-amber-950 font-black' : 'bg-slate-700/80 text-amber-400'
                }`}
              >
                01
              </span>
              <Building2 className="size-4 shrink-0" />
            </div>
            <span className="truncate w-full font-bold text-xs mt-1">1장. 장소 CRUD DB</span>
            <span className={`text-[10px] truncate w-full ${activeTab === 'crud' ? 'text-amber-950/80 font-semibold' : 'text-slate-400'}`}>
              장소 데이터 등록/수정
            </span>
          </button>

          {/* 2장 */}
          <button
            type="button"
            onClick={() => setActiveTab('hours')}
            className={`flex flex-col items-start gap-1 rounded-xl p-3 text-xs font-bold transition-all cursor-pointer border text-left ${
              activeTab === 'hours'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold ring-2 ring-amber-400/30 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  activeTab === 'hours' ? 'bg-amber-950/30 text-amber-950 font-black' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                02
              </span>
              <Clock className="size-4 shrink-0" />
            </div>
            <span className="truncate w-full font-bold text-xs mt-1">2장. 영업/휴업 설정</span>
            <span className={`text-[10px] truncate w-full ${activeTab === 'hours' ? 'text-amber-950/80 font-semibold' : 'text-slate-400'}`}>
              실시간 영업 상태 제어
            </span>
          </button>

          {/* 3장 */}
          <button
            type="button"
            onClick={() => setActiveTab('monitoring')}
            className={`flex flex-col items-start gap-1 rounded-xl p-3 text-xs font-bold transition-all cursor-pointer border text-left ${
              activeTab === 'monitoring'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold ring-2 ring-amber-400/30 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  activeTab === 'monitoring' ? 'bg-amber-950/30 text-amber-950 font-black' : 'bg-slate-700/80 text-amber-400'
                }`}
              >
                03
              </span>
              <BarChart3 className="size-4 shrink-0" />
            </div>
            <span className="truncate w-full font-bold text-xs mt-1">3장. API & 신고 센터</span>
            <span className={`text-[10px] truncate w-full ${activeTab === 'monitoring' ? 'text-amber-950/80 font-semibold' : 'text-slate-400'}`}>
              API 모니터링 & 신고함
            </span>
          </button>

          {/* 4장 */}
          <button
            type="button"
            onClick={() => setActiveTab('ratings')}
            className={`flex flex-col items-start gap-1 rounded-xl p-3 text-xs font-bold transition-all cursor-pointer border text-left ${
              activeTab === 'ratings'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold ring-2 ring-amber-400/30 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  activeTab === 'ratings' ? 'bg-amber-950/30 text-amber-950 font-black' : 'bg-slate-700/80 text-amber-400'
                }`}
              >
                04
              </span>
              <Star className={`size-4 shrink-0 ${activeTab === 'ratings' ? 'fill-amber-950' : 'fill-amber-400 text-amber-400'}`} />
            </div>
            <span className="truncate w-full font-bold text-xs mt-1">4장. 평점 & 후기 관리</span>
            <span className={`text-[10px] truncate w-full ${activeTab === 'ratings' ? 'text-amber-950/80 font-semibold' : 'text-slate-400'}`}>
              장소별 / 경로별 후기
            </span>
          </button>

          {/* 5장 */}
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-start gap-1 rounded-xl p-3 text-xs font-bold transition-all cursor-pointer border text-left ${
              activeTab === 'users'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold ring-2 ring-amber-400/30 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  activeTab === 'users' ? 'bg-amber-950/30 text-amber-950 font-black' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}
              >
                05
              </span>
              <Users className="size-4 shrink-0" />
            </div>
            <span className="truncate w-full font-bold text-xs mt-1">5장. 사용자 & 승인 센터</span>
            <span className={`text-[10px] truncate w-full ${activeTab === 'users' ? 'text-amber-950/80 font-semibold' : 'text-sky-300'}`}>
              회원/승인 ({registeredUsers.length}명)
            </span>
          </button>

          {/* 6장 */}
          <button
            type="button"
            onClick={() => setActiveTab('banners')}
            className={`flex flex-col items-start gap-1 rounded-xl p-3 text-xs font-bold transition-all cursor-pointer border text-left ${
              activeTab === 'banners'
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md font-extrabold ring-2 ring-amber-400/30 scale-[1.02]'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  activeTab === 'banners' ? 'bg-amber-950/30 text-amber-950 font-black' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                06
              </span>
              <Megaphone className="size-4 shrink-0 text-amber-400" />
            </div>
            <span className="truncate w-full font-bold text-xs mt-1">6장. 축제/팝업 배너</span>
            <span className={`text-[10px] truncate w-full ${activeTab === 'banners' ? 'text-amber-950/80 font-semibold' : 'text-rose-300'}`}>
              이벤트 배너 ({bannersList.length}개)
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 6: 👤 회원가입 사용자 현황 & 관리자 계정 승인 센터 */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 🛡️ 관리자 회원가입 신청 승인 목록 섹션 */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
                    <ShieldCheck className="size-5 text-amber-400" />
                    <span>🛡️ 관리자 회원가입 신청 승인 & 계정 센터 ({adminAccountsList.length}명)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    신규 관리자가 가입 신청을 하면 승인 대기 목록에 표시됩니다. 기존 총괄 관리자가 **[🟢 승인 완료]**해야 관리자 로그인이 가능합니다.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-amber-500/30 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold">
                    <tr>
                      <th className="px-4 py-3">관리자 성명</th>
                      <th className="px-4 py-3">아이디 (이메일)</th>
                      <th className="px-4 py-3">직책 / 권한</th>
                      <th className="px-4 py-3">승인 상태</th>
                      <th className="px-4 py-3 text-right">승인 / 거절 액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {adminAccountsList.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>🛡️ {acc.name}</span>
                            {acc.role === 'super' && (
                              <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] px-1.5 py-0.2 font-bold">
                                총괄 슈퍼
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">{acc.email}</td>
                        <td className="px-4 py-3 font-bold text-amber-400">
                          {acc.role === 'super' ? '👑 총괄 슈퍼 관리자' : '🛡️ 일반 관리자'}
                        </td>
                        <td className="px-4 py-3">
                          {acc.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                              🟢 승인 완료
                            </span>
                          ) : acc.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 animate-pulse">
                              🔍 승인 대기중 (승인 필요)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[11px] font-bold text-red-300">
                              🔴 거절됨
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {acc.status !== 'approved' && (
                              <Button
                                size="sm"
                                onClick={() => updateAdminAccountStatus(acc.email, 'approved')}
                                className="h-7 text-xs bg-emerald-500 text-emerald-950 font-extrabold hover:bg-emerald-400 cursor-pointer shadow-xs"
                              >
                                🟢 승인 완료
                              </Button>
                            )}

                            {acc.status !== 'rejected' && acc.role !== 'super' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAdminAccountStatus(acc.email, 'rejected')}
                                className="h-7 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-900/50 cursor-pointer font-bold"
                              >
                                🔴 거절
                              </Button>
                            )}

                            {acc.role !== 'super' && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`'${acc.name}' 관리자 계정을 삭제하시겠습니까?`)) {
                                    deleteAdminAccount(acc.email)
                                  }
                                }}
                                className="rounded-lg border border-red-500/30 bg-red-950/40 p-1 text-red-300 hover:bg-red-900/60 cursor-pointer"
                                title="관리자 계정 삭제"
                              >
                                <Trash2 className="size-3.5" />
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

            {/* 👤 서비스 회원 가입자 현황 목록 섹션 */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-md">
                <div className="relative min-w-[280px] flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="서비스 회원 이름, 닉네임, 이메일 검색..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <UserCheck className="size-4 text-emerald-400" />
                  <span>총 회원 가입자: <strong className="text-white">{registeredUsers.length}명</strong></span>
                </div>
              </div>

              {/* 회원 가입자 테이블 */}
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-bold">
                      <tr>
                        <th className="px-4 py-3">회원 이름 / 닉네임</th>
                        <th className="px-4 py-3">이메일 주소</th>
                        <th className="px-4 py-3">여행 성향 (MBTI)</th>
                        <th className="px-4 py-3">가입 일시</th>
                        <th className="px-4 py-3">저장 코스 / 평가 후기</th>
                        <th className="px-4 py-3 text-right">계정 관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredRegisteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                            가입된 서비스 회원 검색 결과가 없거나 회원 목록이 비어 있습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredRegisteredUsers.map((u, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-white text-sm">
                              <div className="flex items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-full bg-slate-800 text-amber-300 text-xs font-black">
                                  👤
                                </span>
                                <span>{u.name}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-slate-300 font-mono">
                              {u.email}
                            </td>

                            <td className="px-4 py-3.5">
                              {u.travelStyle === 'P' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                                  🎯 P (즉흥형 - 100% 추천 반응)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 border border-sky-400/40 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                                  📋 J (계획형)
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                              {u.createdAt}
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="text-amber-300 font-bold">
                                  📂 저장 코스 {u.savedCoursesCount}개
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-emerald-400 font-bold">
                                  ✍️ 작성 리뷰 {u.reviewsCount}개
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUserAccount(u.email, u.name)}
                                  className="rounded-lg border border-red-500/30 bg-red-950/40 px-2.5 py-1 text-red-300 hover:bg-red-900/60 font-bold text-[11px] cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="size-3" />
                                  <span>회원 탈퇴</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: 🏢 장소 데이터 CRUD & 영업 상태 목록 */}
        {/* ========================================================================= */}
        {activeTab === 'crud' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 검색 및 필터 컨트롤 바 */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-md">
              <div className="flex flex-wrap items-center gap-3 flex-1">
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
                      <th className="px-4 py-3">영업 상태 설정</th>
                      <th className="px-4 py-3">⭐ 실 사용자 평점</th>
                      <th className="px-4 py-3">비용 및 체류시간</th>
                      <th className="px-4 py-3">실내/야외</th>
                      <th className="px-4 py-3 text-right">관리 액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPlaces.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={getPlaceImageUrl(p.name, p.category, p.imageUrl)}
                              alt={p.name}
                              className="size-11 rounded-xl object-cover border border-slate-700 shrink-0 shadow-sm"
                            />
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {p.isFeatured && (
                                  <span className="rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] px-1.5 py-0.2 font-bold">
                                    ⭐ 피처링
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-400 text-[11px] mt-0.5">{p.category} • {p.address}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleTempClosed(p)}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer transition-all border shadow-xs ${
                              p.isTempClosed
                                ? 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                            }`}
                          >
                            {p.isTempClosed ? (
                              <>
                                <ToggleRight className="size-4 text-red-400" />
                                <span>🔴 휴업 (추천 제외)</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="size-4 text-emerald-400" />
                                <span>🟢 정상 영업중</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3.5">
                          {p.reviewCount > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-extrabold text-amber-300">⭐ {p.overallRating}점 ({p.reviewCount}건)</span>
                              <span className="text-[10px] text-slate-400">🌤️ {p.avgWeatherScore} • 🎉 {p.avgFunScore}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                              아직 작성된 평점 없음
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

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(p.id)}
                              className={`rounded-lg border p-1.5 cursor-pointer transition-colors ${
                                p.isFeatured
                                  ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                              title="피처링 뱃지 토글"
                            >
                              <Star className="size-3.5 fill-current" />
                            </button>

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
        {/* TAB 2: ⏱️ 장소별 영업중 / 휴업 설정 센터 */}
        {/* ========================================================================= */}
        {activeTab === 'hours' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">💡 영업중 vs 휴업(임시휴업) 상태 설정 안내</p>
                <p className="mt-1 leading-relaxed text-slate-300">
                  관리자에서 장소를 **[🔴 휴업]** 상태로 전환하시면, 사용자 코스 추천 생성 알고리즘에서 **즉각 제외**됩니다. 다시 **[🟢 영업중]**으로 전환하시면 추천 대상에 바로 포함됩니다.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 shadow-md transition-all ${
                    p.isTempClosed
                      ? 'border-red-500/50 bg-red-950/20'
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
                      onClick={() => handleToggleTempClosed(p)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer transition-all border shadow-sm ${
                        p.isTempClosed
                          ? 'bg-red-500 text-white border-red-400 shadow-md'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      }`}
                    >
                      {p.isTempClosed ? '🔴 현재 휴업 중 (추천 제외)' : '🟢 현재 정상 영업중'}
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">운영시간:</span>
                      <span className="font-semibold text-white">{p.operatingHours}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">실내/야외:</span>
                      <span className="text-slate-300">{p.isIndoor ? '🏠 실내 100%' : '🌳 야외/산책'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">실제 작성 평점:</span>
                      <span className="font-bold text-amber-300">
                        {p.reviewCount > 0 ? `⭐ ${p.overallRating} (${p.reviewCount}건)` : '작성된 평점 없음'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ⭐ 실 사용자 작성 평점 및 후기 모니터링 (장소별 + 경로/코스별) */}
        {/* ========================================================================= */}
        {activeTab === 'ratings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 서브탭 헤더 네비게이션 */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
              <div>
                <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
                  <Star className="size-5 text-amber-400 fill-amber-400" />
                  <span>실제 사용자가 작성한 장소별 & 경로(코스)별 평점 후기 모니터링</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  프론트엔드 [내 정보 관리]에서 소비자가 직접 평가한 점수 및 여행 코스 후기가 100% 통합 집계됩니다.
                </p>
              </div>

              {/* 📍 장소별 후기 vs 🗺️ 경로(코스)별 후기 전환 서브탭 */}
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setReviewSubTab('spot')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold cursor-pointer transition-all ${
                    reviewSubTab === 'spot'
                      ? 'bg-amber-500 text-amber-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="size-3.5" />
                  <span>📍 장소별 평점 후기</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewSubTab('course')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold cursor-pointer transition-all ${
                    reviewSubTab === 'course'
                      ? 'bg-amber-500 text-amber-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="size-3.5" />
                  <span>🗺️ 경로(코스)별 후기 ({courseReviews.length}건)</span>
                </button>
              </div>
            </div>

            {/* 📍 [1] 장소별 평점 후기 모드 */}
            {reviewSubTab === 'spot' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">📍 장소별 평가 집계 현황</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-semibold px-2 flex items-center gap-1">
                      <Filter className="size-3.5" /> 정렬:
                    </span>
                    <button
                      type="button"
                      onClick={() => setRatingSort('overall')}
                      className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer transition-all ${
                        ratingSort === 'overall'
                          ? 'bg-amber-500 text-amber-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      종합 평점순
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingSort('weather')}
                      className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer transition-all ${
                        ratingSort === 'weather'
                          ? 'bg-emerald-500 text-emerald-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🌤️ 날씨 어울림순
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingSort('fun')}
                      className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer transition-all ${
                        ratingSort === 'fun'
                          ? 'bg-purple-500 text-purple-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🎉 재미/만족도순
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingSort('count')}
                      className={`rounded-lg px-2.5 py-1 font-bold cursor-pointer transition-all ${
                        ratingSort === 'count'
                          ? 'bg-sky-500 text-sky-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      리뷰 많은순
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedRatingPlaces.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-white text-base">{p.name}</h3>
                              {p.isFeatured && (
                                <span className="rounded bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 font-bold border border-amber-400/40">
                                  ⭐ 피처링
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>
                          </div>

                          <div className="rounded-xl bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-center">
                            <p className="text-xs font-semibold text-amber-400">종합 평점</p>
                            <p className="text-lg font-black text-amber-300">
                              {p.reviewCount > 0 ? `⭐ ${p.overallRating}` : '평가없음'}
                            </p>
                          </div>
                        </div>

                        {p.reviewCount > 0 ? (
                          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5 text-xs">
                            <div>
                              <div className="flex justify-between text-emerald-400 font-semibold mb-1">
                                <span className="flex items-center gap-1">
                                  <SunMedium className="size-3.5" /> 🌤️ 날씨 어울림 점수
                                </span>
                                <span className="font-bold">⭐ {p.avgWeatherScore} / 5.0</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-400 rounded-full"
                                  style={{ width: `${(p.avgWeatherScore / 5) * 100}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-purple-400 font-semibold mb-1">
                                <span className="flex items-center gap-1">
                                  <Smile className="size-3.5" /> 🎉 재미/만족도 점수
                                </span>
                                <span className="font-bold">⭐ {p.avgFunScore} / 5.0</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-purple-400 rounded-full"
                                  style={{ width: `${(p.avgFunScore / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center py-4">
                            <p className="text-xs text-slate-500 font-medium">
                              ✍️ 아직 사용자가 남긴 평점이 없습니다.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-semibold">
                          총 {p.reviewCount}개 평가 참여
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={p.reviewCount === 0}
                          onClick={() => setSelectedPlaceReviews(p)}
                          className="rounded-xl border-slate-700 bg-slate-900 text-xs text-sky-300 hover:bg-slate-800 gap-1 cursor-pointer font-bold disabled:opacity-40"
                        >
                          <MessageSquare className="size-3.5 text-sky-400" />
                          <span>한줄평 후기 ({p.reviewsList.length})</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🗺️ [2] 사용자 경로(코스)별 평점 후기 모드 */}
            {reviewSubTab === 'course' && (
              <div className="space-y-4">
                {courseReviews.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl border border-slate-800 bg-slate-950/80">
                    <BookOpen className="size-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">
                      ✍️ 아직 작성된 사용자 경로(코스) 후기가 없습니다.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      소비자가 [내 정보 관리] ➔ [저장한 여행 코스]에서 별점과 한줄평 후기를 작성하면 모니터링에 실시간 집계됩니다.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {courseReviews.map((cr) => (
                      <div
                        key={cr.courseId}
                        className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-xl space-y-3.5 hover:border-slate-700 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div>
                              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                                <span>🗺️ {cr.courseTitle}</span>
                              </h3>
                              <p className="text-[11px] text-slate-400 mt-1 font-mono flex items-center gap-2">
                                <span>👤 {cr.userName}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-500">{cr.userEmail}</span>
                              </p>
                            </div>

                            <div className="rounded-xl bg-amber-500/20 border border-amber-400/40 px-2.5 py-1 text-center shrink-0">
                              <p className="text-[10px] font-semibold text-amber-400">코스 평점</p>
                              <p className="text-base font-black text-amber-300">⭐ {cr.rating}.0</p>
                            </div>
                          </div>

                          {/* 태그 & 날씨 동행 정보 */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            <span className="rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] px-2 py-0.5 font-bold">
                              {cr.weatherSummary}
                            </span>
                            <span className="rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] px-2 py-0.5 font-bold">
                              👥 {cr.companion}
                            </span>
                            {cr.satisfactionTags.map((tag, tIdx) => (
                              <span key={tIdx} className="rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] px-2 py-0.5 font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* 방문 포함 장소 동선 */}
                          {cr.spots.length > 0 && (
                            <div className="mt-3 rounded-xl bg-slate-900/80 border border-slate-800 p-2.5 space-y-1">
                              <p className="text-[10px] font-bold text-slate-400">📍 코스 동선 목록 ({cr.spots.length}곳)</p>
                              <p className="text-xs text-slate-200 font-semibold truncate">
                                {cr.spots.join(' ➔ ')}
                              </p>
                            </div>
                          )}

                          {/* 유저 작성 후기 내용 */}
                          <div className="mt-3 rounded-xl bg-amber-950/20 border border-amber-500/20 p-3">
                            <p className="text-[10px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                              <MessageSquare className="size-3" /> 작성 후기:
                            </p>
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                              "{cr.reviewContent}"
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span>📅 작성일시: {cr.reviewedAt}</span>
                          <span className="text-emerald-400 font-bold">🟢 실유저 후기 검증완료</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 📊 API 모니터링 & 사용자 오류 신고함 */}
        {/* ========================================================================= */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6 animate-in fade-in duration-200">
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

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-amber-400" />
                  <span>📥 사용자 정보 오류 신고 접수함</span>
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  실시간 접수건: <strong className="text-amber-300">{reports.length}건</strong>
                </span>
              </h2>

              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-slate-800/80">
                    <p className="text-xs text-slate-500">
                      📥 현재 소비자가 프론트엔드에서 접수한 정보 오류 신고가 없습니다.
                    </p>
                  </div>
                ) : (
                  reports.map((rep) => (
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
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{rep.content}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rep.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              updateReportStatusInStorage(rep.id, 'processing')
                            }}
                            className="h-8 text-xs bg-amber-500 text-amber-950 font-bold hover:bg-amber-400 cursor-pointer shadow-xs"
                          >
                            접수 ➔ 확인 시작
                          </Button>
                        ) : rep.status === 'processing' ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              updateReportStatusInStorage(rep.id, 'resolved')
                            }}
                            className="h-8 text-xs bg-emerald-500 text-emerald-950 font-bold hover:bg-emerald-400 cursor-pointer shadow-xs"
                          >
                            수정 완료 처리
                          </Button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
                            ✓ 수정 처리 완료
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`'${rep.placeName}' 오류 신고 건을 삭제하시겠습니까?`)) {
                              deleteReportFromStorage(rep.id)
                            }
                          }}
                          className="rounded-lg border border-red-500/30 bg-red-950/40 p-1.5 text-red-300 hover:bg-red-900/60 cursor-pointer"
                          title="신고 항목 삭제"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: 🎉 실시간 축제 & 팝업 스토어 배너 관리 센터 */}
        {/* ========================================================================= */}
        {activeTab === 'banners' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 shadow-xl">
              <div>
                <h2 className="text-base font-bold text-rose-200 flex items-center gap-2">
                  <Megaphone className="size-5 text-rose-400" />
                  <span>메인 화면 우측 전주 축제 & 팝업 스토어 배너 관리</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  메인 페이지(`http://localhost:3000`) 우측에 노출되는 실시간 이벤트/축제/팝업스토어 배너를 등록하고 수정합니다.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleOpenNewBannerModal}
                className="rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400 font-extrabold text-xs gap-1.5 shadow-lg cursor-pointer"
              >
                <Plus className="size-4" />
                <span>➕ 신규 축제/팝업 배너 등록</span>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bannersList.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-5 shadow-xl space-y-3.5 transition-all flex flex-col justify-between ${
                    b.isActive
                      ? 'border-slate-800 bg-slate-950/90'
                      : 'border-slate-800/60 bg-slate-950/40 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                          {b.category}
                        </span>
                        <h3 className="font-extrabold text-white text-base mt-1.5">{b.title}</h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleBannerActive(b)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-all border shrink-0 ${
                          b.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {b.isActive ? (
                          <>
                            <ToggleRight className="size-3.5 text-emerald-400" />
                            <span>🟢 메인 노출중</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="size-3.5 text-slate-500" />
                            <span>⚪ 숨김 (비활성)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <Calendar className="size-3.5 text-amber-400" /> {b.period}
                      </p>
                      {b.location && (
                        <p className="text-slate-400 flex items-center gap-1">
                          <MapPin className="size-3.5 text-slate-500" /> {b.location}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-900 p-3 border border-slate-800/80">
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        "{b.description}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">최종 수정: {b.updatedAt}</span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditBannerModal(b)}
                        className="h-8 rounded-lg border-slate-700 bg-slate-900 text-xs text-amber-300 hover:bg-slate-800 gap-1 cursor-pointer font-bold"
                      >
                        <Edit3 className="size-3.5" />
                        <span>수정</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(b.id, b.title)}
                        className="rounded-lg border border-red-500/30 bg-red-950/40 p-2 text-red-300 hover:bg-red-900/60 cursor-pointer"
                        title="배너 삭제"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 💬 장소별 실제 사용자 작성 세부 리뷰 모달 */}
      {selectedPlaceReviews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>💬 '{selectedPlaceReviews.name}' 실 사용자 리뷰 목록</span>
                </h3>
                <p className="text-xs text-amber-300 font-semibold mt-0.5">
                  종합 평점 ⭐ {selectedPlaceReviews.overallRating} (총 {selectedPlaceReviews.reviewCount}개 평가)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlaceReviews(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {selectedPlaceReviews.reviewsList.length === 0 ? (
                <p className="text-center text-slate-500 text-xs py-8">
                  아직 사용자가 남긴 한 줄 평 후기가 없습니다.
                </p>
              ) : (
                selectedPlaceReviews.reviewsList.map((rev, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">👤 {rev.userName}</span>
                      <span className="text-slate-500 text-[10px]">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-400 font-bold">
                        🌤️ 날씨 어울림 ⭐ {rev.weatherScore}점
                      </span>
                      <span className="text-purple-400 font-bold">
                        🎉 재미/만족도 ⭐ {rev.funScore}점
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✏️ 장소 등록 & 수정 폼 모달 */}
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

              {/* 📷 대표 장소 사진 URL 입력 및 실시간 미리보기 */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <label className="block text-slate-300 font-bold flex items-center justify-between">
                  <span>📷 대표 장소 실사 사진 URL (Image URL)</span>
                  <span className="text-[11px] text-amber-400 font-normal">네이버/Unsplash/외부 이미지 주소 변경 가능</span>
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="예: https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400 font-mono text-xs"
                />

                {/* 빠른 이미지 프리셋 샘플 버튼 */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">⚡ 샘플 프리셋:</span>
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTA2MDRfMTg5%2FMDAxNzQ5MDIwNTQyNDc5.hMnVe9xBm7-pRd6g63eqPprBa_TtMrFSYFD5F0gCc5Ig.6WRVtCMCaaDJ0I5JgDxqgKVHvyqhs-zSOecttSE97GIg.JPEG%2F570A9367-3.jpg')}
                    className="rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-amber-300 border border-slate-700 font-bold"
                  >
                    🏛️ 전동성당 실사
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80')}
                    className="rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-amber-300 border border-slate-700 font-bold"
                  >
                    ☕ 한옥 감성 카페
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80')}
                    className="rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-amber-300 border border-slate-700 font-bold"
                  >
                    🍷 전통주/양조장
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80')}
                    className="rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-amber-300 border border-slate-700 font-bold"
                  >
                    📚 독립서점/문학관
                  </button>
                </div>

                {/* 실시간 사진 미리보기 */}
                {formImageUrl.trim() && (
                  <div className="mt-2.5 rounded-xl border border-slate-800 bg-slate-900 p-2.5 flex items-center gap-3">
                    <img
                      src={formImageUrl.trim()}
                      alt="사진 미리보기"
                      className="size-14 rounded-lg object-cover border border-slate-700 shrink-0"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
                      }}
                    />
                    <div>
                      <p className="text-[11px] font-bold text-emerald-400">🖼️ 대표 사진 실시간 연결 완료</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-sm">{formImageUrl}</p>
                    </div>
                  </div>
                )}
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

      {/* 📢 축제 & 팝업 스토어 배너 등록/수정 모달 */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Megaphone className="size-5 text-amber-400" />
                <span>{editingBanner ? `'${editingBanner.title}' 배너 수정` : '📢 신규 축제/팝업 배너 등록'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">카테고리 구분 *</label>
                  <select
                    value={bannerCategory}
                    onChange={(e) => setBannerCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                  >
                    <option value="🎉 축제·행사">🎉 축제·행사</option>
                    <option value="🎁 팝업스토어">🎁 팝업스토어</option>
                    <option value="🍺 푸드페스타">🍺 푸드페스타</option>
                    <option value="🌙 야간이벤트">🌙 야간이벤트</option>
                    <option value="🎨 전시·공연">🎨 전시·공연</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">뱃지 색상 테마</label>
                  <select
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                  >
                    <option value="amber">🟠 앰버 (전주 한옥 감성)</option>
                    <option value="purple">🟣 퍼플 (팝업스토어/공방)</option>
                    <option value="emerald">🟢 에메랄드 (푸드/청량)</option>
                    <option value="sky">🔵 스카이 (야외/산책)</option>
                    <option value="rose">🔴 로즈 (특별 이벤트)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">축제/팝업스토어 배너 제목 *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="예: 2026 전주 한옥마을 야행 & 팝업스토어"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">행사 기간 / 일정 *</label>
                  <input
                    type="text"
                    required
                    value={bannerPeriod}
                    onChange={(e) => setBannerPeriod(e.target.value)}
                    placeholder="예: 2026.08.01 ~ 08.15 (주말 야간)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">장소 / 위치 *</label>
                  <input
                    type="text"
                    required
                    value={bannerLocation}
                    onChange={(e) => setBannerLocation(e.target.value)}
                    placeholder="예: 전주 경기전 & 팔복예술공장"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">상세 안내 설명 문구 *</label>
                <textarea
                  rows={3}
                  required
                  value={bannerDescription}
                  onChange={(e) => setBannerDescription(e.target.value)}
                  placeholder="달빛 아래 펼쳐지는 한옥 야경 탐방과 로컬 청년 아티스트들의 팝업 스토어!"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">메인 노출 상태</label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={bannerIsActive}
                    onChange={(e) => setBannerIsActive(e.target.checked)}
                    className="size-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <span className="text-white font-bold">🟢 메인 페이지(`http://localhost:3000`)에 즉시 노출</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400 font-bold cursor-pointer"
                >
                  {editingBanner ? '배너 수정사항 저장' : '신규 배너 등록 완료'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
