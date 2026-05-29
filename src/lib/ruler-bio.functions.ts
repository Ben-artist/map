import { createServerFn } from '@tanstack/react-start'
import {
  generateRulerBio,
  type RulerBioInput,
  type RulerBioResult,
} from '#/server/ruler-bio.server.ts'

export type { RulerBioInput, RulerBioResult }

/**
 * 获取君主/皇帝生平与在位大事的 AI 解读。
 */
export const getRulerBioFn = createServerFn({ method: 'POST' })
  .inputValidator((data: RulerBioInput) => {
    if (!data?.periodId || typeof data.periodId !== 'string') {
      throw new Error('无效的朝代 id')
    }
    if (!data.periodName?.trim()) {
      throw new Error('无效的朝代名称')
    }
    if (!data.ruler?.name?.trim()) {
      throw new Error('无效的君主姓名')
    }
    return {
      periodId: data.periodId,
      periodName: data.periodName.trim(),
      periodRange: data.periodRange?.trim() ?? '',
      rulerRole: data.rulerRole?.trim(),
      force: data.force === true,
      ruler: {
        name: data.ruler.name.trim(),
        title: data.ruler.title?.trim(),
        reign: data.ruler.reign?.trim(),
        regime: data.ruler.regime?.trim(),
        note: data.ruler.note?.trim(),
      },
    }
  })
  .handler(async ({ data }): Promise<RulerBioResult> => {
    return generateRulerBio(data)
  })
