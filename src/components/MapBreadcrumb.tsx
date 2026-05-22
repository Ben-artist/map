import { ChevronRight } from 'lucide-react'
import { getCityMetaFromAdcode } from '#/data/cities.ts'
import { getProvinceMeta } from '#/data/provinces.ts'
import type { MapUrlSearch } from '#/lib/map-url.ts'
import { cn } from '#/lib/utils.ts'

interface MapBreadcrumbProps {
  urlSearch: MapUrlSearch
  onNavigate: (next: MapUrlSearch) => void
  className?: string
}

interface Crumb {
  label: string
  search: MapUrlSearch
  isCurrent: boolean
}

/**
 * 地图层级面包屑：全国 > 省 > 市，与 URL 深链同步。
 */
export function MapBreadcrumb({
  urlSearch,
  onNavigate,
  className,
}: MapBreadcrumbProps) {
  const { province: provinceAdcode, city: cityAdcode } = urlSearch
  const province = provinceAdcode
    ? getProvinceMeta(provinceAdcode)
    : undefined
  const city = cityAdcode ? getCityMetaFromAdcode(cityAdcode) : null

  const crumbs: Crumb[] = [
    {
      label: '全国',
      search: {},
      isCurrent: !provinceAdcode && !cityAdcode,
    },
  ]

  if (province) {
    crumbs.push({
      label: province.name,
      search: { province: provinceAdcode, city: undefined },
      isCurrent: Boolean(provinceAdcode && !cityAdcode),
    })
  }

  if (city && cityAdcode) {
    crumbs.push({
      label: city.name,
      search: { province: provinceAdcode, city: cityAdcode },
      isCurrent: true,
    })
  }

  return (
    <nav
      aria-label="地图层级"
      className={cn(
        'flex flex-wrap items-center gap-0.5 rounded-full border border-[var(--line)] bg-[var(--surface-strong)]/95 px-2.5 py-1 text-xs shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      {crumbs.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="inline-flex items-center">
          {index > 0 && (
            <ChevronRight
              className="mx-0.5 size-3 shrink-0 text-[var(--sea-ink-soft)]"
              aria-hidden
            />
          )}
          {crumb.isCurrent ? (
            <span className="font-semibold text-[var(--sea-ink)]">
              {crumb.label}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate(crumb.search)}
              className="font-medium text-[var(--lagoon-deep)] transition hover:underline"
            >
              {crumb.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  )
}
