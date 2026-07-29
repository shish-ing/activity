import { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import { ResultView } from '@/components/result-view'

export default function ResultPage() {
  return (
    <main className="min-h-svh">
      <SiteHeader showBack />
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-muted-foreground">
            네이버 지도를 바탕으로 최적 코스를 계산하는 중입니다...
          </div>
        }
      >
        <ResultView />
      </Suspense>
    </main>
  )
}
