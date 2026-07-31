import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR, Gowun_Batang } from 'next/font/google'
import './globals.css'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
})

const gowunBatang = Gowun_Batang({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-gowun-batang',
})

export const metadata: Metadata = {
  title: '지금, 전주 — 즉흥 여행자를 위한 실시간 추천',
  description:
    '지금 내 위치와 지금 날씨 기준으로, 뭘 할지 어떤 순서로 갈지 바로 보여드려요. 전주 즉흥 여행자를 위한 최소 입력 추천 서비스.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={`light bg-[#FAF4E6] ${notoSansKr.variable} ${gowunBatang.variable}`}
    >
      <head>
        <link rel="dns-prefetch" href="https://a.basemaps.cartocdn.com" />
        <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://router.project-osrm.org" />
        <link rel="preconnect" href="https://router.project-osrm.org" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="font-sans antialiased relative z-10 bg-gradient-to-b from-[#FFFDF8] via-[#FAF4E6] to-[#F5E7D3] min-h-screen text-[#2D221E]">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
