import { parseAdcodeParam } from '#/lib/region-adcode.ts'

/** 首页地图 URL 查询参数 */
export interface MapUrlSearch {
  province?: string
  city?: string
}

/**
 * 解析并校验地图深链 search 参数。
 */
export function validateMapUrlSearch(
  search: Record<string, unknown>,
): MapUrlSearch {
  const province = parseAdcodeParam(search.province)
  const city = parseAdcodeParam(search.city)
  if (city && !province) {
    return { province: `${city.slice(0, 2)}0000`, city }
  }
  return { province, city }
}

/**
 * 生成可分享的地图深链路径（含 query）。
 * @param origin - 站点 origin，默认取当前窗口
 */
export function buildMapShareUrl(
  search: MapUrlSearch,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const url = new URL('/', origin)
  if (search.province) url.searchParams.set('province', search.province)
  if (search.city) url.searchParams.set('city', search.city)
  return url.toString()
}
