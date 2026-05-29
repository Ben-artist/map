import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChinaHistoryNav } from '#/components/ChinaHistoryNav.tsx'
import { ChinaHistoryTimeline } from '#/components/ChinaHistoryTimeline.tsx'
import {
  RulerAiDialog,
  type RulerDialogTarget,
} from '#/components/RulerAiDialog.tsx'
import { CHINA_HISTORY_PERIODS } from '#/data/china-history.ts'
import type { ChinaHistoryRuler } from '#/lib/china-history-types.ts'

const SCROLL_SPY_OFFSET = 112

interface ChinaHistoryExplorerProps {
  /** URL 深链指定的朝代 */
  initialPeriodId?: string
}

/**
 * 历史页主区域：侧边目录与通史内容双向联动（点击定位 + 滚动高亮）。
 */
export function ChinaHistoryExplorer({ initialPeriodId }: ChinaHistoryExplorerProps) {
  const navigate = useNavigate({ from: '/history' })
  const [activePeriodId, setActivePeriodId] = useState(
    () => initialPeriodId ?? CHINA_HISTORY_PERIODS[0]?.id ?? '',
  )
  const [rulerDialog, setRulerDialog] = useState<RulerDialogTarget | null>(null)
  const scrollLockRef = useRef(false)
  const scrollLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navAsideRef = useRef<HTMLElement>(null)
  const activePeriodRef = useRef(activePeriodId)

  activePeriodRef.current = activePeriodId

  const lockScrollSpy = useCallback((ms = 700) => {
    scrollLockRef.current = true
    if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current)
    scrollLockTimerRef.current = setTimeout(() => {
      scrollLockRef.current = false
    }, ms)
  }, [])

  const syncUrl = useCallback(
    (periodId: string, replace: boolean) => {
      navigate({
        search: (prev) => ({ ...prev, period: periodId }),
        replace,
      })
    },
    [navigate],
  )

  const scrollToPeriod = useCallback(
    (periodId: string, behavior: ScrollBehavior = 'smooth') => {
      const el = document.getElementById(`period-${periodId}`)
      if (!el) return
      lockScrollSpy(behavior === 'smooth' ? 700 : 100)
      el.scrollIntoView({ behavior, block: 'start' })
    },
    [lockScrollSpy],
  )

  const handlePeriodSelect = useCallback(
    (periodId: string) => {
      activePeriodRef.current = periodId
      setActivePeriodId(periodId)
      syncUrl(periodId, false)
      scrollToPeriod(periodId, 'smooth')
    },
    [scrollToPeriod, syncUrl],
  )

  /** URL 变化时（浏览器前进/后退）同步高亮并滚动 */
  useEffect(() => {
    if (!initialPeriodId) return
    activePeriodRef.current = initialPeriodId
    setActivePeriodId(initialPeriodId)
    scrollToPeriod(initialPeriodId, 'auto')
  }, [initialPeriodId, scrollToPeriod])

  /** 滚动时更新当前朝代 */
  useEffect(() => {
    const sections = CHINA_HISTORY_PERIODS.map((period) => ({
      id: period.id,
      el: document.getElementById(`period-${period.id}`),
    })).filter((item): item is { id: string; el: HTMLElement } => Boolean(item.el))

    if (sections.length === 0) return

    const updateActiveFromScroll = () => {
      if (scrollLockRef.current) return

      let currentId = sections[0]!.id
      for (const section of sections) {
        const top = section.el.getBoundingClientRect().top
        if (top - SCROLL_SPY_OFFSET <= 0) {
          currentId = section.id
        }
      }

      if (activePeriodRef.current === currentId) return

      activePeriodRef.current = currentId
      setActivePeriodId(currentId)
      syncUrl(currentId, true)
    }

    updateActiveFromScroll()
    window.addEventListener('scroll', updateActiveFromScroll, { passive: true })
    window.addEventListener('resize', updateActiveFromScroll)

    return () => {
      window.removeEventListener('scroll', updateActiveFromScroll)
      window.removeEventListener('resize', updateActiveFromScroll)
    }
  }, [syncUrl])

  /** 侧边栏自动滚到当前高亮项 */
  useEffect(() => {
    const aside = navAsideRef.current
    if (!aside || !activePeriodId) return

    const activeLink = aside.querySelector<HTMLElement>(
      `[data-period-id="${activePeriodId}"]`,
    )
    activeLink?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activePeriodId])

  useEffect(() => {
    return () => {
      if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current)
    }
  }, [])

  const handleRulerSelect = useCallback(
    (periodId: string, ruler: ChinaHistoryRuler) => {
      const period = CHINA_HISTORY_PERIODS.find((p) => p.id === periodId)
      if (!period) return
      setRulerDialog({ period, ruler })
    },
    [],
  )

  return (
    <>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,13.5rem)_minmax(0,1fr)] lg:gap-14">
      <aside
        ref={navAsideRef}
        className="history-page__aside lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1"
      >
        <ChinaHistoryNav
          activePeriodId={activePeriodId}
          onPeriodSelect={handlePeriodSelect}
        />
      </aside>

      <ChinaHistoryTimeline
        activePeriodId={activePeriodId}
        onRulerSelect={handleRulerSelect}
      />
      </div>

      <RulerAiDialog target={rulerDialog} onClose={() => setRulerDialog(null)} />
    </>
  )
}
