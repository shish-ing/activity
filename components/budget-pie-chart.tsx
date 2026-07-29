'use client'

import { useMemo } from 'react'
import { PieChart as PieIcon, ShoppingBag, Utensils, Coffee, Ticket, Bus, Wallet, Gift } from 'lucide-react'

type BudgetPieChartProps = {
  userBudgetLimit: number
  totalPlaceCost: number
  transport: string // 'walk' | 'transit' | 'car'
  time?: string // '1h' | '3h' | 'half' | 'full' | '2days' | '3days'
}

function formatWon(val: number) {
  return `${val.toLocaleString('ko-KR')}원`
}

export function BudgetPieChart({
  userBudgetLimit,
  totalPlaceCost,
  transport,
  time = '3h',
}: BudgetPieChartProps) {
  // 예산 소진 비율 및 지출 카테고리 세부 내역 계산 (여행 시간 파라미터 엄격 반영)
  const breakdownData = useMemo(() => {
    if (userBudgetLimit === 0) {
      return {
        targetSpent: 0,
        utilizationRate: 0,
        categories: [
          { name: '🍲 로컬 식비 (자유 식사)', amount: 0, percentage: 0, color: '#10b981', icon: Utensils, description: '자유 개별 식사' },
          { name: '🎟️ 관람 & 무료 명소', amount: 0, percentage: 0, color: '#f59e0b', icon: Ticket, description: '100% 무료 입장' },
          { name: '☕ 카페 & 수제 디저트', amount: 0, percentage: 0, color: '#06b6d4', icon: Coffee, description: '자유 차 마시기' },
          { name: '🛍️ 특산품 & 쇼핑', amount: 0, percentage: 0, color: '#a855f7', icon: ShoppingBag, description: '자유 구경' },
          { name: '🚌 교통 & 기타', amount: 0, percentage: 0, color: '#3b82f6', icon: Bus, description: '도보 0원' },
        ],
        minRange: 0,
        maxRange: 0,
        remainingSavings: 0,
        mealDesc: '자유 개별 식사',
      }
    }

    // 1. 목표 예산 소진액 (약 80% ~ 82% 수준)
    const targetSpent = Math.min(
      userBudgetLimit,
      Math.max(totalPlaceCost + 15000, Math.round(userBudgetLimit * 0.82)),
    )

    // 2. 교통비 추정 (도보 0원 / 대중교통 ~4,500원 / 자차 ~12,000원)
    const transportCost =
      transport === 'car' ? 12000 : transport === 'transit' ? 4500 : 0

    // 3. 여행 시간(time)별 현실적 식사 횟수 및 식비 상한 제한
    let mealDesc = '전주 로컬 맛집 정식 1식'
    let maxMealCost = 22000
    let maxCafeCost = 12000

    if (time === '1h') {
      mealDesc = '가벼운 1인 로컬 주전부리/간식 1회'
      maxMealCost = 10000
      maxCafeCost = 6000
    } else if (time === '3h') {
      mealDesc = '전주 3대 비빔밥 또는 떡갈비 1식 (3시간 일정 1회 식사)'
      maxMealCost = 22000
      maxCafeCost = 12000
    } else if (time === 'half') {
      mealDesc = '점심 정식 1식 + 남부시장 주전부리 1회'
      maxMealCost = 35000
      maxCafeCost = 16000
    } else if (time === 'full') {
      mealDesc = '점심 & 저녁 총 2식 풀 코스'
      maxMealCost = 48000
      maxCafeCost = 20000
    } else if (time === '2days') {
      mealDesc = '1박 2일 일정 총 3~4식'
      maxMealCost = 88000
      maxCafeCost = 30000
    } else if (time === '3days') {
      mealDesc = '2박 3일 일정 총 5~6식'
      maxMealCost = 135000
      maxCafeCost = 45000
    }

    // 4. 현실적 식비 & 카페비 계산
    const diningAmount = Math.min(
      maxMealCost,
      Math.max(12000, Math.round(targetSpent * (time === '1h' ? 0.1 : time === '3h' ? 0.18 : 0.32))),
    )

    const cafeAmount = Math.min(
      maxCafeCost,
      Math.max(6000, Math.round(targetSpent * 0.12)),
    )

    // 관람 및 공방 체험비
    const activityAmount = Math.max(totalPlaceCost, Math.round(targetSpent * 0.25))

    // 짧은 시간 일정에서 큰 예산이 남을 경우, 남은 예산은 전주 고급 특산품/선물 세트 쇼핑으로 배정!
    const shoppingAmount = Math.max(
      0,
      targetSpent - diningAmount - cafeAmount - activityAmount - transportCost,
    )

    const totalCalculated = diningAmount + activityAmount + cafeAmount + shoppingAmount + transportCost
    const utilizationRate = Math.round((totalCalculated / userBudgetLimit) * 100)

    const minRange = Math.round(totalCalculated * 0.95)
    const maxRange = Math.round(totalCalculated * 1.05)

    const categories = [
      {
        name: '🍲 로컬 식비',
        amount: diningAmount,
        percentage: Math.round((diningAmount / totalCalculated) * 100),
        color: '#10b981', // 에메랄드 그린
        icon: Utensils,
        description: mealDesc,
      },
      {
        name: '🎟️ 관람 & 공방 체험료',
        amount: activityAmount,
        percentage: Math.round((activityAmount / totalCalculated) * 100),
        color: '#f59e0b', // 앰버 옐로우
        icon: Ticket,
        description: '한지/도자기/부채 공방, 전주 난장, 어진박물관 등',
      },
      {
        name: '☕ 카페 & 전통 찻집',
        amount: cafeAmount,
        percentage: Math.round((cafeAmount / totalCalculated) * 100),
        color: '#06b6d4', // 시안 블루
        icon: Coffee,
        description: '외할머니솜씨 팥빙수, 교동다원 전통 황차 1회',
      },
      {
        name: '🛍️ 특산품 & 고급 선물 쇼핑',
        amount: shoppingAmount,
        percentage: Math.round((shoppingAmount / totalCalculated) * 100),
        color: '#a855f7', // 퍼플 보라
        icon: Gift,
        description: '전주 수제 초코파이 선물세트, 전통주 모주, 한지 소품',
      },
      {
        name: transport === 'car' ? '🚗 주차 & 기름값' : transport === 'transit' ? '🚌 시내버스 교통비' : '🚶 도보 이동비',
        amount: transportCost,
        percentage: Math.round((transportCost / totalCalculated) * 100),
        color: '#3b82f6', // 브라이트 블루
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
      mealDesc,
    }
  }, [userBudgetLimit, totalPlaceCost, transport, time])

  // 선명하고 확실한 색상 구별을 위한 CSS Conic Gradient 생성
  const conicGradientStyle = useMemo(() => {
    const total = breakdownData.targetSpent
    if (total === 0) return { background: '#10b981' }

    let currentPercentAcc = 0
    const colorStops = breakdownData.categories.map((cat) => {
      const start = currentPercentAcc
      const pct = (cat.amount / total) * 100
      currentPercentAcc += pct
      const end = currentPercentAcc
      return `${cat.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`
    })

    return {
      background: `conic-gradient(${colorStops.join(', ')})`,
    }
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
          <span>📊 여행 시간 맞춤 예산 분석 원형 그래프 ({time === '3h' ? '3시간 코스 1식 전용' : `${time} 일정`})</span>
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
          <span className="font-bold text-accent">💰 {time} 일정 예상 지출 범위:</span>{' '}
          <strong className="text-foreground font-bold">
            약 {formatWon(breakdownData.minRange)} ~ {formatWon(breakdownData.maxRange)}
          </strong>
        </div>
        <span className="text-muted-foreground text-[11px]">
          (설정한 예산 {formatWon(userBudgetLimit)} 중 약 {formatWon(breakdownData.remainingSavings)} 여유 예비비 포함)
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr] items-center pt-2">
        {/* 원형 도넛 그래프 (선명한 CSS Conic Gradient 색상 선명 표기) */}
        <div className="relative flex flex-col items-center justify-center p-2">
          <div
            style={conicGradientStyle}
            className="size-44 rounded-full shadow-lg border-2 border-border/40 relative flex items-center justify-center transition-all hover:scale-105"
          >
            {/* Center Donut Hole */}
            <div className="size-28 rounded-full bg-card shadow-inner flex flex-col items-center justify-center text-center p-2">
              <span className="text-[11px] font-medium text-muted-foreground">총 예상 지출</span>
              <span className="font-bold text-sm text-foreground">
                {formatWon(breakdownData.targetSpent)}
              </span>
              <span className="text-[10px] text-accent font-semibold">
                (예산의 {breakdownData.utilizationRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* 범례 및 세부 지출 항목 내역 5선 (색상 도트 명확 연동) */}
        <div className="flex flex-col gap-2">
          {breakdownData.categories.map((cat) => {
            return (
              <div
                key={cat.name}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-3.5 rounded-full shrink-0 shadow-xs border border-white/20"
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
                  <div className="text-[10px] font-semibold" style={{ color: cat.color }}>
                    {cat.percentage}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
