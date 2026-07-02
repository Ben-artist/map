import type { RegionCollection } from '#/lib/china-geo.ts'

const cache = new Map<string, RegionCollection>()

/**
 * 省级 GeoJSON API 路径（随 Vite base 适配 / 与 /map/）。
 * @param provinceAdcode - 六位省级代码
 */
function regionGeoApiUrl(provinceAdcode: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return new URL(`api/region-geo/${provinceAdcode}`, base).pathname
}

/**
 * 按省级 adcode 拉取省内 GeoJSON（经同源 API 代理，避免第三方 CORS）。
 * @param provinceAdcode - 六位省级代码，如 340000
 */
export async function fetchProvinceGeo(
  provinceAdcode: string,
): Promise<RegionCollection> {
  const cached = cache.get(provinceAdcode)
  if (cached) return cached

  const res = await fetch(regionGeoApiUrl(provinceAdcode), {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    let message = `无法加载 ${provinceAdcode} 的地图数据（${res.status}）`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  const data = (await res.json()) as RegionCollection
  cache.set(provinceAdcode, data)
  return data
}
