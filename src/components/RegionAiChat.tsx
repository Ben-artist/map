import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, ChevronLeft, Loader2, Send } from 'lucide-react'
import {
  askRegionQuestionFn,
  type RegionQaTurn,
} from '#/lib/region-qa.functions.ts'
import { cn } from '#/lib/utils.ts'

interface RegionAiChatProps {
  adcode: string
  level: 'province' | 'city'
  placeName: string
  onBack: () => void
  className?: string
}

const SUGGESTIONS = [
  '这里为什么叫这个名字？',
  '有哪些值得了解的历史沿革？',
  '地名和当地地理有什么关系？',
]

/**
 * 地区 AI 科普问答面板（基于当前地区典故上下文）。
 */
export function RegionAiChat({
  adcode,
  level,
  placeName,
  onBack,
  className,
}: RegionAiChatProps) {
  const [messages, setMessages] = useState<RegionQaTurn[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMessages([])
    setInput('')
    setError(null)
  }, [adcode, level])

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, loading])

  const send = useCallback(
    async (text: string) => {
      const question = text.trim()
      if (!question || loading) return

      setError(null)
      setInput('')
      const history = messages.slice(-8)
      const userTurn: RegionQaTurn = { role: 'user', content: question }
      setMessages((prev) => [...prev, userTurn])
      setLoading(true)

      try {
        const { answer } = await askRegionQuestionFn({
          data: {
            adcode,
            level,
            question,
            history,
          },
        })
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: answer },
        ])
      } catch (e) {
        setError(e instanceof Error ? e.message : '回答失败，请稍后重试')
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [adcode, level, loading, messages],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send(input)
    }
  }

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--line)] px-1 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-base font-medium text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.1)]"
          aria-label="返回地名详情"
        >
          <ChevronLeft className="size-4" aria-hidden />
          返回
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[rgba(79,184,178,0.2)] text-[var(--lagoon-deep)]">
            <Bot className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[var(--sea-ink)]">
              AI 地名向导
            </p>
            <p className="truncate text-base text-[var(--sea-ink-soft)]">
              关于 {placeName}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto py-3"
      >
        {messages.length === 0 && !loading && (
          <div className="space-y-3">
            <p className="text-base leading-relaxed text-[var(--sea-ink-soft)]">
              你好，我可以根据本站的地名典故资料，解答你对
              <span className="font-medium text-[var(--sea-ink)]">
                {placeName}
              </span>
              的疑问。
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 text-base text-[var(--lagoon-deep)] transition hover:bg-white"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-base text-[var(--sea-ink-soft)]">
              AI 辅助回答，仅供参考，重要史实请以方志为准。
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className={cn(
              'max-w-[95%] rounded-2xl px-3 py-2 text-base leading-relaxed',
              msg.role === 'user'
                ? 'ml-auto bg-[var(--lagoon-deep)] text-white'
                : 'mr-auto border border-[var(--line)] bg-white/90 text-[var(--sea-ink)]',
            )}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/90 px-3 py-2 text-base text-[var(--sea-ink-soft)]">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            正在思考…
          </div>
        )}

        {error && (
          <p className="text-base text-red-600/90" role="alert">
            {error}
          </p>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="shrink-0 border-t border-[var(--line)] pt-3"
      >
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder={`问问${placeName}的地名故事…`}
            disabled={loading}
            className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-[var(--line)] bg-white/90 px-3 py-2 text-base text-[var(--sea-ink)] outline-none ring-[var(--lagoon)] placeholder:text-[var(--sea-ink-soft)] focus:ring-2 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--lagoon-deep)] text-white transition hover:opacity-90 disabled:opacity-40"
            aria-label="发送"
          >
            <Send className="size-4" aria-hidden />
          </button>
        </div>
      </form>
    </div>
  )
}
