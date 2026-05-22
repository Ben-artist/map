import {
  CITY_TIMELINES,
  PROVINCE_TIMELINES,
} from '#/data/region-timelines.ts'
import type { RegionTimelineEvent } from '#/lib/region-history-types.ts'

/** 仅匹配朝代专名，避免「清明」「之意」等误识别 */
const DYNASTY_RULES: { pattern: RegExp; dynasty: string }[] = [
  { pattern: /商代|商朝|商都/g, dynasty: '商' },
  { pattern: /西周/g, dynasty: '西周' },
  { pattern: /东周/g, dynasty: '东周' },
  { pattern: /春秋/g, dynasty: '春秋' },
  { pattern: /战国/g, dynasty: '战国' },
  { pattern: /秦朝|秦国|秦代/g, dynasty: '秦' },
  { pattern: /西汉|东汉/g, dynasty: '汉' },
  { pattern: /三国/g, dynasty: '三国' },
  { pattern: /南北朝/g, dynasty: '南北朝' },
  { pattern: /隋朝|隋代/g, dynasty: '隋' },
  { pattern: /唐朝|唐代/g, dynasty: '唐' },
  { pattern: /五代/g, dynasty: '五代' },
  { pattern: /北宋|南宋/g, dynasty: '宋' },
  { pattern: /辽朝|辽代/g, dynasty: '辽' },
  { pattern: /金朝|金代/g, dynasty: '金' },
  { pattern: /元朝|元代/g, dynasty: '元' },
  { pattern: /明朝|明代|明初|明末/g, dynasty: '明' },
  { pattern: /清朝|清代|清初|清末/g, dynasty: '清' },
  { pattern: /民国/g, dynasty: '民国' },
  { pattern: /新中国/g, dynasty: '新中国' },
]

const DYNASTY_YEARS: Record<string, number> = {
  商: -1600,
  西周: -1046,
  东周: -770,
  春秋: -770,
  战国: -475,
  秦: -221,
  汉: -206,
  三国: 220,
  南北朝: 420,
  隋: 581,
  唐: 618,
  五代: 907,
  宋: 960,
  辽: 916,
  金: 1115,
  元: 1271,
  明: 1368,
  清: 1644,
  民国: 1912,
  新中国: 1949,
}

const MIN_TIMELINE_EVENTS = 4
const MIN_DESCRIPTION_LEN = 10

/**
 * 获取地区沿革时间轴；无专条时从地名典故解析生成。
 */
export function getRegionTimeline(
  adcode: string,
  level: 'province' | 'city',
  placeName: string,
  nameOrigin: string,
): RegionTimelineEvent[] {
  if (level === 'city') {
    const cityStored = CITY_TIMELINES[adcode]
    if (cityStored?.length) return cityStored
    return buildTimelineFromOrigin(placeName, nameOrigin)
  }

  const provinceStored = PROVINCE_TIMELINES[adcode]
  if (provinceStored?.length) return provinceStored
  return buildTimelineFromOrigin(placeName, nameOrigin)
}

/**
 * 从地名典故文案生成沿革节点（尽量覆盖文中出现的朝代与关键词）。
 */
function buildTimelineFromOrigin(
  placeName: string,
  nameOrigin: string,
): RegionTimelineEvent[] {
  const text = nameOrigin.trim()
  if (!text) {
    return [
      {
        year: 2000,
        title: '当代建制',
        description: `${placeName} 的沿革资料整理中，欢迎结合地方志补充。`,
      },
    ]
  }

  const events: RegionTimelineEvent[] = []
  const usedKeys = new Set<string>()

  const pushEvent = (event: RegionTimelineEvent) => {
    const desc = event.description.trim()
    if (desc.length < MIN_DESCRIPTION_LEN) return
    if (/^[之意，、「」\s]+$/.test(desc)) return

    const key = `${event.year}-${event.period ?? ''}-${event.title}`
    if (usedKeys.has(key)) return
    usedKeys.add(key)
    events.push({ ...event, description: desc })
  }

  const seenDynasties = new Set<string>()

  for (const { pattern, dynasty } of DYNASTY_RULES) {
    if (seenDynasties.has(dynasty)) continue
    const match = pattern.exec(text)
    if (!match) continue
    seenDynasties.add(dynasty)

    const snippet = extractSentence(text, match.index ?? 0)
    pushEvent({
      year: DYNASTY_YEARS[dynasty] ?? 1000,
      period: dynasty,
      title: `${placeName}·${dynasty}时期`,
      description:
        snippet ||
        `地名沿革与${dynasty}一代的建制、文化密切相关。`,
    })
  }

  const keywordRules: {
    test: RegExp
    year: number
    period?: string
    title: string
    fallback: string
  }[] = [
    {
      test: /商都|商汤|殷墟|甲骨文/,
      year: -1600,
      period: '商',
      title: `${placeName}·商文明`,
      fallback: '地处中原，与早期商文明、都城遗存关系密切。',
    },
    {
      test: /十三朝|六朝|七朝|古都/,
      year: 493,
      period: '古都',
      title: `${placeName}·古都兴盛`,
      fallback: '长期为都城或陪都，留下丰富历史遗存。',
    },
    {
      test: /开埠|租界/,
      year: 1842,
      period: '近代',
      title: `${placeName}·近代开埠`,
      fallback: '近代开埠后商业与市政建设快速发展。',
    },
    {
      test: /铁路|高铁|火车|交通枢/,
      year:  1908,
      period: '近代',
      title: `${placeName}·交通枢纽`,
      fallback: '铁路干线交汇，带动工商业与人口集聚。',
    },
    {
      test: /经济特区|改革开放/,
      year: 1980,
      period: '新中国',
      title: `${placeName}·改革开放`,
      fallback: '改革开放后经济与城市建设提速。',
    },
    {
      test: /自治区|自治州|民族区域/,
      year: 1955,
      period: '新中国',
      title: `${placeName}·民族区域自治`,
      fallback: '实行民族区域自治，建制逐步完善。',
    },
    {
      test: /省会|首府/,
      year: 1954,
      period: '新中国',
      title: `${placeName}·省会（首府）`,
      fallback: '成为省级行政区政治、经济、文化中心。',
    },
  ]

  for (const rule of keywordRules) {
    const match = rule.test.exec(text)
    if (!match) continue
    const snippet = extractSentence(text, match.index ?? 0)
    pushEvent({
      year: rule.year,
      period: rule.period,
      title: rule.title,
      description: snippet.length >= MIN_DESCRIPTION_LEN ? snippet : rule.fallback,
    })
  }

  for (const match of text.matchAll(/(\d{3,4})年/g)) {
    const year = Number.parseInt(match[1]!, 10)
    if (Number.isNaN(year)) continue
    const snippet = extractSentence(text, match.index ?? 0)
    pushEvent({
      year,
      title: `${placeName}·${year}年`,
      description: snippet.endsWith('。') ? snippet : `${snippet}…`,
    })
  }

  const originSentence = extractSentence(text, 0)
  if (
    originSentence.length >= MIN_DESCRIPTION_LEN &&
    !events.some((e) => e.title.includes('得名'))
  ) {
    pushEvent({
      year: 1000,
      period: '地名由来',
      title: `${placeName}得名`,
      description: originSentence,
    })
  }

  if (events.length < MIN_TIMELINE_EVENTS) {
    pushEvent({
      year: 1949,
      period: '新中国',
      title: `${placeName}·当代建制`,
      description: '新中国成立后区划调整频繁，地名与建制逐步稳定。',
    })
    pushEvent({
      year: 2000,
      period: '当代',
      title: `${placeName}·今日概况`,
      description: text.length > 140 ? `${text.slice(0, 140)}…` : text,
    })
  }

  return events
    .sort((a, b) => a.year - b.year)
    .slice(0, 8)
}

/**
 * 提取包含 index 位置的整句（以 。； 为界）。
 */
function extractSentence(text: string, index: number): string {
  let start = index
  while (start > 0 && !/[。；]/.test(text[start - 1]!)) {
    start--
  }
  let end = index
  while (end < text.length && !/[。；]/.test(text[end]!)) {
    end++
  }
  return text.slice(start, end).replace(/^[，、\s]+/, '').trim()
}
