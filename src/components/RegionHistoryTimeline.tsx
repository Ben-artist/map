import { useMemo } from 'react'
import { getRegionTimeline } from '#/lib/region-history.ts'
import { cn } from '#/lib/utils.ts'

interface RegionHistoryTimelineProps {
  adcode: string
  level: 'province' | 'city'
  placeName: string
  nameOrigin: string
  className?: string
}

/**
 * @param year - 公元纪年；公元前为负数
 */
function formatYear(year: number): string {
  if (year < 0) return `公元前${Math.abs(year)}年`
  return `${year}年`
}

/**
 * 地名沿革垂直时间轴。
 */
export function RegionHistoryTimeline({
  adcode,
  level,
  placeName,
  nameOrigin,
  className,
}: RegionHistoryTimelineProps) {
  const events = useMemo(
    () => getRegionTimeline(adcode, level, placeName, nameOrigin),
    [adcode, level, placeName, nameOrigin],
  )

  return (
    <div className={cn('relative', className)}>
      <p className="mb-3 text-base text-[var(--sea-ink-soft)]">
        拖动地图仍可浏览；以下为 {placeName} 地名沿革要点（可与方志对照）。
      </p>
      <ol className="relative space-y-0 border-l-2 border-[var(--line)] pl-5">
        {events.map((event, index) => (
          <li key={`${event.year}-${event.title}-${index}`} className="relative pb-6 last:pb-0">
            <span
              className="absolute -left-[1.35rem] top-1 flex size-3 rounded-full border-2 border-[var(--lagoon-deep)] bg-white"
              aria-hidden
            />
            <time
              className="text-base font-semibold text-[var(--lagoon-deep)]"
              dateTime={event.year < 0 ? undefined : String(event.year)}
            >
              {formatYear(event.year)}
              {event.period ? (
                <span className="ml-1.5 font-medium text-[var(--sea-ink-soft)]">
                  {event.period}
                </span>
              ) : null}
            </time>
            <h4 className="mt-0.5 text-base font-semibold text-[var(--sea-ink)]">
              {event.title}
            </h4>
            <p className="mt-1 text-base leading-relaxed text-[var(--sea-ink-soft)]">
              {event.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
