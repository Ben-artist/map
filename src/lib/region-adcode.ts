/**
 * 由区县 / 市级 adcode 推导所属省级代码。
 * @param adcode - 六位行政区划代码
 */
export function provinceAdcodeFromRegion(adcode: string): string {
  return `${adcode.slice(0, 2)}0000`
}

/**
 * 是否为省级 adcode（末四位为 0000）。
 */
export function isProvinceAdcode(adcode: string): boolean {
  return /^\d{6}$/.test(adcode) && adcode.endsWith('0000')
}

/**
 * 校验 search 参数中的 adcode（兼容 JSON 解析出的数字、带引号字符串）。
 */
export function parseAdcodeParam(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined

  let raw = ''
  if (typeof value === 'string') {
    raw = value.trim().replace(/^["']|["']$/g, '')
  } else if (typeof value === 'number' && Number.isFinite(value)) {
    raw = String(Math.trunc(value)).padStart(6, '0')
  }

  return /^\d{6}$/.test(raw) ? raw : undefined
}
