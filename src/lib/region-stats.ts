import { CITY_STATS } from '#/data/region-stats-cities.ts'
import { PROVINCE_STATS } from '#/data/region-stats-provinces.ts'
import { provinceAdcodeFromRegion } from '#/lib/region-adcode.ts'
import type {
  RegionStats,
  RegionStatsMetric,
} from '#/lib/region-stats-types.ts'

const GDP_CHART_MAX = 140_000
const POP_CHART_MAX = 13_000
const AREA_CHART_MAX = 120
const URBAN_CHART_MAX = 100

/** 不参与大陆省级均值计算的代码 */
const NATIONAL_AVG_EXCLUDE = new Set(['710000', '810000', '820000'])

let cachedNationalAverage: RegionStats | null = null

/**
 * 全国省级平均水平（大陆 31 省区市算术平均，供对比参照）。
 */
export function getNationalAverageStats(): RegionStats {
  if (cachedNationalAverage) return cachedNationalAverage

  const entries = Object.entries(PROVINCE_STATS).filter(
    ([code]) => !NATIONAL_AVG_EXCLUDE.has(code),
  )
  const n = entries.length
  let gdpYi = 0
  let populationWan = 0
  let areaWanKm2 = 0
  let urbanRate = 0

  for (const [, v] of entries) {
    gdpYi += v.gdpYi
    populationWan += v.populationWan
    areaWanKm2 += v.areaWanKm2
    urbanRate += v.urbanRate
  }

  cachedNationalAverage = {
    adcode: '100000',
    year: 2023,
    gdpYi: Math.round(gdpYi / n),
    populationWan: Math.round((populationWan / n) * 10) / 10,
    areaWanKm2: Math.round((areaWanKm2 / n) * 100) / 100,
    urbanRate: Math.round(urbanRate / n),
  }
  return cachedNationalAverage
}

/**
 * 获取地区统计数据；市级无单独条目时按省级比例估算。
 */
export function getRegionStats(
  adcode: string,
  level: 'province' | 'city',
): RegionStats | null {
  if (level === 'province') {
    const raw = PROVINCE_STATS[adcode]
    if (!raw) return null
    return { adcode, ...raw }
  }

  const cityRaw = CITY_STATS[adcode]
  if (cityRaw) {
    return { adcode, ...cityRaw }
  }

  const provinceAdcode = provinceAdcodeFromRegion(adcode)
  const provinceRaw = PROVINCE_STATS[provinceAdcode]
  if (!provinceRaw) return null

  return estimateCityStatsFromProvince(adcode, provinceRaw)
}

/** 按 adcode 生成稳定的省内分摊估算（地图区县等未入库代码） */
function estimateCityStatsFromProvince(
  adcode: string,
  provinceRaw: Omit<RegionStats, 'adcode'>,
): RegionStats {
  let hash = 0
  for (const c of adcode) {
    hash = (hash * 31 + c.charCodeAt(0)) | 0
  }
  const h = Math.abs(hash)
  const rank = 0.35 + (h % 130) / 100
  const share = rank * 0.12

  return {
    adcode,
    year: provinceRaw.year,
    gdpYi: Math.max(50, Math.round(provinceRaw.gdpYi * share)),
    populationWan: Math.max(
      5,
      Math.round(provinceRaw.populationWan * share * 10) / 10,
    ),
    areaWanKm2: Math.max(
      0.1,
      Math.round(provinceRaw.areaWanKm2 * share * 2 * 100) / 100,
    ),
    urbanRate: Math.min(
      95,
      Math.round(provinceRaw.urbanRate * (0.7 + (h % 40) / 100)),
    ),
    estimated: true,
  }
}

/**
 * 转为 3D 柱状图指标（归一化高度 + 展示文案）。
 */
export function statsToChartMetrics(stats: RegionStats): RegionStatsMetric[] {
  return [
    {
      key: 'gdp',
      label: 'GDP',
      value: stats.gdpYi,
      unit: '亿元',
      chartHeight: Math.min(100, (stats.gdpYi / GDP_CHART_MAX) * 100),
      display: `${stats.gdpYi.toLocaleString('zh-CN')} 亿元`,
    },
    {
      key: 'pop',
      label: '常住人口',
      value: stats.populationWan,
      unit: '万人',
      chartHeight: Math.min(100, (stats.populationWan / POP_CHART_MAX) * 100),
      display: `${stats.populationWan.toLocaleString('zh-CN')} 万人`,
    },
    {
      key: 'area',
      label: '面积',
      value: stats.areaWanKm2,
      unit: '万km²',
      chartHeight: Math.min(100, (stats.areaWanKm2 / AREA_CHART_MAX) * 100),
      display: `${stats.areaWanKm2.toLocaleString('zh-CN')} 万km²`,
    },
    {
      key: 'urban',
      label: '城镇化率',
      value: stats.urbanRate,
      unit: '%',
      chartHeight: Math.min(100, (stats.urbanRate / URBAN_CHART_MAX) * 100),
      display: `${stats.urbanRate}%`,
    },
  ]
}
