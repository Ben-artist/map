import { useMemo } from 'react'
import type { ChinaHistoryPeriod, ChinaHistoryRuler } from '#/lib/china-history-types.ts'
import { Crown } from 'lucide-react'
import { cn } from '#/lib/utils.ts'

interface ChinaHistoryRulersProps {
  period: ChinaHistoryPeriod
  onRulerSelect?: (ruler: ChinaHistoryRuler) => void
  className?: string
}

interface RulerGroup {
  key: string
  label?: string
  rulers: ChinaHistoryRuler[]
}

/**
 * 将统治者按政权分组；单一政权时不显示分组标题。
 */
function groupRulers(rulers: ChinaHistoryRuler[]): RulerGroup[] {
  const regimes = new Set(rulers.map((r) => r.regime).filter(Boolean))

  if (regimes.size <= 1) {
    return [{ key: 'all', rulers }]
  }

  const groups = new Map<string, ChinaHistoryRuler[]>()

  for (const ruler of rulers) {
    const label = ruler.regime ?? '其他'
    const list = groups.get(label) ?? []
    list.push(ruler)
    groups.set(label, list)
  }

  return [...groups.entries()].map(([label, groupRulers]) => ({
    key: label,
    label,
    rulers: groupRulers,
  }))
}

/**
 * 朝代完整君主/皇帝世系列表。
 */
export function ChinaHistoryRulers({
  period,
  onRulerSelect,
  className,
}: ChinaHistoryRulersProps) {
  const groups = useMemo(() => groupRulers(period.rulers), [period.rulers])

  if (period.rulers.length === 0) return null

  const roleLabel = period.rulerRole ?? '统治者'
  const needsScroll = period.rulers.length > 8

  return (
    <div className={cn('history-rulers', className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-(--lagoon-deep)" aria-hidden />
          <h3 className="m-0 text-sm font-bold tracking-wide text-(--sea-ink)">
            {roleLabel}
          </h3>
        </div>
        <span className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-2.5 py-0.5 text-xs font-semibold text-(--sea-ink-soft) tabular-nums">
          共 {period.rulers.length} 位
        </span>
      </div>

      {onRulerSelect ? (
        <p className="mb-3 text-xs text-(--sea-ink-soft)">点击君主，AI 讲述生平与在位大事</p>
      ) : null}

      <div
        className={cn(
          'space-y-4 overflow-hidden rounded-2xl border border-(--line) bg-[color-mix(in_oklab,--surface-strong_88%,--foam)]',
          needsScroll && 'max-h-[min(28rem,60vh)] overflow-y-auto',
        )}
      >
        {groups.map((group) => (
          <section key={group.key} className="history-rulers__group">
            {group.label ? (
              <h4 className="sticky top-0 z-[1] m-0 border-b border-(--line) bg-[color-mix(in_oklab,--surface-strong_95%,--foam)] px-4 py-2 text-xs font-bold tracking-[0.1em] text-(--kicker) uppercase backdrop-blur-sm">
                {group.label}
              </h4>
            ) : null}

            <ol className="m-0 list-none divide-y divide-(--line) p-0">
              {group.rulers.map((ruler, index) => (
                <li key={`${period.id}-${group.key}-${ruler.title ?? ''}-${ruler.name}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onRulerSelect?.(ruler)}
                    disabled={!onRulerSelect}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-2.5 text-left sm:py-3',
                      onRulerSelect &&
                        'cursor-pointer transition hover:bg-[color-mix(in_oklab,--lagoon_8%,transparent)]',
                    )}
                  >
                    <span
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,--lagoon_14%,--chip-bg)] text-[11px] font-bold text-(--lagoon-deep) tabular-nums"
                      aria-hidden
                    >
                      {index + 1}
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <p className="m-0 text-sm font-semibold text-(--sea-ink)">
                          {ruler.title ? (
                            <>
                              {ruler.title}
                              <span className="font-medium text-(--sea-ink-soft)">
                                {' '}
                                · {ruler.name}
                              </span>
                            </>
                          ) : (
                            ruler.name
                          )}
                          {ruler.note ? (
                            <span className="ml-1.5 text-xs font-semibold text-(--lagoon-deep)">
                              {ruler.note}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      {ruler.reign ? (
                        <p className="m-0 shrink-0 text-xs font-medium text-(--sea-ink-soft) tabular-nums sm:text-right">
                          {ruler.reign}
                        </p>
                      ) : null}
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {needsScroll ? (
        <p className="mt-2 mb-0 text-xs text-(--sea-ink-soft)">列表较长，可上下滚动查看</p>
      ) : null}
    </div>
  )
}
