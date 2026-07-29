import { SiteHeader } from '@/components/site-header'
import { ResultView } from '@/components/result-view'

export default function ResultPage() {
  return (
    <main className="min-h-svh">
      <SiteHeader showBack />
      <ResultView />
    </main>
  )
}
