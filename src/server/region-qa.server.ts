import { CITY_NAME_ORIGINS, placeNameFromOrigin } from '#/data/cities.ts'
import { PROVINCE_BY_ADCODE } from '#/data/provinces.ts'
import { provinceAdcodeFromRegion } from '#/lib/region-adcode.ts'
import {
  defaultNameOrigin,
  getRegionArticle,
} from '#/lib/region-article.ts'
import { getAiCachedArticle } from '#/server/region-article-ai.server.ts'
import { bochaWebSearch, formatBochaContext } from '#/server/ai/bocha.server.ts'
import { qwenChat, type QwenMessage } from '#/server/ai/qwen.server.ts'

export interface RegionQaTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface AskRegionQuestionInput {
  adcode: string
  level: 'province' | 'city'
  question: string
  history?: RegionQaTurn[]
}

export interface AskRegionQuestionResult {
  answer: string
}

const MAX_HISTORY = 8

async function buildRegionContext(
  adcode: string,
  level: 'province' | 'city',
): Promise<string> {
  const nameOrigin = defaultNameOrigin(adcode, level)
  let placeName = ''
  let provinceName: string | undefined
  let extra = ''

  if (level === 'province') {
    const p = PROVINCE_BY_ADCODE[adcode]
    if (!p) return ''
    placeName = p.name
    extra = `省会：${p.capital}；车牌：${p.platePrefix}`
  } else {
    const origin = CITY_NAME_ORIGINS[adcode]
    const provinceAdcode = provinceAdcodeFromRegion(adcode)
    const province = PROVINCE_BY_ADCODE[provinceAdcode]
    placeName = origin ? placeNameFromOrigin(origin) || adcode : adcode
    provinceName = province?.name
    extra = province ? `所属省：${province.name}` : ''
  }

  const article = getRegionArticle(
    adcode,
    level,
    nameOrigin,
    placeName,
    provinceName,
  )

  const aiCached = await getAiCachedArticle(adcode)
  const longBody =
    aiCached?.body?.trim() ||
    article.longForm?.body?.trim() ||
    ''

  const parts = [
    `【当前地区】${placeName}`,
    extra,
    `【一句话概要】${article.summary}`,
    `【地名典故原文】${nameOrigin}`,
  ]
  if (longBody) parts.push(`【详细解读】${longBody}`)
  return parts.filter(Boolean).join('\n')
}

/**
 * 基于本地典故 + 可选联网检索，回答用户关于当前地区的地名科普问题。
 */
export async function askRegionQuestion(
  input: AskRegionQuestionInput,
): Promise<AskRegionQuestionResult> {
  const question = input.question.trim()
  if (!question || question.length > 500) {
    throw new Error('问题不能为空且不超过 500 字')
  }

  const context = await buildRegionContext(input.adcode, input.level)
  if (!context) throw new Error('无法加载该地区资料')

  const placeName =
    input.level === 'province'
      ? PROVINCE_BY_ADCODE[input.adcode]?.name ?? input.adcode
      : placeNameFromOrigin(CITY_NAME_ORIGINS[input.adcode] ?? '') || input.adcode

  const snippets = await bochaWebSearch(
    `${placeName} ${question} 地名 历史`,
    4,
  )
  const webContext = formatBochaContext(snippets)

  const system = `你是「读懂中国」地名科普助手。只回答与当前地区地名由来、历史沿革、地理文化相关的问题。
规则：
1. 优先依据【参考资料】作答，不要编造具体年份或人物，不确定时说「现有资料未明确记载」。
2. 回答使用简体中文，3～8 句，单段连贯文字，不要用列表标题。
3. 不要讨论政治敏感话题，不要推荐旅游行程或商业广告。`

  const userBlock = `【参考资料】
${context}

【联网检索摘要（仅供参考）】
${webContext}

【用户问题】
${question}`

  const history = (input.history ?? []).slice(-MAX_HISTORY)
  const messages: QwenMessage[] = [
    { role: 'system', content: system },
    ...history.map((t) => ({
      role: t.role,
      content: t.content,
    })),
    { role: 'user', content: userBlock },
  ]

  const answer = await qwenChat(messages, {
    temperature: 0.4,
    maxTokens: 600,
  })

  return { answer }
}
