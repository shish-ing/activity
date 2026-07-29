'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChipOption } from '@/lib/mock-data'

type ChipSelectProps = {
  options: ChipOption[]
  value: string | null
  onChange: (value: string) => void
  label: string
  columns?: 2 | 3
}

export function ChipSelect({
  options,
  value,
  onChange,
  label,
  columns = 3,
}: ChipSelectProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-foreground">
        {label}
      </legend>
      <div
        className={cn(
          'grid gap-2',
          columns === 2 ? 'grid-cols-2' : 'grid-cols-3',
        )}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((opt) => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex flex-col items-start justify-center rounded-xl border px-3 py-2.5 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary',
              )}
            >
              <span className="flex w-full items-center justify-between gap-1">
                <span className="text-sm font-medium">{opt.label}</span>
                {active ? <Check className="size-3.5 shrink-0" /> : null}
              </span>
              {opt.hint ? (
                <span
                  className={cn(
                    'text-xs',
                    active
                      ? 'text-primary-foreground/75'
                      : 'text-muted-foreground',
                  )}
                >
                  {opt.hint}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
