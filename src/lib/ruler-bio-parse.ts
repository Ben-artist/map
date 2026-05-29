export interface RulerBioSection {
  title: string | null
  body: string
}

/**
 * 清理 AI 返回中的 Markdown 标记（如 **、单独一行的星号）。
 */
export function normalizeRulerBio(text: string): string {
  return text
    .replace(/^\s*\*{1,3}\s*$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * 将 AI 生平文本解析为「生平」「在位大事」等小节。
 */
export function parseRulerBioSections(bio: string): RulerBioSection[] {
  const cleaned = normalizeRulerBio(bio)

  const sections: RulerBioSection[] = []
  const regex = /(?:^|\n)(生平|在位大事)\s*\n([\s\S]*?)(?=\n(?:生平|在位大事)\s*\n|$)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(cleaned)) !== null) {
    sections.push({
      title: match[1] ?? null,
      body: match[2]?.trim() ?? '',
    })
  }

  if (sections.length > 0) return sections

  return [{ title: null, body: cleaned }]
}
