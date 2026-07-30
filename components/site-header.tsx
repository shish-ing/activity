'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserCheck, LogOut, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthModal, RegisteredUser } from '@/components/auth-modal'
import { MyPageModal } from '@/components/my-page-modal'
import { getAppLang, setAppLang, t, type AppLang } from '@/lib/i18n'

export function SiteHeader({ showBack = false }: { showBack?: boolean }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [isMyPageOpen, setIsMyPageOpen] = useState(false)
  const [user, setUser] = useState<RegisteredUser | null>(null)
  const [lang, setLang] = useState<AppLang>('ko')

  // 페이지 진입 시 세션 및 다국어 실시간 수신
  useEffect(() => {
    setLang(getAppLang())
    const handleLangChange = () => setLang(getAppLang())
    window.addEventListener('jeonju_lang_changed', handleLangChange)
    window.addEventListener('storage', handleLangChange)

    try {
      const savedSession = localStorage.getItem('jeonju_current_user')
      if (savedSession) {
        setUser(JSON.parse(savedSession))
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('jeonju_lang_changed', handleLangChange)
      window.removeEventListener('storage', handleLangChange)
    }
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

  const toggleLanguage = () => {
    setAppLang(lang === 'ko' ? 'en' : 'ko')
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sky-200/60 bg-white/95 backdrop-blur-md shadow-xs transition-all">
        <div className="relative mx-auto flex h-16 sm:h-20 w-full max-w-5xl items-center justify-between px-4 sm:px-6 py-1">
          {/* Left slot: 뒤로가기 버튼 */}
          <div className="flex items-center z-10">
            {showBack ? (
              <Button
                render={<Link href="/" prefetch={true} aria-label={t('뒤로 가기', 'Go Back', lang)} />}
                nativeButton={false}
                variant="ghost"
                size="icon"
              >
                <ArrowLeft className="size-5 text-slate-700" />
              </Button>
            ) : null}
          </div>

          {/* Center slot: 순수 일러스트 + 2줄 조합 텍스트 (검은색 '지금,' + 갈색 손글씨 '전주') */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
            <Link
              href="/"
              prefetch={true}
              className="pointer-events-auto flex items-center gap-3 sm:gap-4 group py-1"
            >
              <img
                src="/illustration.png"
                alt="전주 한옥과 달"
                className="h-13 sm:h-16 md:h-18 w-auto object-contain drop-shadow-2xs transition-transform duration-200 group-hover:scale-103"
              />

              <div className="flex flex-col items-start leading-none">
                <span className="font-sans text-sm sm:text-base md:text-lg font-normal text-slate-900 tracking-tight">
                  {t('지금,', 'Now,', lang)}
                </span>
                <span className="font-handwriting text-lg sm:text-xl md:text-2xl font-bold text-[#4E3629] tracking-tight ml-2.5 sm:ml-3.5 mt-0.5 drop-shadow-2xs">
                  {t('전주', 'Jeonju', lang)}
                </span>
              </div>
            </Link>
          </div>

          {/* Right slot: 언어 변환 콤보 & 로그인 / 회원가입 / 내 정보 관리 버튼 */}
          <div className="flex items-center gap-2 z-10 font-sans">
            {/* 🌐 언어 변환 스위처 버튼 */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/90 hover:bg-amber-100 px-2.5 sm:px-3 py-1 text-xs font-black text-amber-950 shadow-2xs transition-all cursor-pointer"
              title={t('언어 변경 (Language)', 'Change Language', lang)}
            >
              <Globe className="size-3.5 text-amber-700" />
              <span>{lang === 'ko' ? '🇰🇷 KOR' : '🇺🇸 ENG'}</span>
            </button>

            {/* Auth / MyPage Buttons */}
            {user ? (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsMyPageOpen(true)}
                  className="flex items-center gap-1.5 text-slate-900 font-bold bg-gradient-to-r from-amber-100 to-amber-200/90 border border-amber-300/90 hover:border-amber-400 px-2.5 sm:px-3 py-1 rounded-full transition-all shadow-2xs"
                  title={t('내 정보 관리 및 저장한 코스 보기', 'Manage My Info & Saved Courses', lang)}
                >
                  <UserCheck className="size-3.5 text-amber-800 shrink-0" />
                  <span className="hidden sm:inline">👋 {user.name}{t('님', '', lang)}</span>
                  <span className="ml-0.5 inline-flex items-center gap-0.5 rounded-md bg-amber-500 text-amber-950 px-1.5 py-0.5 text-[10px] font-extrabold shadow-2xs">
                    📂 {t('내 정보 관리', 'My Info', lang)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  title={t('로그아웃', 'Logout', lang)}
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenAuth('login')}
                  className="rounded-lg px-2 sm:px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {t('로그인', 'Login', lang)}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuth('signup')}
                  className="rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 sm:px-3 py-1 text-xs font-black text-amber-950 shadow-2xs transition-all"
                >
                  {t('회원가입', 'Sign Up', lang)}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
      />

      {/* My Page Modal */}
      <MyPageModal
        isOpen={isMyPageOpen}
        onClose={() => setIsMyPageOpen(false)}
        user={user}
      />
    </>
  )
}
