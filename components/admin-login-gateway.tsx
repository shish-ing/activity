'use client'

import { useState } from 'react'
import { Lock, Mail, User, Shield, CheckCircle2, AlertCircle, ArrowRight, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getAdminAccounts,
  registerAdminAccount,
  setAdminSession,
  type AdminAccount
} from '@/lib/admin-auth-storage'

interface AdminLoginGatewayProps {
  onLoginSuccess: (account: AdminAccount) => void
}

export function AdminLoginGateway({ onLoginSuccess }: AdminLoginGatewayProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')

  // 로그인 폼 State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // 회원가입 신청 폼 State
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 관리자 로그인 처리
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const emailTrim = loginEmail.trim().toLowerCase()
    if (!emailTrim || !loginPassword) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }

    const accounts = getAdminAccounts()
    const target = accounts.find((a) => a.email.toLowerCase() === emailTrim)

    if (!target || target.password !== loginPassword) {
      setErrorMessage('아이디(이메일) 또는 비밀번호가 일치하지 않습니다.')
      return
    }

    if (target.status === 'pending') {
      setErrorMessage(
        '🔍 승인 대기 중인 관리자 계정입니다. 총괄 관리자(ish30293029@gmail.com)의 승인 후 로그인이 가능합니다.'
      )
      return
    }

    if (target.status === 'rejected') {
      setErrorMessage('🔴 가입 신청이 거절된 관리자 계정입니다. 총괄 관리자에게 문의해 주세요.')
      return
    }

    // 승인된 계정 로그인 성공!
    setAdminSession(target)
    onLoginSuccess(target)
  }

  // 신규 관리자 가입 신청 처리 (status = 'pending')
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!signupName.trim()) {
      setErrorMessage('관리자 이름을 입력해 주세요.')
      return
    }
    if (!signupEmail.trim()) {
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

    const res = registerAdminAccount({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
    })

    if (res.success) {
      setSuccessMessage(res.message)
      setSignupName('')
      setSignupEmail('')
      setSignupPassword('')
      setSignupConfirmPassword('')
    } else {
      setErrorMessage(res.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* 상단 엠블럼 & 타이틀 */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500 text-amber-950 font-black text-2xl shadow-lg ring-4 ring-amber-500/20">
            🛡️
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-3">
            전주 여행 P들 어디가 — 관리자 센터
          </h1>
          <p className="text-xs text-slate-400">
            관리자 승인 시스템이 적용된 보안 콘솔 센터입니다.
          </p>
        </div>

        {/* 탭 네비게이션: 로그인 vs 가입 신청 */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-950 p-1 text-xs font-bold border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setTab('login')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className={`rounded-xl py-2.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-amber-500 text-amber-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="size-3.5" />
            <span>관리자 로그인</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('signup')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className={`rounded-xl py-2.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'signup'
                ? 'bg-amber-500 text-amber-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="size-3.5" />
            <span>신규 관리자 가입 신청</span>
          </button>
        </div>

        {/* 메세지 알림 바 */}
        {errorMessage && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs font-semibold text-red-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-300 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* FORM 1: 관리자 로그인 */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">관리자 이메일 (ID) *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="관리자 이메일을 입력하세요"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">비밀번호 *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400 font-extrabold text-sm gap-2 shadow-lg cursor-pointer mt-2"
            >
              <span>관리자 로그인</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>
        )}

        {/* FORM 2: 신규 관리자 가입 신청 (승인 필수) */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-300">관리자 성명 / 닉네임 *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="홍길동 관리자"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-300">관리자 이메일 *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="admin@jeonju.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">비밀번호 *</label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="6자 이상"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">비밀번호 확인 *</label>
                <input
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1">
                <span>💡 관리자 승인제 안내</span>
              </p>
              <p className="leading-relaxed">
                가입 신청 후 기존 총괄 슈퍼 관리자(ish30293029@gmail.com)가 관리자 콘솔에서 **[🟢 승인 완료]** 처리해야 로그인할 수 있습니다.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400 font-extrabold text-sm gap-2 shadow-lg cursor-pointer mt-2"
            >
              <span>관리자 가입 신청 제출</span>
              <Shield className="size-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
