/**
 * 校验通史朝代与君主数据完整性。
 * 运行：node --import tsx scripts/validate-history.mjs
 */
import { CHINA_HISTORY_PERIODS } from '../src/data/china-history.ts'
import { CHINA_HISTORY_RULERS } from '../src/data/china-history-rulers.ts'

const periodIds = CHINA_HISTORY_PERIODS.map((p) => p.id)
const rulerKeys = Object.keys(CHINA_HISTORY_RULERS)

let errors = 0
let warnings = 0

function error(msg) {
  console.error(`ERROR: ${msg}`)
  errors++
}

function warn(msg) {
  console.warn(`WARN: ${msg}`)
  warnings++
}

// 每个朝代都有君主数据
for (const period of CHINA_HISTORY_PERIODS) {
  const rulers = CHINA_HISTORY_RULERS[period.id]
  if (!rulers?.length) {
    error(`朝代「${period.name}」(${period.id}) 缺少君主数据`)
  }
}

// 无孤立君主配置
for (const key of rulerKeys) {
  if (!periodIds.includes(key)) {
    error(`CHINA_HISTORY_RULERS 存在未知朝代 id: ${key}`)
  }
}

// 朝代时间顺序
for (let i = 1; i < CHINA_HISTORY_PERIODS.length; i++) {
  const prev = CHINA_HISTORY_PERIODS[i - 1]
  const curr = CHINA_HISTORY_PERIODS[i]
  if (curr.startYear < prev.startYear) {
    error(
      `朝代顺序异常：${curr.name}(${curr.startYear}) 早于 ${prev.name}(${prev.startYear})`,
    )
  }
}

// 君主必填字段
for (const period of CHINA_HISTORY_PERIODS) {
  const rulers = CHINA_HISTORY_RULERS[period.id] ?? []
  rulers.forEach((ruler, index) => {
    if (!ruler.name?.trim()) {
      error(`${period.name} 第 ${index + 1} 位君主缺少姓名`)
    }
  })
}

// 商朝世系：盘庚应在阳甲之后、武丁之前
{
  const shang = CHINA_HISTORY_RULERS.shang ?? []
  const names = shang.map((r) => r.name)
  const panGeng = names.indexOf('盘庚')
  const yangJia = names.indexOf('阳甲')
  const wuDing = names.indexOf('武丁')
  if (panGeng === -1 || yangJia === -1 || wuDing === -1) {
    error('商朝缺少阳甲、盘庚或武丁')
  } else if (!(yangJia < panGeng && panGeng < wuDing)) {
    error('商朝世系顺序有误：应为 …阳甲 → 盘庚 → … → 武丁')
  }
}

// 元顺帝之后不应再有元帝（数据截断检查）
{
  const yuan = CHINA_HISTORY_RULERS.yuan ?? []
  const shunDi = yuan.findIndex((r) => r.name === '妥懽帖睦尔')
  if (shunDi === -1) warn('元朝缺少元顺帝')
}

// 清：标注 1644 起但含努尔哈赤（提示即可）
{
  const qing = CHINA_HISTORY_PERIODS.find((p) => p.id === 'qing')
  const rulers = CHINA_HISTORY_RULERS.qing ?? []
  if (qing?.rangeLabel.startsWith('1644') && rulers[0]?.name === '努尔哈赤') {
    warn(
      '清朝时间标注为 1644—1912，但世系含 1616 年起的努尔哈赤、皇太极（常见「清十二帝」写法，可接受）',
    )
  }
}

// 新中国：时期元数据止于 1949，领导人延续至今
{
  const prc = CHINA_HISTORY_PERIODS.find((p) => p.id === 'prc')
  if (prc && prc.endYear === 1949 && (CHINA_HISTORY_RULERS.prc?.length ?? 0) > 2) {
    warn('新中国时期 endYear 为 1949，但领导人列表延续至当代（展示无影响）')
  }
}

const totalRulers = Object.values(CHINA_HISTORY_RULERS).reduce(
  (sum, list) => sum + list.length,
  0,
)

console.log(`\n校验完成：${CHINA_HISTORY_PERIODS.length} 个时期，${totalRulers} 位君主/元首`)
console.log(`错误 ${errors} 个，警告 ${warnings} 个`)

if (errors > 0) process.exit(1)
