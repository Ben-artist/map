import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Bot, Loader2, RefreshCw, X } from 'lucide-react'
import type { ChinaHistoryPeriod, ChinaHistoryRuler } from '#/lib/china-history-types.ts'
import { parseRulerBioSections } from '#/lib/ruler-bio-parse.ts'
import { getRulerBioFn } from '#/lib/ruler-bio.functions.ts'
import { cn } from '#/lib/utils.ts'

export interface RulerDialogTarget {
  period: ChinaHistoryPeriod
  ruler: ChinaHistoryRuler
}

interface RulerAiDialogProps {
  target: RulerDialogTarget | null
  onClose: () => void
}

function formatRulerHeading(ruler: ChinaHistoryRuler): string {
  if (ruler.title) return `${ruler.title} · ${ruler.name}`
  return ruler.name
}

/**
 * 君主 AI 生平弹窗。
 */
export function RulerAiDialog({ target, onClose }: RulerAiDialogProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [bio, setBio] = useState('')
  const [cached, setCached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBio = useCallback(
    async (current: RulerDialogTarget, force = false) => {
      setLoading(true)
      setError(null)
      if (force) {
        setBio('')
        setCached(false)
      }

      try {
        const { bio: text, cached: fromCache } = await getRulerBioFn({
          data: {
            periodId: current.period.id,
            periodName: current.period.name,
            periodRange: current.period.rangeLabel,
            rulerRole: current.period.rulerRole,
            force,
            ruler: {
              name: current.ruler.name,
              title: current.ruler.title,
              reign: current.ruler.reign,
              regime: current.ruler.regime,
              note: current.ruler.note,
            },
          },
        })
        setBio(text)
        setCached(fromCache)
      } catch (e) {
        setError(e instanceof Error ? e.message : '生成失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!target) return
    void fetchBio(target)
  }, [target, fetchBio])

  useEffect(() => {
    if (!target) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [target, onClose])

  if (!target) return null

  const { period, ruler } = target
  const heading = formatRulerHeading(ruler)
  const sections = bio ? parseRulerBioSections(bio) : []

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_oklab,--sea-ink_35%,transparent)] backdrop-blur-[2px]"
        aria-label="关闭弹窗"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[min(88dvh,40rem)] w-full max-w-xl flex-col',
          'rounded-t-2xl border border-(--line) bg-(--surface-strong) shadow-2xl',
          'sm:rounded-2xl',
        )}
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-(--line) px-5 py-4">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,--lagoon_18%,--chip-bg)] text-(--lagoon-deep)">
            <Bot className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-xs font-bold tracking-[0.12em] text-(--kicker) uppercase">
              {period.name} · {period.rangeLabel}
            </p>
            <h2 id={titleId} className="m-0 text-lg font-bold text-(--sea-ink) sm:text-xl">
              {heading}
            </h2>
            {ruler.reign ? (
              <p className="mt-1 mb-0 text-sm text-(--sea-ink-soft) tabular-nums">
                在位 {ruler.reign}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
            aria-label="关闭"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-(--sea-ink-soft)">
              <Loader2 className="size-8 animate-spin text-(--lagoon-deep)" aria-hidden />
              <p className="m-0 text-sm">AI 正在整理生平与大事…</p>
            </div>
          ) : error ? (
            <div className="space-y-4 py-6 text-center">
              <p className="m-0 text-sm text-(--sea-ink-soft)">{error}</p>
              <button
                type="button"
                onClick={() => void fetchBio(target, true)}
                className="inline-flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-4 py-2 text-sm font-semibold text-(--sea-ink) transition hover:border-(--lagoon-deep)"
              >
                <RefreshCw className="size-4" aria-hidden />
                重试
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {sections.map((section) => (
                <section key={section.title ?? 'body'}>
                  {section.title ? (
                    <h3 className="mb-2 text-sm font-bold tracking-wide text-(--sea-ink)">
                      {section.title}
                    </h3>
                  ) : null}
                  <p className="m-0 whitespace-pre-wrap text-base leading-7 text-(--sea-ink-soft)">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-(--line) px-5 py-3">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-(--sea-ink-soft)">
            <span>AI 生成内容仅供科普参考，可与教材、史料对照</span>
            {/* {!loading && !error && bio ? (
              <button
                type="button"
                onClick={() => void fetchBio(target, true)}
                className="inline-flex items-center gap-1 text-(--lagoon-deep) transition hover:text-(--sea-ink)"
              >
                <RefreshCw className="size-3" aria-hidden />
                重新生成
              </button>
            ) : null} */}
          </div>
        </footer>
      </div>
    </div>
  )
}
