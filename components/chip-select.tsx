'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChipOption } from '@/lib/mock-data'
import { getAppLang, type AppLang } from '@/lib/i18n'

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
  const [lang, setLang] = useState<AppLang>('ko')

  useEffect(() => {
    setLang(getAppLang())
    const handleLangChange = () => setLang(getAppLang())
    window.addEventListener('jeonju_lang_changed', handleLangChange)
    window.addEventListener('storage', handleLangChange)
    return () => {
      window.removeEventListener('jeonju_lang_changed', handleLangChange)
      window.removeEventListener('storage', handleLangChange)
    }
  }, [])

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-foreground">
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
          const displayLabel = lang === 'en' && opt.labelEn ? opt.labelEn : opt.label
          const displayHint = lang === 'en' && opt.hintEn ? opt.hintEn : opt.hint

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex flex-col items-start justify-center rounded-xl border px-3 py-2.5 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer',
                active
                  ? 'border-amber-400 bg-amber-400 text-slate-950 font-bold shadow-md scale-[1.01]'
                  : 'border-slate-200/90 bg-white/85 text-slate-800 hover:border-amber-300 hover:bg-white shadow-2xs',
              )}
            >
              <span className="flex w-full items-center justify-between gap-1">
                <span className="text-xs sm:text-sm font-extrabold">{displayLabel}</span>
                {active ? <Check className="size-3.5 shrink-0 text-slate-950" /> : null}
              </span>
              {displayHint ? (
                <span
                  className={cn(
                    'text-[11px] sm:text-xs mt-0.5',
                    active
                      ? 'text-slate-900/80 font-bold'
                      : 'text-slate-500',
                  )}
                >
                  {displayHint}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
