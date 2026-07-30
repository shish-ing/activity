// ---------------------------------------------------------------------------
// 전주 여행 P들 어디가 — 관리자 로그인 & 회원가입 승인 처리 모듈
// ---------------------------------------------------------------------------

export interface AdminAccount {
  id: string
  name: string
  email: string
  password: string
  role: 'super' | 'admin'
  status: 'approved' | 'pending' | 'rejected'
  createdAt: string
}

// 🔑 요청받은 최초 총괄 슈퍼 관리자 계정 정보
export const INITIAL_SUPER_ADMIN: AdminAccount = {
  id: 'admin_super_1',
  name: '총괄 슈퍼 관리자',
  email: 'ish30293029@gmail.com',
  password: '4640lsh',
  role: 'super',
  status: 'approved',
  createdAt: '2026-07-30 17:00',
}

// 1. 등록된 관리자 계정 목록 읽기 (로컬 + 서버 영구 백업 동기화)
export const getAdminAccounts = (): AdminAccount[] => {
  if (typeof window === 'undefined') return [INITIAL_SUPER_ADMIN]
  try {
    const data = localStorage.getItem('jeonju_admin_accounts')
    let list: AdminAccount[] = data ? JSON.parse(data) : []

    // 슈퍼 관리자 존재 보장
    if (!list.some((a) => a.email.toLowerCase() === INITIAL_SUPER_ADMIN.email.toLowerCase())) {
      list.unshift(INITIAL_SUPER_ADMIN)
      localStorage.setItem('jeonju_admin_accounts', JSON.stringify(list))
    }

    // 서버 파일 백업 동기화
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.accounts)) {
          if (resData.accounts.length > list.length) {
            localStorage.setItem('jeonju_admin_accounts', JSON.stringify(resData.accounts))
            window.dispatchEvent(new Event('jeonju_admin_auth_changed'))
          }
        }
      })
      .catch(() => {})

    return list
  } catch (e) {
    return [INITIAL_SUPER_ADMIN]
  }
}

// 2. 신규 관리자 회원가입 신청 (기본 status = 'pending' 승인 대기중)
export const registerAdminAccount = (account: {
  name: string
  email: string
  password: string
}): { success: boolean; message: string } => {
  if (typeof window === 'undefined') return { success: false, message: '서버 환경입니다.' }
  try {
    const accounts = getAdminAccounts()
    const emailLower = account.email.trim().toLowerCase()

    if (accounts.some((a) => a.email.toLowerCase() === emailLower)) {
      return { success: false, message: '이미 가입 신청되어 있거나 등록된 관리자 이메일입니다.' }
    }

    const newAdmin: AdminAccount = {
      id: `admin_${Date.now()}`,
      name: account.name.trim(),
      email: emailLower,
      password: account.password,
      role: 'admin',
      status: 'pending', // 🔍 기존 관리자의 승인이 반드시 필요함!
      createdAt: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    const updated = [...accounts, newAdmin]
    localStorage.setItem('jeonju_admin_accounts', JSON.stringify(updated))
    window.dispatchEvent(new Event('jeonju_admin_auth_changed'))

    // 서버 파일 영구 백업 전송 & Vercel 글로벌 동기화
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', account: newAdmin }),
    }).catch(() => {})

    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'REGISTER_ADMIN', payload: newAdmin }),
    }).catch(() => {})

    return {
      success: true,
      message: '관리자 가입 신청이 완료되었습니다. 총괄 관리자(ish30293029@gmail.com) 승인 후 로그인하실 수 있습니다.',
    }
  } catch (e: any) {
    return { success: false, message: e.message || '가입 신청 중 오류가 발생했습니다.' }
  }
}

// 3. 기존 승인된 관리자가 신규 관리자 신청 승인/거절 처리
export const updateAdminAccountStatus = (
  email: string,
  status: 'approved' | 'rejected'
) => {
  if (typeof window === 'undefined') return
  try {
    const accounts = getAdminAccounts()
    const updated = accounts.map((a) => {
      if (a.email.toLowerCase() === email.toLowerCase()) {
        return { ...a, status }
      }
      return a
    })

    localStorage.setItem('jeonju_admin_accounts', JSON.stringify(updated))
    window.dispatchEvent(new Event('jeonju_admin_auth_changed'))

    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateStatus', email, status }),
    }).catch(() => {})

    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'UPDATE_ADMIN_STATUS', payload: { email, status } }),
    }).catch(() => {})
  } catch (e) {}
}

// 4. 관리자 계정 삭제
export const deleteAdminAccount = (email: string) => {
  if (typeof window === 'undefined') return
  try {
    const accounts = getAdminAccounts()
    const updated = accounts.filter(
      (a) => a.email.toLowerCase() !== email.toLowerCase() || a.role === 'super'
    )

    localStorage.setItem('jeonju_admin_accounts', JSON.stringify(updated))
    window.dispatchEvent(new Event('jeonju_admin_auth_changed'))

    fetch(`/api/admin/auth?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    }).catch(() => {})

    fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'DELETE_ADMIN', payload: { email } }),
    }).catch(() => {})
  } catch (e) {}
}

// 5. 현재 관리자 로그인 세션 관리
export const getAdminSession = (): AdminAccount | null => {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem('jeonju_admin_session')
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

export const setAdminSession = (account: AdminAccount | null) => {
  if (typeof window === 'undefined') return
  try {
    if (account) {
      localStorage.setItem('jeonju_admin_session', JSON.stringify(account))
    } else {
      localStorage.removeItem('jeonju_admin_session')
    }
    window.dispatchEvent(new Event('jeonju_admin_session_changed'))
  } catch (e) {}
}
