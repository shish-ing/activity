import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const STATUSES_FILE_PATH = path.join(process.cwd(), 'data', 'admin-place-statuses-backup.json')
const CUSTOM_FILE_PATH = path.join(process.cwd(), 'data', 'admin-custom-places-backup.json')

function ensureStatusesFileExists(): Record<string, any> {
  try {
    const dir = path.dirname(STATUSES_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(STATUSES_FILE_PATH)) {
      fs.writeFileSync(STATUSES_FILE_PATH, '{}', 'utf-8')
      return {}
    }
    const content = fs.readFileSync(STATUSES_FILE_PATH, 'utf-8')
    return content ? JSON.parse(content) : {}
  } catch (e) {
    return {}
  }
}

function ensureCustomFileExists(): any[] {
  try {
    const dir = path.dirname(CUSTOM_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(CUSTOM_FILE_PATH)) {
      fs.writeFileSync(CUSTOM_FILE_PATH, '[]', 'utf-8')
      return []
    }
    const content = fs.readFileSync(CUSTOM_FILE_PATH, 'utf-8')
    return content ? JSON.parse(content) : []
  } catch (e) {
    return []
  }
}

// 🟢 GET: 깃 저장소 백업 장소 정보 및 대표 사진 읽기
export async function GET() {
  const statuses = ensureStatusesFileExists()
  const customPlaces = ensureCustomFileExists()
  return NextResponse.json({ success: true, statuses, customPlaces })
}

// 🟢 POST: 장소 대표사진, 영업시간, 신규장소 백업 파일에 영구 저장 (Git 커밋 푸시 및 Vercel 배포 시 영구 유지)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { statuses, customPlaces } = body

    if (statuses && typeof statuses === 'object') {
      const currentStatuses = ensureStatusesFileExists()
      const mergedStatuses = { ...currentStatuses, ...statuses }
      fs.writeFileSync(STATUSES_FILE_PATH, JSON.stringify(mergedStatuses, null, 2), 'utf-8')
    }

    if (customPlaces && Array.isArray(customPlaces)) {
      const currentCustom = ensureCustomFileExists()
      const customMap = new Map<string, any>()
      currentCustom.forEach((p: any) => p.name && customMap.set(p.name, p))
      customPlaces.forEach((p: any) => p.name && customMap.set(p.name, p))
      const mergedCustom = Array.from(customMap.values())
      fs.writeFileSync(CUSTOM_FILE_PATH, JSON.stringify(mergedCustom, null, 2), 'utf-8')
    }

    return NextResponse.json({
      success: true,
      message: '장소 대표 사진, 영업시간 및 신규 장소가 프로젝트 깃 저장소 파일에 백업 저장되었습니다.',
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || '저장 오류' }, { status: 500 })
  }
}
