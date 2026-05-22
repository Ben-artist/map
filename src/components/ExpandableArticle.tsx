import { useCallback, useEffect, useId, useState } from 'react'
import { ChevronDown, Loader2, Sparkles } from 'lucide-react'
import {
  generateRegionArticle,
  type GenerateRegionArticleInput,
} from '#/lib/region-article.functions.ts'
import type { RegionArticleLongForm } from '#/lib/region-article.ts'
import { cn } from '#/lib/utils.ts'

interface ExpandableArticleProps {
  adcode: string
  level: 'province' | 'city'
  longForm: RegionArticleLongForm | null
  canEnhanceWithAi?: boolean
  onAiLoaded?: (payload: { summary: string; body: string }) => void
  className?: string
}

/**
 * 可展开长文；内置文案较短时，展开可触发千问+博查生成更详解读。
 */
export function ExpandableArticle({
  adcode,
  level,
  longForm: initialLongForm,
  canEnhanceWithAi = false,
  onAiLoaded,
  className,
}: ExpandableArticleProps) {
  const [open, setOpen] = useState(false)
  const [longForm, setLongForm] = useState(initialLongForm)

  useEffect(() => {
    setLongForm(initialLongForm)
    setAiGenerated(false)
    setOpen(false)
    setError(null)
  }, [adcode, initialLongForm])
  const [aiGenerated, setAiGenerated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelId = useId()

  const fetchAi = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const input: GenerateRegionArticleInput = { adcode, level }
      const result = await generateRegionArticle({ data: input })
      setLongForm({ body: result.body })
      setAiGenerated(true)
      onAiLoaded?.({ summary: result.summary, body: result.body })
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [adcode, level])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (
      next &&
      canEnhanceWithAi &&
      !aiGenerated &&
      !loading &&
      (!longForm?.body || longForm.body.length < 280)
    ) {
      void fetchAi()
    }
  }

  const body = longForm?.body?.trim()

  return (
    <div className={cn('mt-4 border-t border-[var(--line)] pt-3', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={handleToggle}
        disabled={loading && !open}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left text-sm font-medium text-[var(--lagoon-deep)] transition hover:bg-[rgba(79,184,178,0.08)] disabled:opacity-60"
      >
        <span className="inline-flex items-center gap-1.5">
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              正在生成详细解读…
            </>
          ) : (
            <>{open ? '收起详细解读' : '展开详细解读'}</>
          )}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <div id={panelId} hidden={!open} className="mt-3">
        {error && (
          <p className="mb-2 text-xs text-red-600/90" role="alert">
            {error}
            <button
              type="button"
              onClick={() => void fetchAi()}
              className="ml-2 underline"
            >
              重试
            </button>
          </p>
        )}
        {loading && !body && (
          <p className="text-sm text-[var(--sea-ink-soft)]">
            正在通过博查检索史料，并由千问撰写解读…
          </p>
        )}
        {body && (
          <>
            {aiGenerated && (
              <p className="mb-2 inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[rgba(79,184,178,0.12)] px-2 py-0.5 text-base font-medium text-[var(--lagoon-deep)]">
                <Sparkles className="size-3" aria-hidden />
                AI 辅助解读 · 仅供参考
              </p>
            )}
            <p className="text-sm leading-[1.75] text-[var(--sea-ink)]">
              {body}
            </p>
          </>
        )}
        {!body && !loading && canEnhanceWithAi && (
          <button
            type="button"
            onClick={() => void fetchAi()}
            className="text-sm font-medium text-[var(--lagoon-deep)] underline-offset-2 hover:underline"
          >
            使用 AI 生成详细解读
          </button>
        )}
      </div>
    </div>
  )
}
