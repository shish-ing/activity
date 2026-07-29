import { CloudRain, Clock, Wallet } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { ConditionForm } from '@/components/condition-form'

export default function HomePage() {
  return (
    <main className="min-h-svh">
      <SiteHeader />

      <div className="mx-auto w-full max-w-xl px-4 pb-16">
        {/* Hero */}
        <section className="pt-8 pb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-foreground">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            전주 즉흥 여행자를 위한 실시간 추천
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            지금 내 위치, 지금 날씨로
            <br />
            뭘 할지 바로 정해요
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            계획 없이 떠난 전주. 최소한의 입력만 하면 지금 할 활동과 이동
            순서를 한눈에 보여드려요.
          </p>

          <ul className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-accent" /> 남은 시간 기준
            </li>
            <li className="flex items-center gap-1.5">
              <CloudRain className="size-3.5 text-accent" /> 실시간 날씨 반영
            </li>
            <li className="flex items-center gap-1.5">
              <Wallet className="size-3.5 text-accent" /> 예산 맞춤
            </li>
          </ul>
        </section>

        <ConditionForm />
      </div>
    </main>
  )
}
