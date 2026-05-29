import { CHINA_HISTORY_PERIODS } from '#/data/china-history.ts'
import { cn } from '#/lib/utils.ts'

interface ChinaHistoryNavProps {
  activePeriodId?: string
  onPeriodSelect: (periodId: string) => void
  className?: string
}

/**
 * 朝代目录导航：纵向索引，配合通史纵轴定位。
 */
export function ChinaHistoryNav({
  activePeriodId,
  onPeriodSelect,
  className,
}: ChinaHistoryNavProps) {
  return (
    <nav aria-label="朝代导航" className={cn('history-nav', className)}>
      <p className="mb-3 text-xs font-bold tracking-[0.14em] text-(--kicker) uppercase">
        朝代索引
      </p>
      <ol className="m-0 list-none space-y-0.5 p-0">
        {CHINA_HISTORY_PERIODS.map((period) => {
          const isActive = activePeriodId === period.id

          return (
            <li key={period.id}>
              <button
                type="button"
                data-period-id={period.id}
                onClick={() => onPeriodSelect(period.id)}
                className={cn(
                  'group flex w-full cursor-pointer items-start gap-2.5 rounded-xl border-0 px-2.5 py-2 text-left transition',
                  'hover:bg-[color-mix(in_oklab,--lagoon_10%,transparent)]',
                  isActive && 'bg-[color-mix(in_oklab,--lagoon_16%,--chip-bg)]',
                )}
                aria-current={isActive ? 'location' : undefined}
              >
                <span
                  className={cn(
                    'mt-1.5 size-2 shrink-0 rounded-full transition',
                    isActive
                      ? 'bg-(--lagoon-deep) ring-4 ring-[color-mix(in_oklab,--lagoon_28%,transparent)]'
                      : 'bg-(--line) group-hover:bg-(--lagoon)',
                  )}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block text-sm font-bold leading-tight',
                      isActive ? 'text-(--sea-ink)' : 'text-(--sea-ink-soft)',
                    )}
                  >
                    {period.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug font-medium text-(--sea-ink-soft) tabular-nums">
                    {period.rangeLabel}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
