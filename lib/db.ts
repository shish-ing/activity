import { neon } from '@neondatabase/serverless'

// Neon DB 데이터베이스 연결 헬퍼 (DATABASE_URL / POSTGRES_URL / NEON_DATABASE_URL 자동 인식)
export const getSql = () => {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING

  if (!url) return null
  try {
    return neon(url)
  } catch (e) {
    console.error('Neon DB SQL Client Error:', e)
    return null
  }
}

// 🟢 DB 스키마 5개 테이블 자동 생성 및 초기화
export async function initDatabaseSchema() {
  const sql = getSql()
  if (!sql) {
    return { success: false, message: 'Neon DB 커넥션 URL이 설정되어 있지 않습니다.' }
  }

  try {
    // 1. 회원가입 사용자 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        travel_style VARCHAR(10) DEFAULT 'P',
        created_at TEXT NOT NULL
      );
    `

    // 2. 관리자 계정 & 승인 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id VARCHAR(100) PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TEXT NOT NULL
      );
    `

    // 3. 소비자 장소 정보 오류 신고 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS user_reports (
        id VARCHAR(100) PRIMARY KEY,
        place_name TEXT NOT NULL,
        report_type TEXT NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TEXT NOT NULL
      );
    `

    // 4. 장소별 영업중/휴업 및 활성화 상태 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS place_statuses (
        place_name TEXT PRIMARY KEY,
        is_closed BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'active',
        updated_at TEXT NOT NULL
      );
    `

    // 5. 장소별 사용자 작성 평점 및 후기 테이블
    await sql`
      CREATE TABLE IF NOT EXISTS user_reviews (
        id VARCHAR(100) PRIMARY KEY,
        place_name TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        weather_score NUMERIC DEFAULT 5.0,
        fun_score NUMERIC DEFAULT 5.0,
        comment TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );
    `

    // 최초 총괄 슈퍼 관리자 및 기본 회원 데이터 인서트 보장
    await sql`
      INSERT INTO admin_accounts (id, name, email, password, role, status, created_at)
      VALUES ('admin_super_1', '총괄 슈퍼 관리자', 'ish30293029@gmail.com', '4640lsh', 'super', 'approved', '2026-07-30 17:00')
      ON CONFLICT (email) DO NOTHING;
    `

    await sql`
      INSERT INTO users (id, name, email, password, travel_style, created_at)
      VALUES ('usr_seed_1', '전주여행자', 'test@jeonju.com', 'password123', 'P', '2026-07-30T10:00:00.000Z')
      ON CONFLICT (email) DO NOTHING;
    `

    return { success: true, message: 'Neon DB 테이블 5개 스키마 생성 및 초기화 완료!' }
  } catch (error: any) {
    console.error('Neon DB Init Error:', error)
    return { success: false, error: error.message }
  }
}
