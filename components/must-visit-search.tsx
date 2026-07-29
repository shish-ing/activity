'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { SEARCH_SUGGESTIONS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

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

  // 더미 검색 결과: 입력값으로 필터링 (실제 검색 API 없음)
  const results = useMemo(() => {
    const q = query.trim()
    const base = q
      ? SEARCH_SUGGESTIONS.filter((s) => s.includes(q))
      : SEARCH_SUGGESTIONS
    return base.filter((s) => !items.includes(s)).slice(0, 5)
  }, [query, items])

  function handleAdd(name: string) {
    // TODO: API 연동 (백엔드에서 구현 예정) — 장소 검색/좌표 조회
    onAdd(name)
    setQuery('')
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-foreground">
        필수 방문지 추가{' '}
        <span className="font-normal text-muted-foreground">(선택)</span>
      </legend>

      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-ring/40">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="꼭 가고 싶은 곳을 검색하세요"
            className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="필수 방문지 검색"
          />
        </div>

        {focused && results.length > 0 ? (
          <ul className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
            {results.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAdd(r)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-popover-foreground transition-colors hover:bg-secondary"
                >
                  <span className="flex items-center gap-2">
                    <Search className="size-3.5 text-muted-foreground" />
                    {r}
                  </span>
                  <Plus className="size-4 text-accent" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {items.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li key={item}>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full bg-accent/15 py-1 pr-1 pl-2.5 text-xs font-medium text-accent-foreground',
                )}
              >
                <span className="text-foreground">{item}</span>
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
