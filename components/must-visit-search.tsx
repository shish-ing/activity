'use client'

import { useEffect, useState } from 'react'
import { MapPin, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <fieldset>
      <legend className="mb-2 flex items-center justify-between text-sm font-medium text-foreground">
        <span>
          필수 방문지 추가{' '}
          <span className="font-normal text-muted-foreground">(선택)</span>
        </span>
        <span className="text-[11px] font-normal text-accent">
          네이버 지도 기반 장소 검색
        </span>
      </legend>

      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-ring/40">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="네이버 지도로 놀거리/꼭 가고 싶은 곳 검색 (예: 경기전, 전주향교)"
            className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="필수 방문지 검색"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {focused && (results.length > 0 || query.trim()) ? (
          <ul className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-xl backdrop-blur-md">
            {results.map((r) => (
              <li key={r.name}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAdd(r.name)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-secondary"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {r.name}
                      </span>
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">
                        N지도
                      </span>
                    </div>
                    {r.address ? (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                        <MapPin className="size-3 shrink-0" />
                        {r.address}
                      </span>
                    ) : null}
                  </div>
                  <Plus className="size-4 shrink-0 text-accent" />
                </button>
              </li>
            ))}

            {query.trim() && !results.some((r) => r.name === query.trim()) ? (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAdd(query.trim())}
                  className="flex w-full items-center justify-between rounded-lg border-t border-border/50 px-3 py-2.5 text-left text-sm text-accent transition-colors hover:bg-secondary"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Plus className="size-4" />
                    &apos;{query.trim()}&apos; 장소 검색 결과로 직접 추가
                  </span>
                  <span className="text-xs text-muted-foreground">엔터(Enter)</span>
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
                  'inline-flex items-center gap-1.5 rounded-full bg-accent/15 py-1 pr-1.5 pl-3 text-xs font-medium text-accent-foreground border border-accent/30',
                )}
              >
                <span className="font-semibold text-foreground">{item}</span>
                <span className="text-[10px] text-accent font-normal">경로 필수 포함</span>
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  aria-label={`${item} 삭제`}
                  className="flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
