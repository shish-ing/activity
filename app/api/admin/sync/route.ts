import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Vercel 서버리스 & 로컬 겸용 전역 인메모리 & 파일 동기화 스토어
interface GlobalSyncStore {
  users: any[]
  reviews: any[]
  placeStatuses: Record<string, { isClosed: boolean; status: 'active' | 'review' | 'inactive' }>
  reports: any[]
  adminAccounts: any[]
}

const DEFAULT_SUPER_ADMIN = {
  id: 'admin_super_1',
  name: '총괄 슈퍼 관리자',
  email: 'ish30293029@gmail.com',
  password: '4640lsh',
  role: 'super',
  status: 'approved',
  createdAt: '2026-07-30 17:00',
}

// 글로벌 전역 변수로 서버 인스턴스 메모리 상시 유지
let globalStore: GlobalSyncStore = {
  users: [
    {
      name: '전주여행자',
      email: 'test@jeonju.com',
      password: 'password123',
      travelStyle: 'P',
      createdAt: '2026-07-30T10:00:00.000Z',
    },
  ],
  reviews: [],
  placeStatuses: {},
  reports: [],
  adminAccounts: [DEFAULT_SUPER_ADMIN],
}

// 🟢 GET: Vercel 프로덕션 전역 동기화 데이터 읽기
export async function GET() {
  return NextResponse.json({
    success: true,
    data: globalStore,
  })
}

// 🟢 POST: 소비자 프론트 ↔ 관리자 콘솔 양방향 실시간 동기화 업데이트
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, payload } = body

    if (type === 'REGISTER_USER' && payload) {
      const emailLower = payload.email.toLowerCase()
      if (!globalStore.users.some((u) => u.email && u.email.toLowerCase() === emailLower)) {
        globalStore.users.unshift(payload)
      }
    } else if (type === 'SYNC_ALL_USERS' && Array.isArray(payload)) {
      const map = new Map<string, any>()
      globalStore.users.forEach((u) => u.email && map.set(u.email.toLowerCase(), u))
      payload.forEach((u) => u.email && map.set(u.email.toLowerCase(), u))
      globalStore.users = Array.from(map.values())
    } else if (type === 'DELETE_USER' && payload?.email) {
      globalStore.users = globalStore.users.filter(
        (u) => u.email && u.email.toLowerCase() !== payload.email.toLowerCase()
      )
    } else if (type === 'SUBMIT_REPORT' && payload) {
      if (!globalStore.reports.some((r) => r.id === payload.id)) {
        globalStore.reports.unshift(payload)
      }
    } else if (type === 'UPDATE_REPORT_STATUS' && payload) {
      globalStore.reports = globalStore.reports.map((r) =>
        r.id === payload.id ? { ...r, status: payload.status } : r
      )
    } else if (type === 'DELETE_REPORT' && payload?.id) {
      globalStore.reports = globalStore.reports.filter((r) => r.id !== payload.id)
    } else if (type === 'SET_PLACE_STATUS' && payload) {
      const { placeName, isClosed, status } = payload
      globalStore.placeStatuses[placeName] = { isClosed, status }
    } else if (type === 'REGISTER_ADMIN' && payload) {
      const emailLower = payload.email.toLowerCase()
      if (!globalStore.adminAccounts.some((a) => a.email.toLowerCase() === emailLower)) {
        globalStore.adminAccounts.push(payload)
      }
    } else if (type === 'UPDATE_ADMIN_STATUS' && payload) {
      globalStore.adminAccounts = globalStore.adminAccounts.map((a) =>
        a.email.toLowerCase() === payload.email.toLowerCase() ? { ...a, status: payload.status } : a
      )
    } else if (type === 'DELETE_ADMIN' && payload?.email) {
      globalStore.adminAccounts = globalStore.adminAccounts.filter(
        (a) => a.email.toLowerCase() !== payload.email.toLowerCase() || a.role === 'super'
      )
    } else if (type === 'ADD_REVIEW' && payload) {
      globalStore.reviews.unshift(payload)
    }

    return NextResponse.json({
      success: true,
      data: globalStore,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
