import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { buildRegionStatsBarOption } from '#/lib/region-stats-chart.ts'
import { getNationalAverageStats, getRegionStats } from '#/lib/region-stats.ts'
import { cn } from '#/lib/utils.ts'

interface RegionStatsBarChartProps {
  adcode: string
  level: 'province' | 'city'
  placeName: string
  className?: string
}

/**
 * 地区 GDP / 人口等指标 2D 分组柱状对比图。
 */
export function RegionStatsBarChart({
  adcode,
  level,
  placeName,
  className,
}: RegionStatsBarChartProps) {
  const stats = useMemo(
    () => getRegionStats(adcode, level),
    [adcode, level],
  )

  const nationalAvg = useMemo(() => getNationalAverageStats(), [])

  const option = useMemo(
    () =>
      stats ? buildRegionStatsBarOption(stats, placeName, nationalAvg) : null,
    [stats, placeName, nationalAvg],
  )

  if (!stats || !option) {
    return (
      <p className="text-base text-[var(--sea-ink-soft)]">
        该地区统计数据整理中。
      </p>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="text-base text-[var(--sea-ink-soft)]">
        {stats.year} 年统计公报口径
        {stats.estimated ? '（部分为估算，仅供课堂示意）' : ''}
        · 蓝色柱为{placeName}，浅色柱为大陆 31 省级算术平均
      </p>
      <div className="h-[220px] w-full min-w-0 rounded-xl border border-[var(--line)] bg-white/50">
        <ReactECharts
          key={adcode}
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge
        />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-base">
        <div className="rounded-lg border border-[var(--line)] bg-white/70 px-2.5 py-2">
          <dt className="text-[var(--sea-ink-soft)]">GDP</dt>
          <dd className="font-semibold text-[var(--sea-ink)]">
            {stats.gdpYi.toLocaleString('zh-CN')} 亿元
          </dd>
          <dd className="text-[var(--sea-ink-soft)]">
            全国均值 {nationalAvg.gdpYi.toLocaleString('zh-CN')} 亿元
          </dd>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-white/70 px-2.5 py-2">
          <dt className="text-[var(--sea-ink-soft)]">常住人口</dt>
          <dd className="font-semibold text-[var(--sea-ink)]">
            {stats.populationWan.toLocaleString('zh-CN')} 万人
          </dd>
          <dd className="text-[var(--sea-ink-soft)]">
            全国均值 {nationalAvg.populationWan.toLocaleString('zh-CN')} 万人
          </dd>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-white/70 px-2.5 py-2">
          <dt className="text-[var(--sea-ink-soft)]">面积</dt>
          <dd className="font-semibold text-[var(--sea-ink)]">
            {stats.areaWanKm2.toLocaleString('zh-CN')} 万km²
          </dd>
          <dd className="text-[var(--sea-ink-soft)]">
            全国均值 {nationalAvg.areaWanKm2.toLocaleString('zh-CN')} 万km²
          </dd>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-white/70 px-2.5 py-2">
          <dt className="text-[var(--sea-ink-soft)]">城镇化率</dt>
          <dd className="font-semibold text-[var(--sea-ink)]">
            {stats.urbanRate}%
          </dd>
          <dd className="text-[var(--sea-ink-soft)]">
            全国均值 {nationalAvg.urbanRate}%
          </dd>
        </div>
      </dl>
    </div>
  )
}
