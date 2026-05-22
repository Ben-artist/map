import { useCallback, useEffect, useState } from 'react'
import { Bot } from 'lucide-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ChinaMap, type MapRegionClickPayload } from '#/components/ChinaMap.tsx'
import { MapToolbar } from '#/components/MapToolbar.tsx'
import { RegionDetailPanel } from '#/components/RegionDetailPanel.tsx'
import type { MapUrlSearch } from '#/lib/map-url.ts'
import type { RegionSearchHit } from '#/lib/region-search.ts'
import { cn } from '#/lib/utils.ts'

const homeRoute = getRouteApi('/')

/**
 * 地图探索：搜索、面包屑、详情抽屉、URL 深链与地图联动。
 */
export function ChinaMapExplorer() {
  const { province, city } = homeRoute.useSearch()
  const navigate = useNavigate({ from: '/' })
  const [citiesLoading, setCitiesLoading] = useState(false)
  /** 仅控制详情卡片显隐；关闭时不改 URL / 地图层级 */
  const [detailPanelVisible, setDetailPanelVisible] = useState(true)
  const [aiChatOpen, setAiChatOpen] = useState(false)

  const urlSearch: MapUrlSearch = { province, city }
  const highlightAdcode = city ?? province ?? null
  const hasRegionSelection = Boolean(province || city)
  const detailPanelOpen = hasRegionSelection && detailPanelVisible

  useEffect(() => {
    setDetailPanelVisible(true)
  }, [province, city])

  const activeAdcode = city ?? province ?? null

  useEffect(() => {
    setAiChatOpen(false)
  }, [activeAdcode])

  const openAiChat = useCallback(() => {
    setDetailPanelVisible(true)
    setAiChatOpen(true)
  }, [])

  const setSearch = useCallback(
    (next: MapUrlSearch) => {
      navigate({
        search: () => ({
          province: next.province,
          city: next.city,
        }),
        replace: false,
      })
    },
    [navigate],
  )

  const handleRegionClick = useCallback(
    (payload: MapRegionClickPayload) => {
      setDetailPanelVisible(true)
      if (payload.level === 'province') {
        setSearch({ province: payload.adcode, city: undefined })
        return
      }
      if (payload.provinceAdcode) {
        setSearch({
          province: payload.provinceAdcode,
          city: payload.adcode,
        })
      }
    },
    [setSearch],
  )

  const handleSearchSelect = useCallback(
    (hit: RegionSearchHit) => {
      setDetailPanelVisible(true)
      if (hit.level === 'province') {
        setSearch({ province: hit.adcode, city: undefined })
      } else {
        setSearch({ province: hit.provinceAdcode, city: hit.adcode })
      }
    },
    [setSearch],
  )

  const handleDismissDetailPanel = useCallback(() => {
    setDetailPanelVisible(false)
    setAiChatOpen(false)
  }, [])

  const handleRequestChinaView = useCallback(() => {
    setSearch({})
  }, [setSearch])

  const handleViewCities = useCallback(
    (provinceAdcode: string) => {
      setDetailPanelVisible(true)
      setSearch({ province: provinceAdcode, city: undefined })
    },
    [setSearch],
  )

  return (
    <div className="relative h-full min-h-0 flex-1 overflow-hidden">
      <MapToolbar
        urlSearch={urlSearch}
        onNavigate={setSearch}
        onSearchSelect={handleSearchSelect}
        citiesLoading={citiesLoading}
        panelOpen={detailPanelOpen}
      />

      <ChinaMap
        viewProvinceAdcode={province ?? null}
        highlightAdcode={highlightAdcode}
        onRegionClick={handleRegionClick}
        onRequestChinaView={handleRequestChinaView}
        onCitiesLoadingChange={setCitiesLoading}
      />

      {detailPanelOpen && (
        <RegionDetailPanel
          urlSearch={urlSearch}
          aiChatOpen={aiChatOpen}
          onAiChatOpenChange={setAiChatOpen}
          onClose={handleDismissDetailPanel}
          onViewCities={handleViewCities}
        />
      )}

      {hasRegionSelection && activeAdcode && !aiChatOpen && (
        <button
          type="button"
          onClick={openAiChat}
          className={cn(
            'pointer-events-auto fixed z-[60] flex size-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--lagoon-deep)] text-white shadow-lg transition hover:opacity-90',
            'bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]',
          )}
          aria-label="打开 AI 地名向导"
          title="AI 地名向导"
        >
          <Bot className="size-7" aria-hidden />
        </button>
      )}
    </div>
  )
}
