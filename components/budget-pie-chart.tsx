'use client'

import { useMemo } from 'react'
import { PieChart as PieIcon, ShoppingBag, Utensils, Coffee, Ticket, Bus, Wallet } from 'lucide-react'

type BudgetCategory = {
  name: string
  amount: number
  color: string
  icon: any
  description: string
}

type BudgetPieChartProps = {
  userBudgetLimit: number
  totalPlaceCost: number
  transport: string // 'walk' | 'transit' | 'car'
}

function formatWon(val: number) {
  return `${val.toLocaleString('ko-KR')}원`
}

export function BudgetPieChart({
  userBudgetLimit,
  totalPlaceCost,
  transport,
}: BudgetPieChartProps) {
  // 예산 소진 비율 및 지출 카테고리 세부 내역 계산 (~75% ~ 85% 활용)
  const breakdownData = useMemo(() => {
    if (userBudgetLimit === 0) {
      return {
        targetSpent: 0,
        utilizationRate: 0,
        categories: [
          { name: '🍲 식비 (로컬 맛집)', amount: 0, percentage: 0, color: '#10b981', icon: Utensils, description: '자유 개별 식사' },
          { name: '🎟️ 관람 & 무료 명소', amount: 0, percentage: 0, color: '#f59e0b', icon: Ticket, description: '100% 무료 입장' },
          { name: '☕ 카페 & 수제 디저트', amount: 0, percentage: 0, color: '#06b6d4', icon: Coffee, description: '자유 차 마시기' },
          { name: '🛍️ 특산품 & 쇼핑', amount: 0, percentage: 0, color: '#a855f7', icon: ShoppingBag, description: '자유 구경' },
          { name: '🚌 교통 & 기타', amount: 0, percentage: 0, color: '#3b82f6', icon: Bus, description: '도보 0원' },
        ],
        minRange: 0,
        maxRange: 0,
        remainingSavings: 0,
      }
    }

    // 1. 목표 예산 사용률 (약 82% 소진)
    const targetSpent = Math.min(
      userBudgetLimit,
      Math.max(totalPlaceCost + 15000, Math.round(userBudgetLimit * 0.82)),
    )

    // 2. 교통비 추정 (도보 0원 / 대중교통 ~4,000원 / 자차 ~12,000원)
    const transportCost =
      transport === 'car' ? 12000 : transport === 'transit' ? 4500 : 0

    // 3. 남은 예산 카테고리 분배
    const remainingForActivities = Math.max(0, targetSpent - transportCost)

    const diningAmount = Math.round(remainingForActivities * 0.42)
    const activityAmount = Math.max(totalPlaceCost, Math.round(remainingForActivities * 0.28))
    const cafeAmount = Math.round(remainingForActivities * 0.18)
    const shoppingAmount = Math.max(0, remainingForActivities - diningAmount - activityAmount - cafeAmount)

    const totalCalculated = diningAmount + activityAmount + cafeAmount + shoppingAmount + transportCost
    const utilizationRate = Math.round((totalCalculated / userBudgetLimit) * 100)

    const minRange = Math.round(totalCalculated * 0.95)
    const maxRange = Math.round(totalCalculated * 1.05)

    const categories = [
      {
        name: '🍲 로컬 식비 (점심·저녁)',
        amount: diningAmount,
        percentage: Math.round((diningAmount / totalCalculated) * 100),
        color: '#10b981', // emerald
        icon: Utensils,
        description: '전주 3대 비빔밥, 떡갈비, 콩나물국밥 정식',
      },
      {
        name: '🎟️ 관람 & 체험료',
        amount: activityAmount,
        percentage: Math.round((activityAmount / totalCalculated) * 100),
        color: '#f59e0b', // amber
        icon: Ticket,
        description: '한지/도자기/부채 공방, 전주 난장, 어진박물관 등',
      },
      {
        name: '☕ 카페 & 전통 찻집',
        amount: cafeAmount,
        percentage: Math.round((cafeAmount / totalCalculated) * 100),
        color: '#06b6d4', // cyan
        icon: Coffee,
        description: '외할머니솜씨 팥빙수, 교동다원 전통 황차',
      },
      {
        name: '🛍️ 특산품 & 기념품 쇼핑',
        amount: shoppingAmount,
        percentage: Math.round((shoppingAmount / totalCalculated) * 100),
        color: '#a855f7', // purple
        icon: ShoppingBag,
        description: '전주 수제 초코파이, 한지 공예품 소품',
      },
      {
        name: transport === 'car' ? '🚗 주차 & 기름값' : transport === 'transit' ? '🚌 시내버스 교통비' : '🚶 도보 이동비',
        amount: transportCost,
        percentage: Math.round((transportCost / totalCalculated) * 100),
        color: '#3b82f6', // blue
        icon: Bus,
        description: transport === 'car' ? '공영주차장 및 기름값' : transport === 'transit' ? '전주 시내버스 3~4회 승차' : '도보 0원 산책',
      },
    ]

    return {
      targetSpent: totalCalculated,
      utilizationRate,
      categories,
      minRange,
      maxRange,
      remainingSavings: userBudgetLimit - totalCalculated,
    }
  }, [userBudgetLimit, totalPlaceCost, transport])

  // SVG 원형 그래프 (Donut SVG Slices) 좌표 계산
  const pieSlices = useMemo(() => {
    const total = breakdownData.targetSpent
    if (total === 0) return []

    let cumulativePercent = 0
    const slices = breakdownData.categories.map((cat) => {
      const percent = cat.amount / total
      const startAngle = cumulativePercent * 360
      cumulativePercent += percent
      const endAngle = cumulativePercent * 360

      const x1 = Math.cos((Math.PI * startAngle) / 180)
      const y1 = Math.sin((Math.PI * startAngle) / 180)
      const x2 = Math.cos((Math.PI * endAngle) / 180)
      const y2 = Math.sin((Math.PI * endAngle) / 180)

      const largeArcFlag = percent > 0.5 ? 1 : 0

      // SVG path definition
      const pathData = [
        `M 0 0`,
        `L ${x1} ${y1}`,
        `A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`,
      ].join(' ')

      return {
        ...cat,
        pathData,
      }
    })

    return slices
  }, [breakdownData])

  if (userBudgetLimit === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
        <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
          <Wallet className="size-4" />
          <span>💰 0원 100% 무료 명소 코스 안내</span>
        </div>
        <p className="mt-1 leading-relaxed">
          선택하신 예산이 0원이므로 모든 입장료가 무료인 전주 대표 명소(전동성당, 서학동, 연화정도서관, 수목원, 한벽굴, 아중호수 등)로 구성되었습니다. 식비 및 카페는 개별 선택에 따라 원하시는 만큼 부담 없이 이용해 주세요.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-accent/40 bg-card p-5 shadow-xs">
      {/* 타이틀 및 예산 활용률 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2 font-bold text-base text-foreground">
          <PieIcon className="size-5 text-accent" />
          <span>📊 1인당 예산 사용 내역 & 원형 분석 그래프</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-accent/15 px-3 py-1 text-xs font-bold text-accent border border-accent/30">
            소진율: 약 {breakdownData.utilizationRate}% ({formatWon(breakdownData.targetSpent)})
          </span>
        </div>
      </div>

      {/* 예산 지출 예상 범위 배지 */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/80 p-3 text-xs text-foreground">
        <div>
          <span className="font-bold text-accent">💰 예상 지출 범위:</span>{' '}
          <strong className="text-foreground font-bold">
            약 {formatWon(breakdownData.minRange)} ~ {formatWon(breakdownData.maxRange)}
          </strong>
        </div>
        <span className="text-muted-foreground text-[11px]">
          (설정한 예산 {formatWon(userBudgetLimit)} 중 약 {formatWon(breakdownData.remainingSavings)} 여유 예비비 포함)
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr] items-center pt-2">
        {/* 원형 도넛 그래프 (SVG Donut Chart) */}
        <div className="relative flex flex-col items-center justify-center">
          <svg viewBox="-1.2 -1.2 2.4 2.4" className="size-48 -rotate-90 transform overflow-visible">
            {pieSlices.map((slice, idx) => (
              <path
                key={idx}
                d={slice.pathData}
                fill={slice.color}
                className="transition-all hover:opacity-80 cursor-pointer stroke-card stroke-2"
              />
            ))}
            {/* Center Hole for Donut */}
            <circle r="0.65" fill="hsl(var(--card))" />
          </svg>

          {/* 그래프 중앙 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[11px] font-medium text-muted-foreground">총 예상 지출</span>
            <span className="font-bold text-sm text-foreground">
              {formatWon(breakdownData.targetSpent)}
            </span>
            <span className="text-[10px] text-accent font-semibold">
              (예산의 {breakdownData.utilizationRate}%)
            </span>
          </div>
        </div>

        {/* 범례 및 세부 지출 항목 내역 5선 */}
        <div className="flex flex-col gap-2">
          {breakdownData.categories.map((cat) => {
            const CategoryIcon = cat.icon
            return (
              <div
                key={cat.name}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {cat.description}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-foreground">{formatWon(cat.amount)}</div>
                  <div className="text-[10px] font-semibold text-accent">{cat.percentage}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
