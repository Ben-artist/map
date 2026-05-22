/**
 * 按 city-name-origins 与省级统计生成分市估算数据。
 * 运行：node --import tsx scripts/generate-city-stats.mjs
 */
import { writeFileSync } from 'node:fs'
import origins from '../src/data/city-name-origins.json' with { type: 'json' }
import { PROVINCE_STATS } from '../src/data/region-stats-provinces.ts'
import { CITY_STATS } from '../src/data/region-stats-cities.ts'

function hash(s) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

const byProv = {}
for (const ad of Object.keys(origins)) {
  const p = `${ad.slice(0, 2)}0000`
  ;(byProv[p] ??= []).push(ad)
}

const out = { ...CITY_STATS }
for (const [prov, list] of Object.entries(byProv)) {
  const ps = PROVINCE_STATS[prov]
  if (!ps) continue
  const n = list.length
  for (const ad of list) {
    if (out[ad]) continue
    const h = hash(ad)
    const rank = 0.35 + (h % 130) / 100
    const share = (1 / n) * rank
    out[ad] = {
      year: 2023,
      gdpYi: Math.max(50, Math.round(ps.gdpYi * share)),
      populationWan: Math.max(5, Math.round(ps.populationWan * share * 10) / 10),
      areaWanKm2: Math.max(0.1, Math.round(ps.areaWanKm2 * share * 2 * 100) / 100),
      urbanRate: Math.min(95, Math.round(ps.urbanRate * (0.7 + (h % 40) / 100))),
      estimated: true,
    }
  }
}

const lines = [
  'import type { RegionStats } from "#/lib/region-stats-types.ts"',
  '',
  '/** 地级市统计（含估算，按省总量分摊至各市） */',
  'export const CITY_STATS: Record<string, Omit<RegionStats, "adcode">> = {',
]
for (const [k, v] of Object.entries(out).sort((a, b) => a[0].localeCompare(b[0]))) {
  const est = v.estimated ? ', estimated: true' : ''
  lines.push(
    `  '${k}': { year: ${v.year}, gdpYi: ${v.gdpYi}, populationWan: ${v.populationWan}, areaWanKm2: ${v.areaWanKm2}, urbanRate: ${v.urbanRate}${est} },`,
  )
}
lines.push('}', '')

writeFileSync('./src/data/region-stats-cities.ts', lines.join('\n'))
console.log(`Wrote ${Object.keys(out).length} city stats`)
