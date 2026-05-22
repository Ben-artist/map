import { CITY_NAME_ORIGINS, placeNameFromOrigin } from '#/data/cities.ts'
import { PLATE_BY_ADCODE } from '#/data/plates.ts'
import { PROVINCE_BY_ADCODE } from '#/data/provinces.ts'
import { provinceAdcodeFromRegion } from '#/lib/region-adcode.ts'
import {
  getCityStructuredOrigin,
  getProvinceStructuredOrigin,
} from '#/lib/region-origins.ts'
import type { StructuredOrigin } from '#/lib/parse-origin.ts'

export type RegionLevel = 'province' | 'city'

/** 搜索命中项 */
export interface RegionSearchHit {
  adcode: string
  name: string
  level: RegionLevel
  provinceAdcode: string
  platePrefix: string
  subtitle: string
  nameOrigin: string
  structured: StructuredOrigin
  /** 用于模糊匹配的关键词 */
  keywords: string
}

function buildSearchIndex(): RegionSearchHit[] {
  const hits: RegionSearchHit[] = []

  for (const province of Object.values(PROVINCE_BY_ADCODE)) {
    const structured =
      getProvinceStructuredOrigin(province.adcode) ??
      ({ etymology: province.nameOrigin, history: '', landmarks: '', full: province.nameOrigin })
    const keywords = [
      province.name,
      province.capital,
      province.platePrefix,
      structured.etymology,
      structured.history,
      structured.landmarks,
      province.adcode,
    ]
      .filter(Boolean)
      .join(' ')
    hits.push({
      adcode: province.adcode,
      name: province.name,
      level: 'province',
      provinceAdcode: province.adcode,
      platePrefix: province.platePrefix,
      subtitle: `省会 ${province.capital}`,
      nameOrigin: province.nameOrigin,
      structured,
      keywords,
    })
  }

  for (const [adcode, origin] of Object.entries(CITY_NAME_ORIGINS)) {
    const provinceAdcode = provinceAdcodeFromRegion(adcode)
    const province = PROVINCE_BY_ADCODE[provinceAdcode]
    const name = placeNameFromOrigin(origin) || adcode
    const platePrefix = PLATE_BY_ADCODE[adcode] ?? province?.platePrefix ?? '—'
    const structured =
      getCityStructuredOrigin(adcode) ??
      ({ etymology: origin, history: '', landmarks: '', full: origin })
    const keywords = [
      name,
      platePrefix,
      structured.etymology,
      structured.history,
      structured.landmarks,
      adcode,
      province?.name ?? '',
    ]
      .filter(Boolean)
      .join(' ')
    hits.push({
      adcode,
      name,
      level: 'city',
      provinceAdcode,
      platePrefix,
      subtitle: province?.name ?? '市级',
      nameOrigin: origin,
      structured,
      keywords,
    })
  }

  return hits
}

const REGION_SEARCH_INDEX = buildSearchIndex()

/**
 * 按地名、车牌分段搜索行政区。
 * @param query - 用户输入
 * @param limit - 最多返回条数
 */
export function searchRegions(query: string, limit = 12): RegionSearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const scored = REGION_SEARCH_INDEX.map((hit) => {
    const name = hit.name.toLowerCase()
    const etymology = hit.structured.etymology.toLowerCase()
    const history = hit.structured.history.toLowerCase()
    const landmarks = hit.structured.landmarks.toLowerCase()
    const kw = hit.keywords.toLowerCase()

    let score = 0
    if (name === q || hit.platePrefix.toLowerCase() === q) score += 100
    else if (name.startsWith(q)) score += 80
    else if (hit.platePrefix.toLowerCase().startsWith(q)) score += 70
    else if (name.includes(q)) score += 50
    else if (etymology.includes(q)) score += 45
    else if (history.includes(q)) score += 38
    else if (landmarks.includes(q)) score += 32
    else if (kw.includes(q)) score += 25
    else return null

    return { hit, score }
  }).filter((x): x is { hit: RegionSearchHit; score: number } => x !== null)

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.hit)
}

/**
 * 按 adcode 查找索引项。
 */
export function findRegionHit(adcode: string): RegionSearchHit | undefined {
  return REGION_SEARCH_INDEX.find((h) => h.adcode === adcode)
}
