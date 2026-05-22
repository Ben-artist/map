import type { EChartsOption } from 'echarts'
import type { RegionFeature } from '#/lib/china-geo.ts'
import { getCityMeta } from '#/data/cities.ts'
import { getProvinceMeta } from '#/data/provinces.ts'
import { toOneLineSummary } from '#/lib/region-article.ts'
import type { RegionCollection } from '#/lib/china-geo.ts'
import {
  applyMapLayout,
  CHINA_MAP_LAYOUT,
  PROVINCE_MAP_LAYOUT,
} from '#/lib/map-layout.ts'

export const CHINA_MAP_ID = 'china'

/**
 * @param adcode - 省级六位代码
 */
export function provinceMapId(adcode: string): string {
  return `province_${adcode}`
}

/**
 * 转为 ECharts registerMap 可用的 FeatureCollection（确保 name 字段一致）。
 */
export function toRegisterGeoJson(features: RegionFeature[]): RegionCollection {
  return {
    type: 'FeatureCollection',
    features: features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        name: f.properties.name || f.properties.fullname,
      },
    })),
  }
}

interface MapSeriesDataItem {
  name: string
  adcode: string
  value: number
  itemStyle?: {
    areaColor?: string
    borderColor?: string
    borderWidth?: number
  }
}

const HIGHLIGHT_ITEM_STYLE = {
  areaColor: 'rgba(147, 210, 255, 0.72)',
  borderColor: 'rgba(59, 130, 246, 0.55)',
  borderWidth: 2,
}

function withHighlightAdcode(
  data: MapSeriesDataItem[],
  highlightAdcode: string | null,
): MapSeriesDataItem[] {
  if (!highlightAdcode) return data
  return data.map((item) =>
    item.adcode === highlightAdcode
      ? { ...item, itemStyle: HIGHLIGHT_ITEM_STYLE }
      : item,
  )
}

function seriesDataFromFeatures(features: RegionFeature[]): MapSeriesDataItem[] {
  return features.map((f) => ({
    name: f.properties.name || f.properties.fullname,
    adcode: f.properties.code,
    value: 1,
  }))
}

/**
 * 构建 ECharts map 系列基础样式。
 */
function baseMapSeries(
  map: string,
  data: MapSeriesDataItem[],
  labelSize: number,
  roam: boolean | 'move' | 'scale' = false,
  layout = CHINA_MAP_LAYOUT,
  highlightAdcode: string | null = null,
): EChartsOption['series'] {
  const seriesData = withHighlightAdcode(data, highlightAdcode)

  return [
    applyMapLayout(
      {
        type: 'map',
        map,
        roam,
        zoom: 1,
        data: seriesData,
        label: {
          show: true,
          color: '#173a40',
          fontSize: labelSize,
          fontWeight: 600,
        },
        itemStyle: {
          areaColor: 'rgba(79, 184, 178, 0.34)',
          borderColor: 'rgba(50, 143, 151, 0.55)',
          borderWidth: 1,
        },
        emphasis: {
          label: { show: true, color: '#173a40' },
          itemStyle: {
            areaColor: 'rgba(147, 210, 255, 0.72)',
            borderColor: 'rgba(59, 130, 246, 0.45)',
            borderWidth: 1.5,
          },
        },
        select: { disabled: true },
      },
      layout,
    ),
  ]
}

/**
 * 地图 Tooltip HTML。
 */
export function formatMapTooltip(
  adcode: string,
  name: string,
  provinceAdcode: string | null,
): string {
  if (provinceAdcode) {
    const city = getCityMeta(
      adcode,
      { name, fullname: name, code: adcode },
      provinceAdcode,
    )
    const preview = toOneLineSummary(city.nameOrigin)
    return [
      `<div style="font-weight:600;font-size:16px;margin-bottom:4px">${city.name} <span style="opacity:.7">${city.platePrefix}</span></div>`,
      `<div style="font-size:16px;line-height:1.5">${preview}</div>`,
    ].join('')
  }

  const province = getProvinceMeta(adcode)
  if (!province) return `<b>${name}</b>`
  const preview = toOneLineSummary(province.nameOrigin)
  return [
    `<div style="font-weight:600;font-size:16px;margin-bottom:4px">${province.name} <span style="opacity:.7">${province.platePrefix}</span></div>`,
    `<div style="font-size:16px;margin-bottom:4px">省会 ${province.capital}</div>`,
    `<div style="font-size:16px;line-height:1.5;margin-bottom:6px">${preview}</div>`,
    `<div style="font-size:16px;color:#328f97">点击查看各市 →</div>`,
  ].join('')
}

/**
 * 全国省级地图 option。
 */
export function buildChinaMapOption(
  features: RegionFeature[],
  highlightAdcode: string | null = null,
): EChartsOption {
  const data = seriesDataFromFeatures(features)
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(23, 58, 64, 0.18)',
      textStyle: { color: '#173a40', fontSize: 16 },
      formatter: (params) => {
        const p = params as { name?: string; data?: MapSeriesDataItem }
        const adcode = p.data?.adcode ?? ''
        return formatMapTooltip(adcode, p.name ?? '', null)
      },
    },
    series: baseMapSeries(
      CHINA_MAP_ID,
      data,
      16,
      'move',
      CHINA_MAP_LAYOUT,
      highlightAdcode,
    ),
  }
}

/**
 * 省内市级地图 option。
 */
export function buildProvinceMapOption(
  mapId: string,
  features: RegionFeature[],
  provinceAdcode: string,
  highlightAdcode: string | null = null,
): EChartsOption {
  const data = seriesDataFromFeatures(features)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(23, 58, 64, 0.18)',
      textStyle: { color: '#173a40', fontSize: 16 },
      formatter: (params) => {
        const p = params as { name?: string; data?: MapSeriesDataItem }
        const adcode = p.data?.adcode ?? ''
        return formatMapTooltip(adcode, p.name ?? '', provinceAdcode)
      },
    },
    series: baseMapSeries(
      mapId,
      data,
      16,
      true,
      PROVINCE_MAP_LAYOUT,
      highlightAdcode,
    ),
  }
}
