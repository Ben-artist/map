const DEFAULT_BASE_URL =
  'https://dashscope.aliyuncs.com/compatible-mode/v1'
const DEFAULT_MODEL = 'qwen-plus'

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * 调用千问 Chat Completions（OpenAI 兼容接口）。
 */
export async function qwenChat(
  messages: QwenMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) {
    throw new Error('未配置 DASHSCOPE_API_KEY，请在 .env 中设置千问 API Key')
  }

  const baseUrl = (
    process.env.QWEN_BASE_URL ?? DEFAULT_BASE_URL
  ).replace(/\/$/, '')
  const model = process.env.QWEN_MODEL ?? DEFAULT_MODEL

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.35,
      max_tokens: options?.maxTokens ?? 900,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`千问 API 错误 ${res.status}: ${errText.slice(0, 400)}`)
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = json.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('千问返回内容为空')
  return content
}
