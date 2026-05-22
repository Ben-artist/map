import { geoCentroid } from 'd3'
import type { RegionFeature } from '#/lib/china-geo.ts'

/**
 * 获取要素经纬度中心点。
 */
export function featureCenter(feature: RegionFeature): [number, number] {
  const c = geoCentroid(feature)
  return [c[0], c[1]]
}
