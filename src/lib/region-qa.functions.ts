import { createServerFn } from '@tanstack/react-start'
import {
  askRegionQuestion,
  type AskRegionQuestionInput,
  type AskRegionQuestionResult,
  type RegionQaTurn,
} from '#/server/region-qa.server.ts'

export type { RegionQaTurn, AskRegionQuestionResult }

/**
 * 向 AI 提问当前地区的地名科普问题（千问 + 本地典故上下文）。
 */
export const askRegionQuestionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: AskRegionQuestionInput) => {
    if (!data?.adcode || !/^\d{6}$/.test(data.adcode)) {
      throw new Error('无效的 adcode')
    }
    if (data.level !== 'province' && data.level !== 'city') {
      throw new Error('无效的 level')
    }
    const q = data.question?.trim()
    if (!q || q.length > 500) {
      throw new Error('问题不能为空且不超过 500 字')
    }
    const history = (data.history ?? []).filter(
      (t): t is RegionQaTurn =>
        (t.role === 'user' || t.role === 'assistant') &&
        typeof t.content === 'string' &&
        t.content.trim().length > 0,
    )
    return {
      adcode: data.adcode,
      level: data.level,
      question: q,
      history: history.slice(-8),
    }
  })
  .handler(async ({ data }): Promise<AskRegionQuestionResult> => {
    return askRegionQuestion(data)
  })
