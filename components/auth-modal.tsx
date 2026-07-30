'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Lock, User, Sparkles, Check, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AuthMode = 'login' | 'signup'

export interface RegisteredUser {
  name: string
  email: string
  password?: string
  travelStyle?: string
  createdAt?: string
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
  onLoginSuccess?: (user: RegisteredUser) => void
}

// LocalStorage User Database & Server Backup Helpers
export const getStoredUsers = (): RegisteredUser[] => {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem('jeonju_users') || localStorage.getItem('jeonju_users_backup')
    if (data) {
      return JSON.parse(data)
    }
    // 기본 테스트용 가입 계정 미리 등록
    const defaultUsers: RegisteredUser[] = [
      {
        name: '전주여행자',
        email: 'test@jeonju.com',
        password: 'password123',
        travelStyle: 'P',
        createdAt: '2026-07-30T10:00:00.000Z',
      },
    ]
    localStorage.setItem('jeonju_users', JSON.stringify(defaultUsers))
    localStorage.setItem('jeonju_users_backup', JSON.stringify(defaultUsers))
    return defaultUsers
  } catch (e) {
    return []
  }
}

export const saveStoredUsers = (users: RegisteredUser[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('jeonju_users', JSON.stringify(users))
    localStorage.setItem('jeonju_users_backup', JSON.stringify(users))

    // 🛡️ 서버 파일 백업 API 전송 (브라우저 탭/화면이 꺼지더라도 100% 보존)
    fetch('/api/admin/backup-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    }).catch(() => {})

    // 🛡️ Vercel 프로덕션 전역 동기화 전송
    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'SYNC_ALL_USERS', payload: users }),
    }).catch(() => {})
  } catch (e) {}
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Signup form state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [travelStyle, setTravelStyle] = useState('P') // P: 즉흥형, J: 계획형
  const [agreeTerms, setAgreeTerms] = useState(true)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setMode(initialMode)
    setErrorMessage('')
    setSuccessMessage('')
  }, [initialMode, isOpen])

  if (!isOpen) return null

  // LOGIN SUBMIT (실제 저장된 회원 DB 검증)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const emailTrimmed = loginEmail.trim().toLowerCase()

    if (!emailTrimmed) {
      setErrorMessage('이메일을 입력해 주세요.')
      return
    }
    if (!loginPassword) {
      setErrorMessage('비밀번호를 입력해 주세요.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)

      const users = getStoredUsers()
      const registeredUser = users.find(
        (u) => u.email.toLowerCase() === emailTrimmed
      )

      if (!registeredUser) {
        setErrorMessage('가입되지 않은 이메일 주소입니다. 먼저 회원가입을 진행해 주세요.')
        return
      }

      if (registeredUser.password !== loginPassword) {
        setErrorMessage('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.')
        return
      }

      // 로그인 성공 처리 & 세션 저장
      const sessionUser: RegisteredUser = {
        name: registeredUser.name,
        email: registeredUser.email,
        travelStyle: registeredUser.travelStyle,
      }

      try {
        localStorage.setItem('jeonju_current_user', JSON.stringify(sessionUser))
      } catch (e) {}

      setSuccessMessage(`${sessionUser.name}님, 정상적으로 로그인되었습니다!`)
      if (onLoginSuccess) {
        onLoginSuccess(sessionUser)
      }

      setTimeout(() => {
        setSuccessMessage('')
        onClose()
      }, 900)
    }, 600)
  }

  // SIGNUP SUBMIT (회원 정보 신규 저장)
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const nameTrimmed = signupName.trim()
    const emailTrimmed = signupEmail.trim().toLowerCase()

    if (!nameTrimmed) {
      setErrorMessage('이름/닉네임을 입력해 주세요.')
      return
    }
    if (!emailTrimmed) {
      setErrorMessage('이메일 주소를 입력해 주세요.')
      return
    }
    if (signupPassword.length < 6) {
      setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.')
      return
    }
    if (!agreeTerms) {
      setErrorMessage('이용약관 및 개인정보 처리방침에 동의해 주세요.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)

      const users = getStoredUsers()
      const isDuplicate = users.some(
        (u) => u.email.toLowerCase() === emailTrimmed
      )

      if (isDuplicate) {
        setErrorMessage('이미 가입된 이메일 주소입니다. 해당 이메일로 로그인해 주세요.')
        return
      }

      // 신규 회원 정보 생성 및 저장
      const newUser: RegisteredUser = {
        name: nameTrimmed,
        email: emailTrimmed,
        password: signupPassword,
        travelStyle,
        createdAt: new Date().toISOString(),
      }

      const updatedUsers = [...users, newUser]
      saveStoredUsers(updatedUsers)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('jeonju_user_registered'))
      }

      // 로그인 세션 즉시 적용
      const sessionUser: RegisteredUser = {
        name: newUser.name,
        email: newUser.email,
        travelStyle: newUser.travelStyle,
      }
      try {
        localStorage.setItem('jeonju_current_user', JSON.stringify(sessionUser))
      } catch (e) {}

      setSuccessMessage('회원가입이 완료되었습니다! 로그인 상태로 시작합니다.')
      if (onLoginSuccess) {
        onLoginSuccess(sessionUser)
      }

      setTimeout(() => {
        setSuccessMessage('')
        onClose()
      }, 1000)
    }, 700)
  }

  // SOCIAL LOGIN (소셜 간편 회원가입/로그인)
  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      const providerName = provider === 'kakao' ? '카카오' : '네이버'
      const socialUser: RegisteredUser = {
        name: `${providerName} 여행자`,
        email: `user_${Date.now().toString().slice(-4)}@${provider}.com`,
        travelStyle: 'P',
      }

      const users = getStoredUsers()
      saveStoredUsers([...users, socialUser])

      try {
        localStorage.setItem('jeonju_current_user', JSON.stringify(socialUser))
      } catch (e) {}

      setSuccessMessage(`${providerName} 계정으로 로그인되었습니다!`)
      if (onLoginSuccess) {
        onLoginSuccess(socialUser)
      }
      setTimeout(() => {
        setSuccessMessage('')
        onClose()
      }, 900)
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="닫기"
        >
          <X className="size-5" />
        </button>

        {/* Header Logo & Title */}
        <div className="text-center pt-2 pb-3">
          <div className="mx-auto mb-2 flex justify-center">
            <img
              src="/logo.png"
              alt="지금, 전주"
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {mode === 'login'
              ? '가입하신 이메일과 비밀번호로 로그인하세요'
              : '회원가입 후 나만의 맞춤 코스를 관리해 보세요'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setErrorMessage('')
            }}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setErrorMessage('')
            }}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Error / Success Messages */}
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200 leading-normal">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200 flex items-center gap-1.5 font-medium">
            <Check className="size-4 text-emerald-600 shrink-0" /> {successMessage}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이메일 주소
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="test@jeonju.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="비밀번호 입력 (기본: password123)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                로그인 상태 유지
              </label>
              <button
                type="button"
                onClick={() => {
                  alert('테스트 계정안내:\n이메일: test@jeonju.com\n비밀번호: password123\n\n또는 회원가입 탭에서 직접 가입하여 테스트하세요.')
                }}
                className="text-amber-700 font-medium hover:underline"
              >
                테스트 계정 안내
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold py-2.5 rounded-xl shadow-xs"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> 회원정보 확인 중...
                </span>
              ) : (
                '로그인'
              )}
            </Button>

            {/* Social Login Dividers */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">
                  또는 간편 로그인
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('kakao')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] py-2 text-xs font-semibold text-[#3C1E1E] transition-colors"
              >
                <span className="font-extrabold text-sm">💬</span> 카카오 로그인
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('naver')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#03CF5D] hover:bg-[#02b852] py-2 text-xs font-semibold text-white transition-colors"
              >
                <span className="font-extrabold text-sm">N</span> 네이버 로그인
              </button>
            </div>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이름 / 닉네임
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이메일 주소
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="myname@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="최소 6자 이상"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="비밀번호 재입력"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            </div>

            {/* 여행 성향 선택 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                여행 스타일 선택 (선택)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTravelStyle('P')}
                  className={`rounded-lg border p-2 text-left text-xs transition-all ${
                    travelStyle === 'P'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ⚡ 즉흥형 (MBTI - P)
                </button>
                <button
                  type="button"
                  onClick={() => setTravelStyle('J')}
                  className={`rounded-lg border p-2 text-left text-xs transition-all ${
                    travelStyle === 'J'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🗓️ 계획형 (MBTI - J)
                </button>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                [필수] 이용약관 및 개인정보 처리방침 동의
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold py-2.5 rounded-xl shadow-xs"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> 회원정보 저장 중...
                </span>
              ) : (
                '회원가입 완료'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
