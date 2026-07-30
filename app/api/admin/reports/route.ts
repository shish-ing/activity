import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const REPORTS_FILE_PATH = path.join(process.cwd(), 'data', 'user-reports-backup.json')

function ensureReportsFileExists(): any[] {
  try {
    const dir = path.dirname(REPORTS_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(REPORTS_FILE_PATH)) {
      fs.writeFileSync(REPORTS_FILE_PATH, JSON.stringify([], null, 2), 'utf-8')
      return []
    }
    const content = fs.readFileSync(REPORTS_FILE_PATH, 'utf-8')
    return content ? JSON.parse(content) : []
  } catch (e) {
    return []
  }
}

// 🟢 GET: 서버에 백업된 사용자 오류 신고 목록 가져오기
export async function GET() {
  const reports = ensureReportsFileExists()
  return NextResponse.json({ success: true, reports })
}

// 🟢 POST: 실사용자 오류 신고 등록
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const currentReports = ensureReportsFileExists()

    const newReport = {
      id: body.id || `rep_${Date.now()}`,
      placeName: body.placeName || '미지정 장소',
      reportType: body.reportType || '정보 오류',
      content: body.content || '',
      createdAt: body.createdAt || new Date().toISOString(),
      status: body.status || 'pending',
    }

    const updated = [newReport, ...currentReports.filter((r) => r.id !== newReport.id)]
    fs.writeFileSync(REPORTS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8')

    return NextResponse.json({ success: true, report: newReport, reports: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 🟢 PUT: 신고 상태 수정 (pending ➔ processing ➔ resolved)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    const currentReports = ensureReportsFileExists()
    const updated = currentReports.map((r) => (r.id === id ? { ...r, status } : r))

    fs.writeFileSync(REPORTS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8')
    return NextResponse.json({ success: true, reports: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 🟢 DELETE: 신고 항목 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'id 파라미터가 필요합니다.' }, { status: 400 })
    }

    const currentReports = ensureReportsFileExists()
    const filtered = currentReports.filter((r) => r.id !== id)

    fs.writeFileSync(REPORTS_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8')
    return NextResponse.json({ success: true, reports: filtered })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
