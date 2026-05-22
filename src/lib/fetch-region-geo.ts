import type { RegionCollection } from '#/lib/china-geo.ts'

const GEO_API = 'https://geojson.cn/api/china/1.6.2'

const cache = new Map<string, RegionCollection>()

/**
 * 按省级 adcode 拉取省内 GeoJSON（含地级市 / 直辖市区县）。
 * @param provinceAdcode - 六位省级代码，如 340000
 */
export async function fetchProvinceGeo(
  provinceAdcode: string,
): Promise<RegionCollection> {
  const cached = cache.get(provinceAdcode)
  if (cached) return cached

  const res = await fetch(`${GEO_API}/${provinceAdcode}.json`)
  if (!res.ok) {
    throw new Error(`无法加载 ${provinceAdcode} 的地图数据（${res.status}）`)
  }

  const data = (await res.json()) as RegionCollection
  cache.set(provinceAdcode, data)
  return data
}
