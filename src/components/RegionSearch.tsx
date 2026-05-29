import { useEffect, useId, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import {
  searchRegions,
  type RegionSearchHit,
} from '#/lib/region-search.ts'
import { cn } from '#/lib/utils.ts'

interface RegionSearchProps {
  onSelect: (hit: RegionSearchHit) => void
  className?: string
}

/**
 * 地名 / 车牌 / 典故关键词搜索，选中后回调导航。
 */
export function RegionSearch({ onSelect, className }: RegionSearchProps) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = query.trim() ? searchRegions(query) : []

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const pick = (hit: RegionSearchHit) => {
    onSelect(hit)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === 'Escape') setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const hit = results[activeIndex]
      if (hit) pick(hit)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-[1.125rem] -translate-y-1/2 text-(--sea-ink-soft)"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="搜索省、市、车牌…"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-11 w-full rounded-full border border-(--line) bg-white/90 py-0 pl-10 pr-4 text-base leading-none text-(--sea-ink) shadow-sm backdrop-blur-sm outline-none ring-(--lagoon) transition placeholder:text-(--sea-ink-soft) focus:ring-2 sm:h-12"
        />
      </div>

      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-64 overflow-y-auto rounded-xl border border-(--line) bg-(--surface-strong) py-1 shadow-lg backdrop-blur-md"
        >
          {results.map((hit, index) => (
            <li key={hit.adcode} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(hit)}
                className={cn(
                  'flex w-full flex-col gap-0.5 px-3 py-2 text-left transition',
                  index === activeIndex
                    ? 'bg-[rgba(79,184,178,0.18)]'
                    : 'hover:bg-[rgba(79,184,178,0.1)]',
                )}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium text-(--sea-ink)">
                  <span>{hit.name}</span>
                  <span className="text-xs text-(--sea-ink-soft)">
                    {hit.platePrefix}
                  </span>
                </span>
                <span className="line-clamp-1 text-xs text-(--sea-ink-soft)">
                  {hit.subtitle}
                  {' · '}
                  {(hit.structured.etymology || hit.nameOrigin).slice(0, 36)}
                  {(hit.structured.etymology || hit.nameOrigin).length > 36
                    ? '…'
                    : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
