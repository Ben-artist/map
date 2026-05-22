import { createServerFn } from '@tanstack/react-start'
import { fetchProvinceGeoUpstream } from '#/server/region-geo.server.ts'
import type { RegionCollection } from '#/lib/china-geo.ts'

/**
 * 代理拉取省级 GeoJSON（同源请求，避免 geojson.cn 跨域）。
 */
export const fetchProvinceGeoFn = createServerFn({ method: 'POST' })
  .inputValidator((adcode: string) => {
    if (!/^\d{6}$/.test(adcode)) {
      throw new Error('无效的 adcode')
    }
    return adcode
  })
  .handler(async ({ data }): Promise<RegionCollection> => {
    return fetchProvinceGeoUpstream(data)
  })
