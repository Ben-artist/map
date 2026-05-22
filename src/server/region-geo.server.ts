import type { RegionCollection } from '#/lib/china-geo.ts'

const GEO_API = 'https://geojson.cn/api/china/1.6.2'

const serverCache = new Map<string, RegionCollection>()

/**
 * 在服务端拉取省级 GeoJSON，绕过浏览器对 geojson.cn 重定向的 CORS 限制。
 * @param provinceAdcode - 六位省级代码
 */
export async function fetchProvinceGeoUpstream(
  provinceAdcode: string,
): Promise<RegionCollection> {
  const cached = serverCache.get(provinceAdcode)
  if (cached) return cached

  const res = await fetch(`${GEO_API}/${provinceAdcode}.json`, {
    redirect: 'follow',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`无法加载 ${provinceAdcode} 的地图数据（${res.status}）`)
  }

  const data = (await res.json()) as RegionCollection
  serverCache.set(provinceAdcode, data)
  return data
}
