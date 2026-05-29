import type { ChinaHistoryPeriod } from '#/lib/china-history-types.ts'
import { CHINA_HISTORY_RULERS } from '#/data/china-history-rulers.ts'

/**
 * 商朝至新中国成立通史时间轴（教学示意，年代可与教材对照）。
 * 按时间从早到晚排列。
 */
type ChinaHistoryPeriodMeta = Omit<ChinaHistoryPeriod, 'rulers'>

const CHINA_HISTORY_PERIOD_META: ChinaHistoryPeriodMeta[] = [
  {
    id: 'shang',
    name: '商',
    rangeLabel: '约前1600—前1046',
    startYear: -1600,
    endYear: -1046,
    summary: '青铜文明成熟，甲骨文与都城考古印证早期国家形态。',
    rulerRole: '商王',
  },
  {
    id: 'zhou-west',
    name: '西周',
    rangeLabel: '前1046—前771',
    startYear: -1046,
    endYear: -771,
    summary: '分封制与宗法制确立，礼乐文明影响深远。',
    rulerRole: '周天子',
  },
  {
    id: 'zhou-east',
    name: '东周（春秋战国）',
    rangeLabel: '前770—前221',
    startYear: -770,
    endYear: -221,
    summary: '诸侯争霸、变法图强，思想百家争鸣，走向统一。',
    rulerRole: '周天子',
  },
  {
    id: 'qin',
    name: '秦',
    rangeLabel: '前221—前207',
    startYear: -221,
    endYear: -207,
    summary: '首次完成大一统，确立皇帝制度与郡县制。',
    rulerRole: '皇帝',
  },
  {
    id: 'han',
    name: '汉',
    rangeLabel: '前202—220',
    startYear: -202,
    endYear: 220,
    summary: '西汉开国、东汉延续，丝绸之路开通，儒学成为正统。',
    rulerRole: '皇帝',
  },
  {
    id: 'three-kingdoms',
    name: '三国',
    rangeLabel: '220—280',
    startYear: 220,
    endYear: 280,
    summary: '魏蜀吴鼎立，战争频繁亦见人才辈出。',
    rulerRole: '皇帝',
  },
  {
    id: 'jin',
    name: '晋',
    rangeLabel: '265—420',
    startYear: 265,
    endYear: 420,
    summary: '短暂统一后内乱外患，衣冠南渡推动江南开发。',
    rulerRole: '皇帝',
  },
  {
    id: 'north-south',
    name: '南北朝',
    rangeLabel: '420—589',
    startYear: 420,
    endYear: 589,
    summary: '南北政权并立，民族融合与佛教艺术繁荣。',
    rulerRole: '皇帝',
  },
  {
    id: 'sui',
    name: '隋',
    rangeLabel: '581—618',
    startYear: 581,
    endYear: 618,
    summary: '再统天下，开凿大运河，创立科举雏形。',
    rulerRole: '皇帝',
  },
  {
    id: 'tang',
    name: '唐',
    rangeLabel: '618—907',
    startYear: 618,
    endYear: 907,
    summary: '国力强盛、文化开放，诗歌与丝路贸易达到高峰。',
    rulerRole: '皇帝',
  },
  {
    id: 'five-dynasties',
    name: '五代十国',
    rangeLabel: '907—979',
    startYear: 907,
    endYear: 979,
    summary: '政权更迭频繁，南方经济继续发展。',
    rulerRole: '皇帝',
  },
  {
    id: 'song',
    name: '宋',
    rangeLabel: '960—1279',
    startYear: 960,
    endYear: 1279,
    summary: '商品经济繁荣，科技与文化成就突出，后期面临北方压力。',
    rulerRole: '皇帝',
  },
  {
    id: 'yuan',
    name: '元',
    rangeLabel: '1271—1368',
    startYear: 1271,
    endYear: 1368,
    summary: '蒙古族建立大一统王朝，疆域辽阔，促进东西方交流。',
    rulerRole: '皇帝',
  },
  {
    id: 'ming',
    name: '明',
    rangeLabel: '1368—1644',
    startYear: 1368,
    endYear: 1644,
    summary: '强化中央集权，郑和下西洋，后期海禁与财政危机交织。',
    rulerRole: '皇帝',
  },
  {
    id: 'qing',
    name: '清',
    rangeLabel: '1644—1912',
    startYear: 1644,
    endYear: 1912,
    summary: '最后一代封建王朝，前期疆域巩固，后期面临列强冲击与变法求存。',
    rulerRole: '皇帝',
  },
  {
    id: 'republic',
    name: '中华民国',
    rangeLabel: '1912—1949',
    startYear: 1912,
    endYear: 1949,
    summary: '共和体制建立，经历军阀混战、抗战与内战，社会剧烈变革。',
    rulerRole: '国家元首',
  },
  {
    id: 'prc',
    name: '中华人民共和国',
    rangeLabel: '1949—',
    startYear: 1949,
    endYear: 1949,
    summary: '中国人民站起来了，开启社会主义革命与建设新时期。',
    rulerRole: '主要领导人',
  },
]

export const CHINA_HISTORY_PERIODS: ChinaHistoryPeriod[] = CHINA_HISTORY_PERIOD_META.map(
  (period) => ({
    ...period,
    rulers: CHINA_HISTORY_RULERS[period.id] ?? [],
  }),
)

/** 按 id 查找朝代/时期 */
export function getChinaHistoryPeriod(id: string): ChinaHistoryPeriod | undefined {
  return CHINA_HISTORY_PERIODS.find((p) => p.id === id)
}
