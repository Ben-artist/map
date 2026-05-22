/**
 * 批量生成 AI 地名长文，写入 src/data/region-articles-ai.json
 *
 * 用法：
 *   node --env-file=.env scripts/generate-region-articles.mjs --limit 5
 *   node --env-file=.env scripts/generate-region-articles.mjs --adcode 230100
 *   node --env-file=.env scripts/generate-region-articles.mjs --level province
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const cachePath = join(root, 'src/data/region-articles-ai.json')

const args = process.argv.slice(2)
const limitIdx = args.indexOf('--limit')
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity
const adcodeArg = args.includes('--adcode')
  ? args[args.indexOf('--adcode') + 1]
  : null
const levelArg = args.includes('--level')
  ? args[args.indexOf('--level') + 1]
  : null

const { generateRegionArticleAi } = await import(
  '../src/server/region-article-ai.server.ts'
)
const { CITY_NAME_ORIGINS } = await import('../src/data/cities.ts')
const { PROVINCE_BY_ADCODE } = await import('../src/data/provinces.ts')

/** @type {Record<string, { summary?: string; body?: string }>} */
let cache = {}
try {
  cache = JSON.parse(await readFile(cachePath, 'utf8'))
} catch {
  cache = {}
}

/** @type {{ adcode: string; level: 'province' | 'city' }[]} */
const queue = []

if (adcodeArg) {
  const level =
    levelArg ??
    (adcodeArg.endsWith('0000') ? 'province' : 'city')
  queue.push({ adcode: adcodeArg, level })
} else if (levelArg === 'province') {
  for (const adcode of Object.keys(PROVINCE_BY_ADCODE)) {
    queue.push({ adcode, level: 'province' })
  }
} else {
  for (const adcode of Object.keys(CITY_NAME_ORIGINS)) {
    queue.push({ adcode, level: 'city' })
  }
}

let done = 0
for (const item of queue) {
  if (done >= limit) break
  if (cache[item.adcode]?.body && !args.includes('--force')) {
    console.log(`跳过 ${item.adcode}（已有缓存）`)
    continue
  }
  console.log(`生成 ${item.level} ${item.adcode}…`)
  try {
    const result = await generateRegionArticleAi(item, { skipCache: true })
    cache[item.adcode] = {
      summary: result.summary,
      body: result.body,
    }
    await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`)
    console.log(`  ✓ ${result.summary.slice(0, 40)}… (${result.body.length} 字)`)
    done++
    await new Promise((r) => setTimeout(r, 800))
  } catch (e) {
    console.error(`  ✗ ${item.adcode}`, e)
  }
}

console.log(`完成，共处理 ${done} 条，缓存：${cachePath}`)
