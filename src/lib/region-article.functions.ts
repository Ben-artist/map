import { createServerFn } from '@tanstack/react-start'
import { generateRegionArticleAi } from '#/server/region-article-ai.server.ts'

export interface GenerateRegionArticleInput {
  adcode: string
  level: 'province' | 'city'
}

export interface GenerateRegionArticleOutput {
  adcode: string
  summary: string
  body: string
  source: 'ai'
  cached: boolean
}

/**
 * 按需生成（或读取缓存）AI 地名长文。密钥仅存于服务端环境变量。
 */
export const generateRegionArticle = createServerFn({ method: 'POST' })
  .inputValidator((data: GenerateRegionArticleInput) => {
    if (!data?.adcode || !/^\d{6}$/.test(data.adcode)) {
      throw new Error('无效的 adcode')
    }
    if (data.level !== 'province' && data.level !== 'city') {
      throw new Error('无效的 level')
    }
    return data
  })
  .handler(async ({ data }): Promise<GenerateRegionArticleOutput> => {
    return generateRegionArticleAi(data)
  })
