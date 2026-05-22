import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CITY_NAME_ORIGINS, placeNameFromOrigin } from '#/data/cities.ts'
import { PROVINCE_BY_ADCODE } from '#/data/provinces.ts'
import { provinceAdcodeFromRegion } from '#/lib/region-adcode.ts'
import { toOneLineSummary } from '#/lib/region-article.ts'
import type { RegionArticleEntry } from '#/lib/region-article.ts'
import { bochaWebSearch, formatBochaContext } from '#/server/ai/bocha.server.ts'
import { qwenChat } from '#/server/ai/qwen.server.ts'

export interface GenerateArticleInput {
  adcode: string
  level: 'province' | 'city'
}

export interface GenerateArticleResult {
  adcode: string
  summary: string
  body: string
  source: 'ai'
  cached: boolean
}

const AI_CACHE_PATH = join(
  process.cwd(),
  'src/data/region-articles-ai.json',
)

let memoryCache: Record<string, RegionArticleEntry> | null = null

async function loadAiCache(): Promise<Record<string, RegionArticleEntry>> {
  if (memoryCache) return memoryCache
  try {
    const raw = await readFile(AI_CACHE_PATH, 'utf8')
    memoryCache = JSON.parse(raw) as Record<string, RegionArticleEntry>
  } catch {
    memoryCache = {}
  }
  return memoryCache
}

async function saveAiCache(
  cache: Record<string, RegionArticleEntry>,
): Promise<void> {
  memoryCache = cache
  await writeFile(AI_CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')
}

function resolveRegionFacts(input: GenerateArticleInput): {
  placeName: string
  provinceName?: string
  capital?: string
  platePrefix?: string
  nameOrigin: string
} {
  if (input.level === 'province') {
    const p = PROVINCE_BY_ADCODE[input.adcode]
    if (!p) throw new Error(`未知省级代码 ${input.adcode}`)
    return {
      placeName: p.name,
      capital: p.capital,
      platePrefix: p.platePrefix,
      nameOrigin: p.nameOrigin,
    }
  }

  const origin = CITY_NAME_ORIGINS[input.adcode]
  if (!origin) throw new Error(`未知市级代码 ${input.adcode}`)
  const provinceAdcode = provinceAdcodeFromRegion(input.adcode)
  const province = PROVINCE_BY_ADCODE[provinceAdcode]
  return {
    placeName: placeNameFromOrigin(origin) || input.adcode,
    provinceName: province?.name,
    capital: province?.capital,
    platePrefix: province?.platePrefix,
    nameOrigin: origin,
  }
}

function parseModelJson(text: string): { summary: string; body: string } {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = fenced ? fenced[1].trim() : trimmed

  try {
    const parsed = JSON.parse(jsonStr) as { summary?: string; body?: string }
    const summary = parsed.summary?.trim() ?? ''
    const body = parsed.body?.trim() ?? ''
    if (summary && body) return { summary, body }
  } catch {
    /* fall through */
  }

  const summaryMatch = trimmed.match(/["']?summary["']?\s*[:：]\s*["']?([^"'\n]+)/i)
  const bodyMatch = trimmed.match(/["']?body["']?\s*[:：]\s*["']?([\s\S]+)/i)
  if (summaryMatch && bodyMatch) {
    return {
      summary: summaryMatch[1].trim(),
      body: bodyMatch[1].replace(/["'}\s]+$/g, '').trim(),
    }
  }

  throw new Error('无法解析模型返回的 JSON')
}

/**
 * 使用博查检索 + 千问生成地名科普长文，并写入 AI 缓存文件。
 */
export async function generateRegionArticleAi(
  input: GenerateArticleInput,
  options?: { skipCache?: boolean },
): Promise<GenerateArticleResult> {
  const cache = await loadAiCache()
  if (!options?.skipCache && cache[input.adcode]?.body) {
    const hit = cache[input.adcode]
    return {
      adcode: input.adcode,
      summary: hit.summary ?? toOneLineSummary(hit.body ?? ''),
      body: hit.body ?? '',
      source: 'ai',
      cached: true,
    }
  }

  const facts = resolveRegionFacts(input)
  const searchQuery = `${facts.placeName} 地名由来 历史沿革 得名`
  const snippets = await bochaWebSearch(searchQuery, 6)
  const webContext = formatBochaContext(snippets)

  const levelLabel = input.level === 'province' ? '省级行政区' : '地级市/区'
  const extra =
    input.level === 'province'
      ? `省会：${facts.capital ?? '—'}；车牌：${facts.platePrefix ?? '—'}`
      : `所属省：${facts.provinceName ?? '—'}`

  const system = `你是「读懂中国」地名科普编辑。只写地名由来、建置沿革、地理文化，不写名人八卦、不编造无依据的精确年份。
输出必须是合法 JSON，且只有 summary、body 两个字段：
- summary：一句话，不超过 80 字，以句号结尾
- body：单段连贯中文，350～550 字，不分小标题、不用列表，以句号结尾
不确定的史实用「一说」「相传」。不要输出 markdown。`

  const user = `请为以下${levelLabel}撰写地名解读。

地名：${facts.placeName}
${extra}
已有典故（必须吸收，可润色扩写，不可矛盾）：${facts.nameOrigin}

联网检索参考（仅供参考，请甄别）：
${webContext}

请输出 JSON：{"summary":"...","body":"..."}`

  const raw = await qwenChat([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ])

  const { summary, body } = parseModelJson(raw)
  const entry: RegionArticleEntry = { summary, body }
  cache[input.adcode] = entry
  await saveAiCache(cache)

  return {
    adcode: input.adcode,
    summary,
    body,
    source: 'ai',
    cached: false,
  }
}

/**
 * 读取 AI 缓存条目（不触发生成）。
 */
export async function getAiCachedArticle(
  adcode: string,
): Promise<RegionArticleEntry | null> {
  const cache = await loadAiCache()
  return cache[adcode] ?? null
}
