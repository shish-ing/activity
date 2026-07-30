'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserCheck, LogOut, FolderHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthModal, RegisteredUser } from '@/components/auth-modal'
import { MyPageModal } from '@/components/my-page-modal'

export function SiteHeader({ showBack = false }: { showBack?: boolean }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [isMyPageOpen, setIsMyPageOpen] = useState(false)
  const [user, setUser] = useState<RegisteredUser | null>(null)

  // 페이지 진입 시 저장된 로그인 세션 자동 복원
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('jeonju_current_user')
      if (savedSession) {
        setUser(JSON.parse(savedSession))
      }
    } catch (e) {}
  }, [])

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('jeonju_current_user')
    } catch (e) {}
    setUser(null)
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sky-200/60 bg-white/95 backdrop-blur-md shadow-xs transition-all">
        <div className="relative mx-auto flex h-16 sm:h-20 w-full max-w-5xl items-center justify-between px-4 sm:px-6 py-1">
          {/* Left slot: 뒤로가기 버튼 */}
          <div className="flex items-center z-10">
            {showBack ? (
              <Button
                render={<Link href="/" aria-label="뒤로 가기" />}
                nativeButton={false}
                variant="ghost"
                size="icon-md"
              >
                <ArrowLeft className="size-5 text-slate-700" />
              </Button>
            ) : null}
          </div>

          {/* Center slot: 순수 일러스트 + 2줄 조합 텍스트 (검은색 '지금,' + 갈색 손글씨 '전주') */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
            <Link
              href="/"
              className="pointer-events-auto flex items-center gap-3 sm:gap-4 group py-1"
            >
              {/* 잔여 글씨 찌꺼기가 완벽히 제거된 전주 한옥·달 일러스트 */}
              <img
                src="/illustration.png"
                alt="전주 한옥과 달"
                className="h-13 sm:h-16 md:h-18 w-auto object-contain drop-shadow-2xs transition-transform duration-200 group-hover:scale-103"
              />

              {/* 위아래 2줄 배치 (검은색 고딕 '지금,' + 갈색 손글씨 '전주', 적절히 아담한 크기) */}
              <div className="flex flex-col items-start leading-none">
                <span className="font-sans text-sm sm:text-base md:text-lg font-normal text-slate-900 tracking-tight">
                  지금,
                </span>
                <span className="font-handwriting text-lg sm:text-xl md:text-2xl font-bold text-[#4E3629] tracking-tight ml-2.5 sm:ml-3.5 mt-0.5 drop-shadow-2xs">
                  전주
                </span>
              </div>
            </Link>
          </div>

          {/* Right slot: 서브 배지 및 로그인 / 회원가입 / 내 정보 관리 버튼 */}
          <div className="flex flex-col items-end gap-1.5 z-10 font-sans">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-0.5 text-[11px] font-semibold text-amber-900 shadow-2xs">
              전주 즉흥 여행 실시간 큐레이션
            </span>

            {/* Auth / MyPage Buttons */}
            {user ? (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsMyPageOpen(true)}
                  className="flex items-center gap-1.5 text-slate-900 font-bold bg-gradient-to-r from-amber-100 to-amber-200/90 border border-amber-300/90 hover:border-amber-400 px-3 py-1 rounded-full transition-all shadow-2xs"
                  title="내 정보 관리 및 저장한 코스 보기"
                >
                  <UserCheck className="size-3.5 text-amber-800 shrink-0" />
                  <span>👋 {user.name}님</span>
                  <span className="ml-0.5 inline-flex items-center gap-0.5 rounded-md bg-amber-500 text-amber-950 px-1.5 py-0.5 text-[10px] font-extrabold shadow-2xs">
                    📂 내 정보 관리
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  title="로그아웃"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenAuth('login')}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuth('signup')}
                  className="rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1 text-xs font-bold text-amber-950 shadow-2xs transition-all"
                >
                  회원가입
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal (Login / Sign Up Dialog) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
      />

      {/* My Page Modal (내 정보 관리 및 저장한 여행 코스 목록) */}
      <MyPageModal
        isOpen={isMyPageOpen}
        onClose={() => setIsMyPageOpen(false)}
        user={user}
      />
    </>
  )
}
