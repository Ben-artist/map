/** 结构化地名典故 */
export interface StructuredOrigin {
  /** 字源 / 得名含义 */
  etymology: string
  /** 历史沿革 */
  history: string
  /** 地标与文化 */
  landmarks: string
  /** 原始全文 */
  full: string
}

const HISTORY_PATTERN =
  /(?:\d{3,4}年|上古|先秦|春秋|战国|秦|汉|三国|晋|隋|唐|宋|元|明|清|民国|近代|建国|设|置|改名|改称|开埠|建省|成直辖市|成自治区)/

const LANDMARK_PATTERN =
  /(?:山|河|江|湖|海|寺|庙|塔|楼|阁|遗址|长城|博物馆|机场|港|谷|峡|公园|故居|学院|大学|产区|之乡|古都|三角洲|湿地|草原|瀑布|石窟)/

/**
 * 将单段典故文案拆为字源、沿革、地标（规则解析，无人工标注时回退全文）。
 * @param text - 原始典故字符串
 */
export function parseOriginText(text: string): StructuredOrigin {
  const full = text.trim()
  if (!full) {
    return { etymology: '', history: '', landmarks: '', full: '' }
  }

  const parts = full
    .split(/[，；]/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length <= 1) {
    return splitSingleClause(full)
  }

  let etymology = ''
  let history = ''
  const landmarkParts: string[] = []

  for (const part of parts) {
    if (
      !etymology &&
      /因|取|意为|得名|古称|原名|简称|位于|地处/.test(part)
    ) {
      etymology = part
      continue
    }
    if (HISTORY_PATTERN.test(part)) {
      history = history ? `${history}，${part}` : part
      continue
    }
    if (LANDMARK_PATTERN.test(part)) {
      landmarkParts.push(part)
      continue
    }
    if (!etymology) {
      etymology = part
    } else if (!history) {
      history = part
    } else {
      landmarkParts.push(part)
    }
  }

  if (!etymology) etymology = parts[0] ?? full
  if (!history && parts[1] && parts[1] !== etymology) {
    history = parts[1]
  }
  if (landmarkParts.length === 0 && parts.length > 2) {
    landmarkParts.push(...parts.slice(etymology === parts[0] ? 2 : 1))
  }

  return {
    etymology,
    history: history === etymology ? '' : history,
    landmarks: landmarkParts.join('，'),
    full,
  }
}

function splitSingleClause(full: string): StructuredOrigin {
  const etymEnd = full.search(/[；]/)
  const etymology =
    etymEnd > 0 ? full.slice(0, etymEnd).trim() : full

  const rest = etymEnd > 0 ? full.slice(etymEnd + 1).trim() : ''
  if (!rest) {
    return { etymology, history: '', landmarks: '', full }
  }

  const landmarkIdx = rest.search(
    new RegExp(LANDMARK_PATTERN.source),
  )
  if (landmarkIdx > 0) {
    return {
      etymology,
      history: rest.slice(0, landmarkIdx).replace(/^[，；]+/, '').trim(),
      landmarks: rest.slice(landmarkIdx).trim(),
      full,
    }
  }

  return {
    etymology,
    history: HISTORY_PATTERN.test(rest) ? rest : '',
    landmarks: HISTORY_PATTERN.test(rest) ? '' : rest,
    full,
  }
}
