import { Loader2 } from 'lucide-react'
import { MapBreadcrumb } from '#/components/MapBreadcrumb.tsx'
import { RegionSearch } from '#/components/RegionSearch.tsx'
import type { MapUrlSearch } from '#/lib/map-url.ts'
import type { RegionSearchHit } from '#/lib/region-search.ts'
import { cn } from '#/lib/utils.ts'

interface MapToolbarProps {
  urlSearch: MapUrlSearch
  onNavigate: (next: MapUrlSearch) => void
  onSearchSelect: (hit: RegionSearchHit) => void
  citiesLoading?: boolean
  panelOpen?: boolean
  className?: string
}

/**
 * 地图顶部统一工具栏：面包屑、搜索。
 */
export function MapToolbar({
  urlSearch,
  onNavigate,
  onSearchSelect,
  citiesLoading = false,
  panelOpen = false,
  className,
}: MapToolbarProps) {
  return (
    <header
      className={cn(
        'pointer-events-none absolute left-3 right-3 top-3 z-30 sm:left-5 sm:top-4',
        'w-[calc(100%-1.5rem)] max-w-[min(100%,32rem)]',
        panelOpen
          ? 'sm:right-[min(24rem,calc(38%+1rem))] sm:max-w-xl'
          : 'sm:right-auto sm:max-w-2xl',
        className,
      )}
    >
      <div className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)]/95 p-2.5 shadow-md backdrop-blur-md sm:gap-2.5 sm:p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex min-w-0 items-center justify-between gap-2 sm:shrink-0">
            <MapBreadcrumb
              urlSearch={urlSearch}
              onNavigate={onNavigate}
              className="min-w-0 border-0 bg-transparent p-0 shadow-none"
            />
            {citiesLoading && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/80 px-2 py-1 text-base text-[var(--sea-ink-soft)]">
                <Loader2 className="size-3 animate-spin" aria-hidden />
                加载中
              </span>
            )}
          </div>

          <RegionSearch
            onSelect={onSearchSelect}
            className="min-w-0 w-full sm:min-w-[14rem] sm:flex-1"
          />
        </div>
      </div>
    </header>
  )
}
