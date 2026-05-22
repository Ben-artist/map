import { CITY_NAME_ORIGINS } from '#/data/cities.ts'
import regionArticlesAiJson from '#/data/region-articles-ai.json'
import regionArticlesJson from '#/data/region-articles.json'
import { PROVINCE_BY_ADCODE, type ProvinceMeta } from '#/data/provinces.ts'
import { parseOriginText } from '#/lib/parse-origin.ts'

/** 可展开长文（单段连贯正文） */
export interface RegionArticleLongForm {
  body: string
}

/** 人工精编条目（JSON）；兼容旧版 sections */
export interface RegionArticleEntry {
  summary?: string
  body?: string
  sections?: { title: string; body: string }[]
}

export type RegionArticleSource = 'manual' | 'ai' | 'builtin'

export interface RegionArticleView {
  /** 一句话概要（地图 / 面板首行） */
  summary: string
  /** 展开后的长文；无则不可展开 */
  longForm: RegionArticleLongForm | null
  hasExpandable: boolean
  /** 内容来源 */
  source: RegionArticleSource
  /** 展开时可调用 AI 生成更详长文 */
  canEnhanceWithAi: boolean
}

const MANUAL_ARTICLES = regionArticlesJson as Record<string, RegionArticleEntry>
const AI_ARTICLES = regionArticlesAiJson as Record<string, RegionArticleEntry>

/** 低于该字数且为内置文案时，建议走 AI 增强 */
export const AI_ENHANCE_MIN_CHARS = 280

const PLACEHOLDER_PATTERN = /资料整理中|欢迎后续补充/

/**
 * 从典故全文提取一句话概要。
 * @param text - 原始典故
 * @param maxLen - 最大字符数（含省略号）
 */
export function toOneLineSummary(text: string, maxLen = 72): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  const first =
    trimmed.split(/[。；\n]/).find((p) => p.trim().length > 0)?.trim() ??
    trimmed
  const withPeriod =
    first.endsWith('。') || first.endsWith('；') ? first : `${first}。`
  if (withPeriod.length <= maxLen) return withPeriod
  return `${withPeriod.slice(0, maxLen - 1)}…`
}

/**
 * 将逗号分句的典故整理为连贯段落。
 * @param text - 原始典故全文
 */
export function originToParagraph(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''

  if (/[。！？]$/.test(trimmed) && !/[，；]/.test(trimmed)) {
    return trimmed
  }

  const clauses = trimmed
    .split(/[，；]/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (clauses.length <= 1) {
    return trimmed.endsWith('。') ? trimmed : `${trimmed}。`
  }

  return clauses
    .map((clause) => (clause.endsWith('。') ? clause : `${clause}。`))
    .join('')
}

/**
 * 多段文案合并为单段（句末补全句号）。
 */
function joinParagraph(...parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.endsWith('。') ? p : `${p}。`))
    .join('')
}

function resolveManualBody(entry: RegionArticleEntry): string {
  if (entry.body?.trim()) return entry.body.trim()
  if (entry.sections?.length) {
    return joinParagraph(...entry.sections.map((s) => s.body))
  }
  return ''
}

function isPlaceholderOrigin(text: string): boolean {
  return PLACEHOLDER_PATTERN.test(text)
}

/**
 * 由省级元数据生成默认可展开长文。
 */
function buildProvinceLongForm(province: ProvinceMeta): RegionArticleLongForm {
  const structured = parseOriginText(province.nameOrigin)
  const parts = [
    structured.etymology,
    structured.history,
    structured.landmarks,
  ].filter((p) => p.trim())

  if (parts.length === 0) {
    parts.push(province.nameOrigin)
  }

  parts.push(
    `${province.name}现行省会为${province.capital}，机动车号牌简称「${province.platePrefix.replace(/\s*\/\s*/, ' / ')}」。`,
  )

  return { body: joinParagraph(...parts) }
}

/**
 * 由市级典故生成可展开长文（优先使用全文，避免拆成过短小节）。
 */
function buildCityLongForm(
  nameOrigin: string,
  placeName: string,
  provinceName?: string,
): RegionArticleLongForm | null {
  if (isPlaceholderOrigin(nameOrigin)) return null

  let body = originToParagraph(nameOrigin)

  if (placeName && provinceName) {
    body = joinParagraph(
      body,
      `${placeName}隶属${provinceName}，是了解该省地名脉络的重要节点之一。`,
    )
  }

  const summary = toOneLineSummary(nameOrigin)
  if (body.length < 40 || body.length <= summary.length + 6) {
    return null
  }

  return { body }
}

/**
 * 获取地区「一句话 + 长文」展示数据。
 * @param adcode - 省级或市级 adcode
 * @param level - 行政层级
 * @param nameOrigin - 默认典故全文（无人工条目时使用）
 * @param placeName - 地名（市级生成兜底文案用）
 * @param provinceName - 所属省名（市级补充语境）
 */
export function getRegionArticle(
  adcode: string,
  level: 'province' | 'city',
  nameOrigin: string,
  placeName = '',
  provinceName?: string,
): RegionArticleView {
  const manual = MANUAL_ARTICLES[adcode]
  const aiEntry = AI_ARTICLES[adcode]

  let longForm: RegionArticleLongForm | null = null
  let source: RegionArticleSource = 'builtin'

  const manualBody = manual ? resolveManualBody(manual) : ''
  const aiBody = aiEntry ? resolveManualBody(aiEntry) : ''

  if (manualBody) {
    longForm = { body: manualBody }
    source = 'manual'
  } else if (aiBody) {
    longForm = { body: aiBody }
    source = 'ai'
  } else if (level === 'province') {
    const province = PROVINCE_BY_ADCODE[adcode]
    if (province) longForm = buildProvinceLongForm(province)
  } else {
    longForm = buildCityLongForm(nameOrigin, placeName, provinceName)
  }

  const summary =
    manual?.summary?.trim() ||
    aiEntry?.summary?.trim() ||
    toOneLineSummary(nameOrigin)

  const bodyLen = longForm?.body.length ?? 0
  const hasBody = bodyLen > 0
  const canEnhanceWithAi = source === 'builtin' && !isPlaceholderOrigin(nameOrigin)

  return {
    summary,
    longForm: hasBody ? longForm : null,
    hasExpandable: hasBody || canEnhanceWithAi,
    source,
    canEnhanceWithAi,
  }
}

/**
 * 按 adcode 取默认典故全文（省 / 市数据表）。
 */
export function defaultNameOrigin(
  adcode: string,
  level: 'province' | 'city',
): string {
  if (level === 'province') {
    return PROVINCE_BY_ADCODE[adcode]?.nameOrigin ?? ''
  }
  return CITY_NAME_ORIGINS[adcode] ?? ''
}
