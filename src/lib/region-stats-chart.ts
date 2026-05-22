import type { EChartsOption } from 'echarts'
import type { RegionStats } from '#/lib/region-stats-types.ts'
import {
  getNationalAverageStats,
  statsToChartMetrics,
} from '#/lib/region-stats.ts'

const LOCAL_COLOR = '#5b9bd5'
const NATIONAL_COLOR = 'rgba(91, 155, 213, 0.45)'

const NATIONAL_LABEL = '全国省级平均'

/**
 * 构建地区 vs 全国省级平均 2D 分组柱状图。
 */
export function buildRegionStatsBarOption(
  stats: RegionStats,
  placeName: string,
  nationalStats: RegionStats = getNationalAverageStats(),
): EChartsOption {
  const localMetrics = statsToChartMetrics(stats)
  const nationalMetrics = statsToChartMetrics(nationalStats)
  const categories = localMetrics.map((m) => m.label)
  const shortName = placeName.length > 8 ? `${placeName.slice(0, 8)}…` : placeName

  return {
    backgroundColor: 'transparent',
    legend: {
      data: [shortName, NATIONAL_LABEL],
      top: 0,
      textStyle: { color: '#416166', fontSize: 14 },
    },
    grid: {
      left: 8,
      right: 8,
      top: 40,
      bottom: 8,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(23, 58, 64, 0.18)',
      textStyle: { color: '#173a40', fontSize: 16 },
      formatter: (params) => {
        const items = (Array.isArray(params) ? params : [params]) as {
          seriesName?: string
          marker?: string
          data?: { display?: string }
        }[]
        return items
          .map((p) => {
            const display = p.data?.display ?? ''
            return `${p.marker ?? ''}${p.seriesName ?? ''}<br/>${display}`
          })
          .join('<br/><br/>')
      },
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { fontSize: 14, color: '#173a40' },
      axisLine: { lineStyle: { color: 'rgba(50, 143, 151, 0.4)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '相对规模',
      max: 100,
      nameTextStyle: { color: '#416166', fontSize: 13 },
      axisLabel: { fontSize: 12, color: '#416166' },
      splitLine: { lineStyle: { color: 'rgba(50, 143, 151, 0.12)' } },
    },
    series: [
      {
        name: shortName,
        type: 'bar',
        barMaxWidth: 36,
        data: localMetrics.map((m) => ({
          value: Math.max(m.chartHeight, 4),
          display: m.display,
        })),
        itemStyle: {
          color: LOCAL_COLOR,
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          color: '#173a40',
          formatter: (p: { data?: { display?: string } }) =>
            p.data?.display ?? '',
        },
      },
      {
        name: NATIONAL_LABEL,
        type: 'bar',
        barMaxWidth: 36,
        data: nationalMetrics.map((m) => ({
          value: Math.max(m.chartHeight, 4),
          display: m.display,
        })),
        itemStyle: {
          color: NATIONAL_COLOR,
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          color: '#416166',
          formatter: (p: { data?: { display?: string } }) =>
            p.data?.display ?? '',
        },
      },
    ],
  }
}
