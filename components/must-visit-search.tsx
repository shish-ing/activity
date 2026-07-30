'use client'

import { useEffect, useState } from 'react'
import { MapPin, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAppLang, t, type AppLang } from '@/lib/i18n'

type SearchResultItem = {
  name: string
  category: string
  address?: string
  costLabel?: string
}

type MustVisitSearchProps = {
  items: string[]
  onAdd: (name: string) => void
  onRemove: (name: string) => void
}

export function MustVisitSearch({
  items,
  onAdd,
  onRemove,
}: MustVisitSearchProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    let ignore = false
    const q = query.trim()

    const fetchPlaces = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`)
        if (res.ok) {
          const data = await res.json()
          if (!ignore) {
            // 이미 추가된 장소 제외
            const filtered = data.filter(
              (item: SearchResultItem) => !items.includes(item.name),
            )
            setResults(filtered)
          }
        }
      } catch (err) {
        console.error('Failed to search places:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    const timer = setTimeout(fetchPlaces, 150)
    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [query, items])

  function handleAdd(name: string) {
    if (!name.trim()) return
    onAdd(name.trim())
    setQuery('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (query.trim() && !items.includes(query.trim())) {
        handleAdd(query.trim())
      }
    }
  }

  return (
    <fieldset className="font-sans">
      <legend className="mb-2 flex items-center justify-between text-sm font-extrabold text-foreground">
        <span>
          {t('필수 방문지 추가', 'Must-Visit Places', lang)}{' '}
          <span className="font-normal text-muted-foreground">{t('(선택)', '(Optional)', lang)}</span>
        </span>
        <span className="text-[11px] font-bold text-accent">
          {t('네이버 지도 기반 장소 검색', 'Naver Map Based Search', lang)}
        </span>
      </legend>

      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-300/40">
          <Search className="size-4 shrink-0 text-sky-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder={t(
              '네이버 지도로 놀거리/꼭 가고 싶은 곳 검색 (예: 경기전, 전주향교)',
              'Search must-visit places via Naver Map (e.g., Gyeonggijeon)',
              lang
            )}
            className="h-11 w-full bg-transparent text-xs sm:text-sm text-foreground outline-none placeholder:text-slate-400 font-medium"
            aria-label="필수 방문지 검색"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {focused && (results.length > 0 || query.trim()) ? (
          <ul className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-sky-200 bg-white/95 p-1 shadow-xl backdrop-blur-md">
            {results.map((r) => (
              <li key={r.name}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAdd(r.name)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm text-slate-800 transition-colors hover:bg-sky-50 cursor-pointer"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {r.name}
                      </span>
                      <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-800 font-bold">
                        NMap
                      </span>
                    </div>
                    {r.address ? (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                        <MapPin className="size-3 shrink-0" />
                        {r.address}
                      </span>
                    ) : null}
                  </div>
                  <Plus className="size-4 shrink-0 text-sky-700" />
                </button>
              </li>
            ))}

            {query.trim() && !results.some((r) => r.name === query.trim()) ? (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAdd(query.trim())}
                  className="flex w-full items-center justify-between rounded-lg border-t border-sky-100 px-3 py-2.5 text-left text-xs sm:text-sm text-sky-700 font-bold transition-colors hover:bg-sky-50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="size-4" />
                    &apos;{query.trim()}&apos; {t('장소 검색 결과로 직접 추가', 'Add directly as must-visit', lang)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Enter</span>
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>

      {items.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li key={item}>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 py-1 pr-1.5 pl-3 text-xs font-bold text-amber-950 border border-amber-300 shadow-2xs',
                )}
              >
                <span>{item}</span>
                <span className="text-[10px] text-amber-800 font-bold">({t('필수', 'Must-Visit', lang)})</span>
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  aria-label={`${item} 삭제`}
                  className="flex size-4 items-center justify-center rounded-full text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </fieldset>
  )
}
