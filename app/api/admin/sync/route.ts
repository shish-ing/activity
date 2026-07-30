import { NextResponse } from 'next/server'
import { getSql, initDatabaseSchema } from '@/lib/db'

// 전 세계 모든 PC / 모바일 기기 간 100% 실시간 연동을 위한 클라우드 영구 DB 버킷
const CLOUD_DB_URL = 'https://jsonblob.com/api/jsonBlob/019fb22a-6968-781f-ac1b-e6fa90602655'

const DEFAULT_SUPER_ADMIN = {
  id: 'admin_super_1',
  name: '총괄 슈퍼 관리자',
  email: 'ish30293029@gmail.com',
  password: '4640lsh',
  role: 'super',
  status: 'approved',
  createdAt: '2026-07-30 17:00',
}

let memoryStore: {
  users: any[]
  reviews: any[]
  placeStatuses: Record<string, { isClosed: boolean; status: 'active' | 'review' | 'inactive' }>
  reports: any[]
  adminAccounts: any[]
} = {
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

// 🟢 클라우드 영구 DB에서 동기화 데이터 읽기
async function fetchCloudDbData() {
  try {
    const res = await fetch(CLOUD_DB_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      if (data && typeof data === 'object') {
        memoryStore = {
          users: Array.isArray(data.users) ? data.users : memoryStore.users,
          reviews: Array.isArray(data.reviews) ? data.reviews : memoryStore.reviews,
          placeStatuses: data.placeStatuses || memoryStore.placeStatuses,
          reports: Array.isArray(data.reports) ? data.reports : memoryStore.reports,
          adminAccounts: Array.isArray(data.adminAccounts) ? data.adminAccounts : memoryStore.adminAccounts,
        }
      }
    }
  } catch (e) {
    console.error('Cloud DB fetch error:', e)
  }
  return memoryStore
}

// 🟢 클라우드 영구 DB로 실시간 데이터 업데이트 저장
async function saveCloudDbData(data: typeof memoryStore) {
  try {
    await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (e) {
    console.error('Cloud DB save error:', e)
  }
}

// 🟢 GET: Neon DB 또는 전세계 클라우드 영구 DB 동기화 데이터 읽기
export async function GET() {
  const sql = getSql()

  if (sql) {
    try {
      await initDatabaseSchema()

      const usersDb = await sql`SELECT id, name, email, password, travel_style AS "travelStyle", created_at AS "createdAt" FROM users ORDER BY created_at DESC;`
      const reportsDb = await sql`SELECT id, place_name AS "placeName", report_type AS "reportType", content, status, created_at AS "createdAt" FROM user_reports ORDER BY created_at DESC;`
      const adminAccountsDb = await sql`SELECT id, name, email, password, role, status, created_at AS "createdAt" FROM admin_accounts ORDER BY created_at ASC;`
      const placeStatusesDb = await sql`SELECT place_name AS "placeName", is_closed AS "isClosed", status FROM place_statuses;`
      const reviewsDb = await sql`SELECT id, place_name AS "placeName", user_name AS "userName", user_email AS "userEmail", weather_score AS "weatherScore", fun_score AS "funScore", comment, created_at AS "createdAt" FROM user_reviews ORDER BY created_at DESC;`

      const placeStatusesMap: Record<string, { isClosed: boolean; status: 'active' | 'review' | 'inactive' }> = {}
      placeStatusesDb.forEach((row: any) => {
        placeStatusesMap[row.placeName] = { isClosed: row.isClosed, status: row.status }
      })

      return NextResponse.json({
        success: true,
        source: 'NeonDB',
        data: {
          users: usersDb,
          reports: reportsDb,
          adminAccounts: adminAccountsDb,
          placeStatuses: placeStatusesMap,
          reviews: reviewsDb,
        },
      })
    } catch (e: any) {
      console.error('Neon DB GET Error, falling back to Cloud DB:', e)
    }
  }

  const cloudData = await fetchCloudDbData()
  return NextResponse.json({
    success: true,
    source: 'CloudDatabase',
    data: cloudData,
  })
}

// 🟢 POST: 실시간 클라우드 DB & Neon DB 양방향 동기화
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, payload } = body
    const sql = getSql()

    await fetchCloudDbData()

    if (type === 'REGISTER_USER' && payload) {
      const emailLower = payload.email.toLowerCase()
      if (!memoryStore.users.some((u) => u.email && u.email.toLowerCase() === emailLower)) {
        memoryStore.users.unshift(payload)
      }
    } else if (type === 'SYNC_ALL_USERS' && Array.isArray(payload)) {
      const map = new Map<string, any>()
      memoryStore.users.forEach((u) => u.email && map.set(u.email.toLowerCase(), u))
      payload.forEach((u) => u.email && map.set(u.email.toLowerCase(), u))
      memoryStore.users = Array.from(map.values())
    } else if (type === 'DELETE_USER' && payload?.email) {
      memoryStore.users = memoryStore.users.filter(
        (u) => u.email && u.email.toLowerCase() !== payload.email.toLowerCase()
      )
    } else if (type === 'SUBMIT_REPORT' && payload) {
      if (!memoryStore.reports.some((r) => r.id === payload.id)) {
        memoryStore.reports.unshift(payload)
      }
    } else if (type === 'UPDATE_REPORT_STATUS' && payload) {
      memoryStore.reports = memoryStore.reports.map((r) =>
        r.id === payload.id ? { ...r, status: payload.status } : r
      )
    } else if (type === 'DELETE_REPORT' && payload?.id) {
      memoryStore.reports = memoryStore.reports.filter((r) => r.id !== payload.id)
    } else if (type === 'SET_PLACE_STATUS' && payload) {
      memoryStore.placeStatuses[payload.placeName] = { isClosed: payload.isClosed, status: payload.status }
    } else if (type === 'REGISTER_ADMIN' && payload) {
      const emailLower = payload.email.toLowerCase()
      if (!memoryStore.adminAccounts.some((a) => a.email.toLowerCase() === emailLower)) {
        memoryStore.adminAccounts.push(payload)
      }
    } else if (type === 'UPDATE_ADMIN_STATUS' && payload) {
      memoryStore.adminAccounts = memoryStore.adminAccounts.map((a) =>
        a.email.toLowerCase() === payload.email.toLowerCase() ? { ...a, status: payload.status } : a
      )
    } else if (type === 'DELETE_ADMIN' && payload?.email) {
      memoryStore.adminAccounts = memoryStore.adminAccounts.filter(
        (a) => a.email.toLowerCase() !== payload.email.toLowerCase() || a.role === 'super'
      )
    }

    // 클라우드 DB에 즉각 갱신 저장
    await saveCloudDbData(memoryStore)

    if (sql) {
      try {
        await initDatabaseSchema()

        if (type === 'REGISTER_USER' && payload) {
          await sql`
            INSERT INTO users (id, name, email, password, travel_style, created_at)
            VALUES (${payload.id || 'usr_' + Date.now()}, ${payload.name}, ${payload.email.toLowerCase()}, ${payload.password || '1234'}, ${payload.travelStyle || 'P'}, ${payload.createdAt || new Date().toISOString()})
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, travel_style = EXCLUDED.travel_style;
          `
        } else if (type === 'SYNC_ALL_USERS' && Array.isArray(payload)) {
          for (const u of payload) {
            if (u.email) {
              await sql`
                INSERT INTO users (id, name, email, password, travel_style, created_at)
                VALUES (${u.id || 'usr_' + Date.now()}, ${u.name || '회원'}, ${u.email.toLowerCase()}, ${u.password || '1234'}, ${u.travelStyle || 'P'}, ${u.createdAt || new Date().toISOString()})
                ON CONFLICT (email) DO NOTHING;
              `
            }
          }
        } else if (type === 'DELETE_USER' && payload?.email) {
          await sql`DELETE FROM users WHERE LOWER(email) = LOWER(${payload.email});`
        } else if (type === 'SUBMIT_REPORT' && payload) {
          await sql`
            INSERT INTO user_reports (id, place_name, report_type, content, status, created_at)
            VALUES (${payload.id || 'rep_' + Date.now()}, ${payload.placeName}, ${payload.reportType}, ${payload.content}, ${payload.status || 'pending'}, ${payload.createdAt || new Date().toISOString()})
            ON CONFLICT (id) DO NOTHING;
          `
        } else if (type === 'UPDATE_REPORT_STATUS' && payload) {
          await sql`UPDATE user_reports SET status = ${payload.status} WHERE id = ${payload.id};`
        } else if (type === 'DELETE_REPORT' && payload?.id) {
          await sql`DELETE FROM user_reports WHERE id = ${payload.id};`
        } else if (type === 'SET_PLACE_STATUS' && payload) {
          await sql`
            INSERT INTO place_statuses (place_name, is_closed, status, updated_at)
            VALUES (${payload.placeName}, ${payload.isClosed}, ${payload.status || 'active'}, ${new Date().toISOString()})
            ON CONFLICT (place_name) DO UPDATE SET is_closed = EXCLUDED.is_closed, status = EXCLUDED.status, updated_at = EXCLUDED.updated_at;
          `
        } else if (type === 'REGISTER_ADMIN' && payload) {
          await sql`
            INSERT INTO admin_accounts (id, name, email, password, role, status, created_at)
            VALUES (${payload.id || 'adm_' + Date.now()}, ${payload.name}, ${payload.email.toLowerCase()}, ${payload.password}, ${payload.role || 'admin'}, ${payload.status || 'pending'}, ${payload.createdAt || new Date().toISOString()})
            ON CONFLICT (email) DO NOTHING;
          `
        } else if (type === 'UPDATE_ADMIN_STATUS' && payload) {
          await sql`UPDATE admin_accounts SET status = ${payload.status} WHERE LOWER(email) = LOWER(${payload.email});`
        } else if (type === 'DELETE_ADMIN' && payload?.email) {
          await sql`DELETE FROM admin_accounts WHERE LOWER(email) = LOWER(${payload.email}) AND role != 'super';`
        }
      } catch (dbErr) {
        console.error('Neon DB POST Error:', dbErr)
      }
    }

    return NextResponse.json({ success: true, source: 'CloudDatabase', data: memoryStore })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
