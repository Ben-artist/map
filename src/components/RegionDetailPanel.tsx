import { useCallback, useEffect, useRef, useState } from 'react'
import { Link2, X } from 'lucide-react'
import { Badge } from '#/components/ui/badge.tsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx'
import {
  CITY_NAME_ORIGINS,
  getCityMetaFromAdcode,
  placeNameFromOrigin,
} from '#/data/cities.ts'
import { getProvinceMeta } from '#/data/provinces.ts'
import { isProvinceAdcode } from '#/lib/region-adcode.ts'
import { buildMapShareUrl, type MapUrlSearch } from '#/lib/map-url.ts'
import { ExpandableArticle } from '#/components/ExpandableArticle.tsx'
import { RegionAiChat } from '#/components/RegionAiChat.tsx'
import { RegionHistoryTimeline } from '#/components/RegionHistoryTimeline.tsx'
import { RegionStatsBarChart } from '#/components/RegionStatsBarChart.tsx'
import {
  defaultNameOrigin,
  getRegionArticle,
} from '#/lib/region-article.ts'
import { cn } from '#/lib/utils.ts'

const SWIPE_CLOSE_THRESHOLD = 88

type DetailTab = 'article' | 'stats' | 'history'

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'stats', label: '数据' },
  { id: 'article', label: '科普' },
  { id: 'history', label: '沿革' },
]

interface RegionDetailPanelProps {
  urlSearch: MapUrlSearch
  aiChatOpen: boolean
  onAiChatOpenChange: (open: boolean) => void
  onClose: () => void
  onViewCities: (provinceAdcode: string) => void
  className?: string
}

/**
 * 地区详情：桌面右侧卡片；移动端底部抽屉，支持下拉关闭。
 */
export function RegionDetailPanel({
  urlSearch,
  aiChatOpen,
  onAiChatOpenChange,
  onClose,
  onViewCities,
  className,
}: RegionDetailPanelProps) {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<DetailTab>('stats')
  const [dragOffset, setDragOffset] = useState(0)
  const [backdropReady, setBackdropReady] = useState(false)
  const touchStartY = useRef(0)
  const dragging = useRef(false)

  const { province: provinceAdcode, city: cityAdcode } = urlSearch
  const province = provinceAdcode ? getProvinceMeta(provinceAdcode) : undefined
  const city = cityAdcode ? getCityMetaFromAdcode(cityAdcode) : null
  const isCityLevel = Boolean(cityAdcode && !isProvinceAdcode(cityAdcode))
  const showingCity = isCityLevel && Boolean(city)

  const activeAdcode = isCityLevel ? cityAdcode! : provinceAdcode
  const activeLevel = isCityLevel ? 'city' : 'province'
  const nameOrigin =
    (showingCity && city
      ? city.nameOrigin
      : province?.nameOrigin) ??
    (activeAdcode ? defaultNameOrigin(activeAdcode, activeLevel) : '')

  const article =
    activeAdcode && nameOrigin
      ? getRegionArticle(
          activeAdcode,
          activeLevel,
          nameOrigin,
          showingCity && city ? city.name : province?.name ?? '',
          showingCity ? province?.name : undefined,
        )
      : null

  const [displaySummary, setDisplaySummary] = useState(article?.summary ?? '')
  useEffect(() => {
    setDisplaySummary(article?.summary ?? '')
  }, [article?.summary, activeAdcode])

  useEffect(() => {
    setTab('stats')
  }, [activeAdcode])

  /** 避免地图点击与遮罩关闭同一次手势冲突（移动端面板一闪即关） */
  useEffect(() => {
    setBackdropReady(false)
    const id = window.requestAnimationFrame(() => {
      setBackdropReady(true)
    })
    return () => window.cancelAnimationFrame(id)
  }, [provinceAdcode, cityAdcode])

  const placeDisplayName = isCityLevel
    ? (city?.name ??
      (placeNameFromOrigin(CITY_NAME_ORIGINS[cityAdcode!] ?? '') || '该地区'))
    : (province?.name ?? '该地区')

  const copyLink = useCallback(async () => {
    const url = buildMapShareUrl(urlSearch)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [urlSearch])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? 0
    dragging.current = true
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const dy = (e.touches[0]?.clientY ?? 0) - touchStartY.current
    if (dy > 0) setDragOffset(dy)
  }

  const onTouchEnd = () => {
    dragging.current = false
    if (dragOffset >= SWIPE_CLOSE_THRESHOLD) onClose()
    setDragOffset(0)
  }

  if (!provinceAdcode && !cityAdcode) return null

  return (
    <>
      <button
        type="button"
        aria-label="关闭详情"
        className={cn(
          'fixed inset-0 z-40 bg-[rgba(23,58,64,0.35)] sm:hidden',
          backdropReady ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'pointer-events-auto z-50 flex flex-col transition-transform duration-200 ease-out',
          'fixed inset-x-0 bottom-0 max-h-[min(88dvh,560px)] w-full',
          'sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:max-h-[calc(100dvh-2rem)] sm:w-[min(100%,26rem)]',
          className,
        )}
        style={{
          transform:
            dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
        }}
        aria-label="地区详情"
      >
        <Card className="relative flex max-h-[inherit] flex-col gap-0 overflow-hidden rounded-t-2xl border-(--line) bg-(--surface-strong) py-0 shadow-xl backdrop-blur-md sm:rounded-xl sm:shadow-lg">
          <div
            className="flex shrink-0 justify-center pt-2 sm:hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="h-1 w-10 rounded-full bg-(--line)"
              aria-hidden
            />
          </div>

          <CardHeader
            className="grid-rows-1 gap-0 border-b border-(--line) px-4 py-2.5 [.border-b]:pb-2.5"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex items-start justify-between gap-2 col-span-full">
              <div className="min-w-0 flex-1">
                {isCityLevel ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg text-(--sea-ink)">
                        {placeDisplayName}
                      </CardTitle>
                      {city ? (
                        <Badge
                          variant="outline"
                          className="border-(--chip-line) bg-(--chip-bg) text-(--sea-ink)"
                        >
                          {city.platePrefix}
                        </Badge>
                      ) : null}
                    </div>
                    <CardDescription className="mt-0.5 text-(--sea-ink-soft)">
                      {province?.name ?? '市级'}
                    </CardDescription>
                  </>
                ) : province ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg text-(--sea-ink)">
                        {province.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="border-(--chip-line) bg-(--chip-bg) text-(--sea-ink)"
                      >
                        {province.platePrefix}
                      </Badge>
                    </div>
                    <CardDescription className="mt-0.5 text-(--sea-ink-soft)">
                      省会 {province.capital}
                    </CardDescription>
                  </>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-1 text-(--sea-ink-soft) transition hover:bg-(--line) hover:text-(--sea-ink)"
                aria-label="关闭详情"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            {!showingCity && provinceAdcode && (
              <button
                type="button"
                onClick={() => onViewCities(provinceAdcode)}
                className="col-span-full w-fit pt-1 text-base font-medium text-(--lagoon-deep) underline-offset-2 hover:underline"
              >
                查看各市 →
              </button>
            )}
          </CardHeader>

          {!aiChatOpen && activeAdcode && (
            <div
              className="flex shrink-0 gap-1 border-b border-(--line) px-3 py-2"
              role="tablist"
              aria-label="详情分类"
            >
              {DETAIL_TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'flex-1 rounded-lg px-2 py-1.5 text-base font-medium transition',
                    tab === item.id
                      ? 'bg-(--lagoon-deep) text-white'
                      : 'text-(--sea-ink-soft) hover:bg-[rgba(79,184,178,0.12)] hover:text-(--sea-ink)',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3">
            {aiChatOpen && activeAdcode ? (
              <RegionAiChat
                adcode={activeAdcode}
                level={activeLevel}
                placeName={placeDisplayName}
                onBack={() => onAiChatOpenChange(false)}
                className="min-h-0 flex-1"
              />
            ) : activeAdcode && tab === 'stats' ? (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <RegionStatsBarChart
                  adcode={activeAdcode}
                  level={activeLevel}
                  placeName={placeDisplayName}
                />
              </div>
            ) : activeAdcode && tab === 'history' ? (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <RegionHistoryTimeline
                  adcode={activeAdcode}
                  level={activeLevel}
                  placeName={placeDisplayName}
                  nameOrigin={nameOrigin}
                />
              </div>
            ) : article ? (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <p className="text-base font-medium leading-snug text-(--sea-ink)">
                  {displaySummary}
                </p>
                {article.hasExpandable ? (
                  <ExpandableArticle
                    adcode={activeAdcode!}
                    level={activeLevel}
                    longForm={article.longForm}
                    canEnhanceWithAi={article.canEnhanceWithAi}
                    onAiLoaded={({ summary }) => setDisplaySummary(summary)}
                  />
                ) : (
                  <p className="mt-3 text-base leading-relaxed text-(--sea-ink-soft)">
                    详细解读整理中，先看上方概要。
                  </p>
                )}
              </div>
            ) : (
              <p className="text-base leading-relaxed text-(--sea-ink)">
                {nameOrigin || '暂无地名科普资料。'}
              </p>
            )}
          </CardContent>

          {!aiChatOpen && (
            <div className="flex shrink-0 gap-2 border-t border-(--line) px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => void copyLink()}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-(--line) bg-white/80 px-3 py-2 text-base font-medium text-(--sea-ink) transition hover:bg-white"
              >
                <Link2 className="size-4" aria-hidden />
                {copied ? '已复制链接' : '复制分享链接'}
              </button>
            </div>
          )}

        </Card>
      </aside>
    </>
  )
}
