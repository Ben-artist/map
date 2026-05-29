import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { bochaWebSearch, formatBochaContext } from '#/server/ai/bocha.server.ts'
import { qwenChat, type QwenMessage } from '#/server/ai/qwen.server.ts'
import { normalizeRulerBio } from '#/lib/ruler-bio-parse.ts'

export interface RulerBioRulerInput {
  name: string
  title?: string
  reign?: string
  regime?: string
  note?: string
}

export interface RulerBioInput {
  periodId: string
  periodName: string
  periodRange: string
  rulerRole?: string
  ruler: RulerBioRulerInput
  /** 为 true 时跳过缓存，重新请求 AI */
  force?: boolean
}

export interface RulerBioResult {
  bio: string
  cached: boolean
}

const RULER_BIO_CACHE_PATH = join(
  process.cwd(),
  'src/data/ruler-bios-ai.json',
)

let memoryCache: Record<string, string> | null = null

/**
 * @returns 君主缓存键（朝代 + 称号 + 姓名 + 政权）
 */
export function buildRulerBioCacheKey(input: RulerBioInput): string {
  const { periodId, ruler } = input
  return [periodId, ruler.title ?? '', ruler.name, ruler.regime ?? '']
    .join(':')
    .toLowerCase()
}

async function loadRulerBioCache(): Promise<Record<string, string>> {
  if (memoryCache) return memoryCache
  try {
    const raw = await readFile(RULER_BIO_CACHE_PATH, 'utf8')
    memoryCache = JSON.parse(raw) as Record<string, string>
  } catch {
    memoryCache = {}
  }
  return memoryCache
}

async function saveRulerBioCache(cache: Record<string, string>): Promise<void> {
  memoryCache = cache
  await writeFile(RULER_BIO_CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8')
}

function formatRulerLabel(ruler: RulerBioRulerInput): string {
  const parts = [ruler.title, ruler.name].filter(Boolean)
  if (ruler.regime) parts.push(`（${ruler.regime}）`)
  return parts.join(' · ')
}

/**
 * 生成君主生平与在位大事的 AI 解读（带服务端 JSON 缓存）。
 */
export async function generateRulerBio(
  input: RulerBioInput,
): Promise<RulerBioResult> {
  const cacheKey = buildRulerBioCacheKey(input)
  const cache = await loadRulerBioCache()

  if (!input.force && cache[cacheKey]) {
    return { bio: cache[cacheKey], cached: true }
  }

  const { periodName, periodRange, rulerRole, ruler } = input
  const rulerLabel = formatRulerLabel(ruler)

  const searchQuery = [
    periodName,
    ruler.title,
    ruler.name,
    ruler.regime,
    '生平',
    '在位',
    '历史',
  ]
    .filter(Boolean)
    .join(' ')

  const snippets = await bochaWebSearch(searchQuery, 5)
  const webContext = formatBochaContext(snippets)

  const roleHint = rulerRole ?? '统治者'

  const system = `你是「读懂中国」历史科普助手。根据用户指定的历史人物，撰写简明、可读的科普解读。
规则：
1. 使用简体中文，分两个小节，标题分别为「生平」与「在位大事」，每节 3～6 句连贯文字，不要用编号列表。
2. 不要使用 Markdown 或任何格式符号（禁止 **、#、- 列表等），小节标题只写纯文字「生平」「在位大事」并单独占一行。
3. 优先依据参考资料；年代久远或史载不一之处用「约」「一说」等表述，不要编造具体细节。
4. 语气客观中立，适合普通读者阅读。
5. 若人物并非皇帝（如民国总统、新中国国家主席），勿称「皇帝」，按其历史身份叙述。`

  const userBlock = `【朝代/时期】${periodName}（${periodRange}）
【身份】${roleHint}
【人物】${rulerLabel}
【在位】${ruler.reign ?? '不详'}
${ruler.note ? `【备注】${ruler.note}` : ''}

【联网检索摘要（仅供参考）】
${webContext}

请撰写该人物的「生平」与「在位大事」。`

  const messages: QwenMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: userBlock },
  ]

  const raw = await qwenChat(messages, {
    temperature: 0.45,
    maxTokens: 900,
  })

  const bio = normalizeRulerBio(raw)
  cache[cacheKey] = bio
  await saveRulerBioCache(cache)

  return { bio, cached: false }
}
