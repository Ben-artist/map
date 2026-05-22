export interface BochaSearchSnippet {
  title: string
  snippet: string
  url?: string
}

/**
 * 博查 Web Search：为地名解读检索参考摘要。
 * @param query - 搜索词
 * @param count - 返回条数
 */
export async function bochaWebSearch(
  query: string,
  count = 5,
): Promise<BochaSearchSnippet[]> {
  const apiKey = process.env.BOCHA_API_KEY
  if (!apiKey) return []

  const res = await fetch('https://api.bochaai.com/v1/web-search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      freshness: 'noLimit',
      summary: true,
      count,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.warn(`博查搜索失败 ${res.status}: ${errText.slice(0, 200)}`)
    return []
  }

  const json = (await res.json()) as {
    data?: {
      webPages?: {
        value?: {
          name?: string
          title?: string
          snippet?: string
          summary?: string
          url?: string
        }[]
      }
    }
    webPages?: {
      value?: {
        name?: string
        title?: string
        snippet?: string
        summary?: string
        url?: string
      }[]
    }
  }

  const pages =
    json.data?.webPages?.value ?? json.webPages?.value ?? []

  return pages
    .map((p) => ({
      title: p.name ?? p.title ?? '',
      snippet: (p.summary ?? p.snippet ?? '').trim(),
      url: p.url,
    }))
    .filter((p) => p.snippet.length > 0)
    .slice(0, count)
}

/**
 * 将博查结果格式化为模型上下文。
 */
export function formatBochaContext(snippets: BochaSearchSnippet[]): string {
  if (snippets.length === 0) return '（未检索到联网参考资料，请仅依据已有典故扩写。）'
  return snippets
    .map((s, i) => `[${i + 1}] ${s.title}：${s.snippet}`)
    .join('\n')
}
