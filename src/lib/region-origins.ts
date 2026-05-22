import { CITY_NAME_ORIGINS } from '#/data/cities.ts'
import { PROVINCE_BY_ADCODE } from '#/data/provinces.ts'
import {
  parseOriginText,
  type StructuredOrigin,
} from '#/lib/parse-origin.ts'

const cityStructuredCache = new Map<string, StructuredOrigin>()
const provinceStructuredCache = new Map<string, StructuredOrigin>()

for (const [adcode, text] of Object.entries(CITY_NAME_ORIGINS)) {
  cityStructuredCache.set(adcode, parseOriginText(text))
}

for (const province of Object.values(PROVINCE_BY_ADCODE)) {
  provinceStructuredCache.set(
    province.adcode,
    parseOriginText(province.nameOrigin),
  )
}

/**
 * 获取市级结构化典故。
 */
export function getCityStructuredOrigin(adcode: string): StructuredOrigin | null {
  return cityStructuredCache.get(adcode) ?? null
}

/**
 * 获取省级结构化典故。
 */
export function getProvinceStructuredOrigin(
  adcode: string,
): StructuredOrigin | null {
  return provinceStructuredCache.get(adcode) ?? null
}

/**
 * 按省 / 市 adcode 获取结构化典故。
 */
export function getStructuredOrigin(
  adcode: string,
  level: 'province' | 'city',
): StructuredOrigin | null {
  return level === 'province'
    ? getProvinceStructuredOrigin(adcode)
    : getCityStructuredOrigin(adcode)
}
