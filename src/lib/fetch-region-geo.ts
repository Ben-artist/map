import type { RegionCollection } from '#/lib/china-geo.ts'
import { fetchProvinceGeoFn } from '#/lib/region-geo.functions.ts'

const cache = new Map<string, RegionCollection>()

/**
 * 按省级 adcode 拉取省内 GeoJSON（经服务端代理，避免第三方 CORS）。
 * @param provinceAdcode - 六位省级代码，如 340000
 */
export async function fetchProvinceGeo(
  provinceAdcode: string,
): Promise<RegionCollection> {
  const cached = cache.get(provinceAdcode)
  if (cached) return cached

  const data = await fetchProvinceGeoFn({ data: provinceAdcode })
  cache.set(provinceAdcode, data)
  return data
}
