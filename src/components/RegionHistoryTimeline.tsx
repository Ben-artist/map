import { useMemo } from 'react'
import { formatYear } from '#/lib/format-year.ts'
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
      <p className="mb-3 text-base text-(--sea-ink-soft)">
        拖动地图仍可浏览；以下为 {placeName} 地名沿革要点（可与方志对照）。
      </p>
      <div className="relative [--timeline-axis:5px]">
        <div
          className="pointer-events-none absolute inset-y-0 left-(--timeline-axis) z-0 w-px bg-(--line)"
          aria-hidden
        />
        <ol className="relative z-1 space-y-0">
          {events.map((event, index) => (
            <li
              key={`${event.year}-${event.title}-${index}`}
              className="relative pb-6 pl-5 last:pb-0"
            >
              <span
                className="absolute top-1 left-(--timeline-axis) z-1 flex size-3 -translate-x-1/2 rounded-full border-2 border-(--lagoon-deep) bg-(--surface-strong)"
                aria-hidden
              />
              <time
                className="text-base font-semibold text-(--lagoon-deep)"
                dateTime={event.year < 0 ? undefined : String(event.year)}
              >
                {formatYear(event.year)}
                {event.period ? (
                  <span className="ml-1.5 font-medium text-(--sea-ink-soft)">
                    {event.period}
                  </span>
                ) : null}
              </time>
              <h4 className="mt-0.5 text-base font-semibold text-(--sea-ink)">
                {event.title}
              </h4>
              <p className="mt-1 text-base leading-relaxed text-(--sea-ink-soft)">
                {event.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
