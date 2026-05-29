import { CHINA_HISTORY_PERIODS } from '#/data/china-history.ts'
import { ChinaHistoryRulers } from '#/components/ChinaHistoryRulers.tsx'
import type { ChinaHistoryRuler } from '#/lib/china-history-types.ts'
import { cn } from '#/lib/utils.ts'

interface ChinaHistoryTimelineProps {
  /** 当前高亮朝代（与侧边栏联动） */
  activePeriodId?: string
  onRulerSelect?: (periodId: string, ruler: ChinaHistoryRuler) => void
  className?: string
}

/**
 * 商朝至新中国成立纵向朝代与君主世系。
 */
export function ChinaHistoryTimeline({
  activePeriodId,
  onRulerSelect,
  className,
}: ChinaHistoryTimelineProps) {
  return (
    <div className={cn('history-timeline relative', className)}>
      <div
        className="pointer-events-none absolute top-3 bottom-3 left-[11px] w-px bg-(--line) sm:left-[13px]"
        aria-hidden
      />

      <div className="space-y-14 sm:space-y-20">
        {CHINA_HISTORY_PERIODS.map((period, periodIndex) => {
          const isActive = activePeriodId === period.id

          return (
            <section
              key={period.id}
              id={`period-${period.id}`}
              className="relative scroll-mt-28 pl-9 sm:pl-11"
              aria-labelledby={`period-heading-${period.id}`}
            >
              <span
                className={cn(
                  'absolute top-2 left-0 z-[1] flex size-[22px] items-center justify-center rounded-full border-2 sm:size-6',
                  'border-(--foam) bg-(--foam) transition',
                  isActive
                    ? 'ring-4 ring-[color-mix(in_oklab,--lagoon_30%,transparent)]'
                    : '',
                )}
                aria-hidden
              >
                <span
                  className={cn(
                    'size-2.5 rounded-full transition sm:size-3',
                    isActive ? 'bg-(--lagoon-deep)' : 'bg-(--lagoon)',
                  )}
                />
              </span>

              <header className="mb-5 sm:mb-6">
                <p className="mb-1 text-xs font-bold tracking-[0.12em] text-(--kicker) uppercase tabular-nums">
                  {String(periodIndex + 1).padStart(2, '0')} · {period.rangeLabel}
                </p>
                <h2
                  id={`period-heading-${period.id}`}
                  className="display-title m-0 text-[clamp(2rem,5vw,2.75rem)] leading-[1.1] font-bold text-(--sea-ink)"
                >
                  {period.name}
                </h2>
                <p className="mt-3 mb-0 max-w-2xl text-base leading-7 text-(--sea-ink-soft)">
                  {period.summary}
                </p>
              </header>

              <ChinaHistoryRulers
                period={period}
                onRulerSelect={
                  onRulerSelect
                    ? (ruler) => onRulerSelect(period.id, ruler)
                    : undefined
                }
              />
            </section>
          )
        })}
      </div>
    </div>
  )
}
