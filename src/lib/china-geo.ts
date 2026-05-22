import rewind from '@turf/rewind'
import type { GeoPath } from 'd3'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

export interface RegionProperties {
  name: string
  fullname: string
  code: string
  pinyin?: string
  level?: number
}

export type RegionFeature = Feature<Geometry, RegionProperties>

export type RegionCollection = FeatureCollection<Geometry, RegionProperties>

/** @deprecated 使用 RegionCollection */
export type ChinaProvinceCollection = RegionCollection

/** @deprecated 使用 RegionFeature */
export type ChinaProvinceFeature = RegionFeature

const MUNICIPALITY_PREFIXES = new Set(['11', '12', '31', '50'])

/**
 * 仅保留省级要素（六位 adcode、level 1）。
 * @param collection - 全国 GeoJSON
 */
export function filterProvinceFeatures(
  collection: RegionCollection,
): RegionFeature[] {
  return collection.features.filter(
    (f): f is RegionFeature =>
      typeof f.properties?.code === 'string' &&
      f.properties.code.length === 6 &&
      f.properties.code.endsWith('0000') &&
      (f.properties.level === 1 || f.properties.level === undefined),
  )
}

/**
 * 提取省内下一级行政区划（地级市或直辖市区县）。
 * @param collection - 省级 GeoJSON
 * @param provinceAdcode - 省级 adcode
 */
export function filterCityFeatures(
  collection: RegionCollection,
  provinceAdcode: string,
): RegionFeature[] {
  const prefix = provinceAdcode.slice(0, 2)
  const isMunicipality = MUNICIPALITY_PREFIXES.has(prefix)

  return collection.features.filter((f): f is RegionFeature => {
    const code = f.properties?.code
    if (typeof code !== 'string' || code.length !== 6 || code === provinceAdcode) {
      return false
    }
    if (!code.startsWith(prefix)) return false

    const level = f.properties.level
    if (isMunicipality) return level === 3
    return level === 2
  })
}

/**
 * geojson.cn 部分 MultiPolygon 绕序与 d3 不一致，需 rewind 后才能正确绘制。
 * @param features - 区划要素列表
 */
export function prepareMapFeatures(features: RegionFeature[]): RegionFeature[] {
  return features.map((f) => rewind(f, { reverse: true }) as RegionFeature)
}

/** @deprecated 使用 prepareMapFeatures */
export const prepareProvinceFeatures = prepareMapFeatures

/**
 * 过滤投影后异常放大的要素（绕序错误残留）。
 * @param features - 已 rewind 的要素
 * @param path - d3 geoPath
 */
export function filterRenderableFeatures(
  features: RegionFeature[],
  path: GeoPath,
): RegionFeature[] {
  const collection = { type: 'FeatureCollection' as const, features }
  const collectionBounds = path.bounds(collection)
  const maxWidth = collectionBounds[1][0] - collectionBounds[0][0]
  const maxHeight = collectionBounds[1][1] - collectionBounds[0][1]
  const limitW = maxWidth * 0.45
  const limitH = maxHeight * 0.45

  return features.filter((f) => {
    const b = path.bounds(f)
    const w = b[1][0] - b[0][0]
    const h = b[1][1] - b[0][1]
    return w <= limitW && h <= limitH && w > 0 && h > 0
  })
}
