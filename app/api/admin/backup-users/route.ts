import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BACKUP_FILE_PATH = path.join(process.cwd(), 'data', 'registered-users-backup.json')

// 백업 디렉토리 및 파일 확보
function ensureBackupFileExists(): any[] {
  try {
    const dir = path.dirname(BACKUP_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(BACKUP_FILE_PATH)) {
      const defaultSeed = [
        {
          name: '전주여행자',
          email: 'test@jeonju.com',
          password: 'password123',
          travelStyle: 'P',
          createdAt: new Date().toISOString(),
        },
      ]
      fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify(defaultSeed, null, 2), 'utf-8')
      return defaultSeed
    }
    const content = fs.readFileSync(BACKUP_FILE_PATH, 'utf-8')
    return content ? JSON.parse(content) : []
  } catch (e) {
    return []
  }
}

// 🟢 GET: 백업된 모든 가입자 회원 목록 반환
export async function GET() {
  const users = ensureBackupFileExists()
  return NextResponse.json({ success: true, users })
}

// 🟢 POST: 신규 회원가입 유저 백업 파일 저장 및 병합
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const currentUsers = ensureBackupFileExists()

    const usersToSave = Array.isArray(body.users)
      ? body.users
      : body.user
      ? [body.user]
      : []

    if (usersToSave.length === 0) {
      return NextResponse.json({ success: false, message: '저장할 회원 정보가 없습니다.' }, { status: 400 })
    }

    // 이메일 중복 제거 병합
    const userMap = new Map<string, any>()
    currentUsers.forEach((u: any) => {
      if (u.email) userMap.set(u.email.toLowerCase(), u)
    })
    usersToSave.forEach((u: any) => {
      if (u.email) userMap.set(u.email.toLowerCase(), u)
    })

    const updatedUsers = Array.from(userMap.values())
    fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify(updatedUsers, null, 2), 'utf-8')

    return NextResponse.json({ success: true, count: updatedUsers.length, users: updatedUsers })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 🟢 DELETE: 회원 탈퇴 시 백업 파일에서 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    if (!email) {
      return NextResponse.json({ success: false, message: 'email 파라미터가 필요합니다.' }, { status: 400 })
    }

    const currentUsers = ensureBackupFileExists()
    const filtered = currentUsers.filter(
      (u) => u.email && u.email.toLowerCase() !== email.toLowerCase()
    )

    fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8')
    return NextResponse.json({ success: true, users: filtered })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
