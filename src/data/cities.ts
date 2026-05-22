import type { RegionProperties } from '#/lib/china-geo.ts'
import cityNameOrigins from '#/data/city-name-origins.json'
import { PLATE_BY_ADCODE } from '#/data/plates.ts'
import { getProvinceMeta } from '#/data/provinces.ts'
import { provinceAdcodeFromRegion } from '#/lib/region-adcode.ts'

/**
 * 从典故文案开头提取地名（如「莆田市因…」→ 莆田市，「昌都藏语意为…」→ 昌都）。
 */
export function placeNameFromOrigin(origin: string): string {
  const trimmed = origin.trim()
  if (!trimmed) return ''

  const beforeEthnicMeaning = trimmed.match(
    /^([\u4e00-\u9fa5·]{2,12}?)(?:藏|满|蒙古|维吾尔|哈萨克|朝鲜|彝|壮|苗)语意为/,
  )
  if (beforeEthnicMeaning) return beforeEthnicMeaning[1]

  const bare = trimmed.match(
    /^([\u4e00-\u9fa5·]{2,10}?)(?=因|原为|因位|古称|得名|位于)/,
  )
  if (bare) return bare[1]

  const withSuffix = trimmed.match(
    /^([\u4e00-\u9fa5·]{2,10})(市|区|县|州|盟|地区|林区)(?=[，。；、\s]|因|原为|古称|得名|位于|$)/,
  )
  if (withSuffix) return `${withSuffix[1]}${withSuffix[2]}`

  return ''
}

/** 地级市 / 区 知识卡片 */
export interface CityMeta {
  adcode: string
  name: string
  /** 地名由来（简要） */
  nameOrigin: string
  /** 车牌（通常继承省级简称，部分有字母后缀） */
  platePrefix: string
}

/** 全国地级 / 直辖市区县地名典故（472 条） */
export const CITY_NAME_ORIGINS = cityNameOrigins as Record<string, string>

/**
 * 获取城市元数据；优先使用地名典故库与车牌表。
 * @param adcode - 六位市级 / 区级代码
 * @param props - GeoJSON 属性
 * @param provinceAdcode - 所属省级代码
 */
export function getCityMeta(
  adcode: string,
  props: RegionProperties,
  provinceAdcode: string,
): CityMeta {
  const province = getProvinceMeta(provinceAdcode)
  const name = props.fullname ?? props.name
  const nameOrigin =
    CITY_NAME_ORIGINS[adcode] ??
    `${props.name} 的地名典故资料整理中，欢迎后续补充。`
  const platePrefix =
    PLATE_BY_ADCODE[adcode] ?? province?.platePrefix ?? '—'

  return { adcode, name, nameOrigin, platePrefix }
}

/**
 * 仅凭 adcode 获取城市元数据（用于详情面板 / 深链，无 GeoJSON 时）。
 * @param adcode - 六位市级 / 区级代码
 */
export function getCityMetaFromAdcode(adcode: string): CityMeta | null {
  const origin = CITY_NAME_ORIGINS[adcode]
  if (!origin) return null
  const provinceAdcode = provinceAdcodeFromRegion(adcode)
  const name = placeNameFromOrigin(origin) || adcode
  return getCityMeta(
    adcode,
    { name, fullname: name, code: adcode },
    provinceAdcode,
  )
}
