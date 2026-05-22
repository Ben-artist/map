import type { MapUrlSearch } from '#/lib/map-url.ts'
import { parseSearchWith, stringifySearchWith } from '@tanstack/react-router'

/**
 * 地图深链使用标准 query（?province=650000），便于复制分享与外部打开。
 */
export const parseMapSearch = parseSearchWith((searchStr) => {
  const params = new URLSearchParams(searchStr)
  const province = params.get('province') ?? undefined
  const city = params.get('city') ?? undefined
  const out: Record<string, string | undefined> = {}
  if (province !== null && province !== '') out.province = province
  if (city !== null && city !== '') out.city = city
  return out
})

export const stringifyMapSearch = stringifySearchWith((search) => {
  const { province, city } = search as MapUrlSearch
  const params = new URLSearchParams()
  if (province) params.set('province', province)
  if (city) params.set('city', city)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
})
