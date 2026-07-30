import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ADMIN_BACKUP_FILE = path.join(process.cwd(), 'data', 'admin-accounts-backup.json')

const DEFAULT_SUPER_ADMIN = {
  id: 'admin_super_1',
  name: '총괄 슈퍼 관리자',
  email: 'ish30293029@gmail.com',
  password: '4640lsh',
  role: 'super',
  status: 'approved',
  createdAt: '2026-07-30 17:00',
}

function ensureAdminBackupFile(): any[] {
  try {
    const dir = path.dirname(ADMIN_BACKUP_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(ADMIN_BACKUP_FILE)) {
      fs.writeFileSync(ADMIN_BACKUP_FILE, JSON.stringify([DEFAULT_SUPER_ADMIN], null, 2), 'utf-8')
      return [DEFAULT_SUPER_ADMIN]
    }
    const content = fs.readFileSync(ADMIN_BACKUP_FILE, 'utf-8')
    const list = content ? JSON.parse(content) : []
    if (!list.some((a: any) => a.email && a.email.toLowerCase() === DEFAULT_SUPER_ADMIN.email.toLowerCase())) {
      list.unshift(DEFAULT_SUPER_ADMIN)
      fs.writeFileSync(ADMIN_BACKUP_FILE, JSON.stringify(list, null, 2), 'utf-8')
    }
    return list
  } catch (e) {
    return [DEFAULT_SUPER_ADMIN]
  }
}

// 🟢 GET: 백업된 관리자 계정 목록 가져오기
export async function GET() {
  const accounts = ensureAdminBackupFile()
  return NextResponse.json({ success: true, accounts })
}

// 🟢 POST: 신규 관리자 신청 또는 상태 변경 (승인/거절) 저장
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const current = ensureAdminBackupFile()

    const { action, account, email, status } = body

    if (action === 'register' && account) {
      const emailLower = account.email.toLowerCase()
      if (current.some((a) => a.email.toLowerCase() === emailLower)) {
        return NextResponse.json({ success: false, message: '이미 가입 신청된 관리자 이메일입니다.' }, { status: 400 })
      }
      const newAcc = {
        id: `admin_${Date.now()}`,
        name: account.name,
        email: emailLower,
        password: account.password,
        role: 'admin',
        status: 'pending', // 기본 승인 대기중!
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      }
      const updated = [...current, newAcc]
      fs.writeFileSync(ADMIN_BACKUP_FILE, JSON.stringify(updated, null, 2), 'utf-8')
      return NextResponse.json({ success: true, account: newAcc, accounts: updated })
    }

    if (action === 'updateStatus' && email && status) {
      const updated = current.map((a) => {
        if (a.email.toLowerCase() === email.toLowerCase()) {
          return { ...a, status }
        }
        return a
      })
      fs.writeFileSync(ADMIN_BACKUP_FILE, JSON.stringify(updated, null, 2), 'utf-8')
      return NextResponse.json({ success: true, accounts: updated })
    }

    if (action === 'saveAll' && body.accounts) {
      fs.writeFileSync(ADMIN_BACKUP_FILE, JSON.stringify(body.accounts, null, 2), 'utf-8')
      return NextResponse.json({ success: true, accounts: body.accounts })
    }

    return NextResponse.json({ success: false, message: '알 수 없는 요청입니다.' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 🟢 DELETE: 관리자 계정 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    if (!email) {
      return NextResponse.json({ success: false, message: 'email 파라미터가 필요합니다.' }, { status: 400 })
    }

    const current = ensureAdminBackupFile()
    const filtered = current.filter(
      (a) => a.email.toLowerCase() !== email.toLowerCase() || a.role === 'super' // 슈퍼 관리자는 삭제 불가
    )
    fs.writeFileSync(ADMIN_BACKUP_FILE, JSON.stringify(filtered, null, 2), 'utf-8')
    return NextResponse.json({ success: true, accounts: filtered })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
