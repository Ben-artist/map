import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import chinaGeoRaw from '#/data/china-provinces.json'
import { getProvinceMeta } from '#/data/provinces.ts'
import {
  filterCityFeatures,
  filterProvinceFeatures,
  prepareMapFeatures,
  type RegionCollection,
  type RegionFeature,
} from '#/lib/china-geo.ts'
import {
  buildChinaMapOption,
  buildProvinceMapOption,
  CHINA_MAP_ID,
  provinceMapId,
  toRegisterGeoJson,
} from '#/lib/echarts-map.ts'
import { fetchProvinceGeo } from '#/lib/fetch-region-geo.ts'
import { cn } from '#/lib/utils.ts'

const chinaGeo = chinaGeoRaw as RegionCollection

interface MapClickData {
  adcode?: string
  name?: string
}

export interface MapRegionClickPayload {
  adcode: string
  name: string
  level: 'province' | 'city'
  provinceAdcode: string | null
}

interface ChinaMapProps {
  className?: string
  /** 父级驱动的省级视图；null 为全国 */
  viewProvinceAdcode?: string | null
  /** 高亮选中的 adcode（省或市） */
  highlightAdcode?: string | null
  onRegionClick?: (payload: MapRegionClickPayload) => void
  onRequestChinaView?: () => void
  /** 市级 GeoJSON 加载状态变化 */
  onCitiesLoadingChange?: (loading: boolean) => void
}

/**
 * 中国行政区划地图（ECharts）：支持 URL 驱动的省 / 市下钻与选中高亮。
 */
export function ChinaMap({
  className,
  viewProvinceAdcode = null,
  highlightAdcode = null,
  onRegionClick,
  onRequestChinaView,
  onCitiesLoadingChange,
}: ChinaMapProps) {
  const [mounted, setMounted] = useState(false)
  const [mapsReady, setMapsReady] = useState(false)
  const [mapLevel, setMapLevel] = useState<'china' | 'city'>('china')
  const [activeProvince, setActiveProvince] = useState<string | null>(null)
  const chartRef = useRef<ReactECharts>(null)
  const adcodeToNameRef = useRef<Map<string, string>>(new Map())
  const cityFeaturesRef = useRef<RegionFeature[]>([])

  const provinceFeatures = useMemo(
    () => prepareMapFeatures(filterProvinceFeatures(chinaGeo)),
    [],
  )

  const provinceByAdcode = useMemo(() => {
    const map = new Map<string, RegionFeature>()
    for (const f of provinceFeatures) {
      map.set(f.properties.code, f)
    }
    return map
  }, [provinceFeatures])

  const [chartOption, setChartOption] = useState<EChartsOption>(() =>
    buildChinaMapOption(provinceFeatures),
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    echarts.registerMap(CHINA_MAP_ID, toRegisterGeoJson(provinceFeatures))
    const nameMap = new Map<string, string>()
    for (const f of provinceFeatures) {
      nameMap.set(
        f.properties.code,
        f.properties.name || f.properties.fullname,
      )
    }
    adcodeToNameRef.current = nameMap
    setMapsReady(true)
  }, [mounted, provinceFeatures])

  const switchToChina = useCallback(() => {
    cityFeaturesRef.current = []
    const highlight =
      highlightAdcode && highlightAdcode.endsWith('0000')
        ? highlightAdcode
        : null
    setChartOption(buildChinaMapOption(provinceFeatures, highlight))
    setMapLevel('china')
    setActiveProvince(null)
    const nameMap = new Map<string, string>()
    for (const f of provinceFeatures) {
      nameMap.set(
        f.properties.code,
        f.properties.name || f.properties.fullname,
      )
    }
    adcodeToNameRef.current = nameMap
  }, [provinceFeatures, highlightAdcode])

  const switchToProvinceCities = useCallback(
    async (province: RegionFeature) => {
      const adcode = province.properties.code
      if (!getProvinceMeta(adcode)) return false

      onCitiesLoadingChange?.(true)
      try {
        const collection = await fetchProvinceGeo(adcode)
        const cities = prepareMapFeatures(
          filterCityFeatures(collection, adcode),
        )
        const mapId = provinceMapId(adcode)
        echarts.registerMap(mapId, toRegisterGeoJson(cities))

        cityFeaturesRef.current = cities
        setChartOption(
          buildProvinceMapOption(mapId, cities, adcode, highlightAdcode),
        )
        setActiveProvince(adcode)
        setMapLevel('city')
        const nameMap = new Map<string, string>()
        for (const f of cities) {
          nameMap.set(
            f.properties.code,
            f.properties.name || f.properties.fullname,
          )
        }
        adcodeToNameRef.current = nameMap
        return true
      } catch {
        switchToChina()
        onRequestChinaView?.()
        return false
      } finally {
        onCitiesLoadingChange?.(false)
      }
    },
    [switchToChina, onRequestChinaView, onCitiesLoadingChange, highlightAdcode],
  )

  /** 选中变化时刷新省内地图高亮（深链打开市时依赖此 effect） */
  useEffect(() => {
    if (!mapsReady || mapLevel !== 'city' || !activeProvince) return
    if (cityFeaturesRef.current.length === 0) return

    setChartOption(
      buildProvinceMapOption(
        provinceMapId(activeProvince),
        cityFeaturesRef.current,
        activeProvince,
        highlightAdcode,
      ),
    )
  }, [mapsReady, highlightAdcode, mapLevel, activeProvince])

  /** 图表渲染完成后补充 dispatch 高亮（与数据项样式双保险） */
  useEffect(() => {
    if (!mapsReady || !highlightAdcode) return

    const chart = chartRef.current?.getEchartsInstance()
    if (!chart) return

    const apply = () => {
      const name = adcodeToNameRef.current.get(highlightAdcode)
      if (!name) return false
      chart.dispatchAction({ type: 'downplay', seriesIndex: 0 })
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        name,
      })
      return true
    }

    const onFinished = () => {
      apply()
    }

    chart.on('finished', onFinished)
    const timer = window.setTimeout(() => apply(), 120)

    return () => {
      chart.off('finished', onFinished)
      window.clearTimeout(timer)
    }
  }, [mapsReady, highlightAdcode, chartOption, mapLevel])

  /** URL viewProvinceAdcode 变化时同步地图层级 */
  useEffect(() => {
    if (!mapsReady) return

    if (!viewProvinceAdcode) {
      if (mapLevel !== 'china') switchToChina()
      return
    }

    const province = provinceByAdcode.get(viewProvinceAdcode)
    if (!province) return

    if (activeProvince === viewProvinceAdcode && mapLevel === 'city') return

    void switchToProvinceCities(province)
  }, [
    mapsReady,
    viewProvinceAdcode,
    provinceByAdcode,
    activeProvince,
    mapLevel,
    switchToChina,
    switchToProvinceCities,
  ])

  useEffect(() => {
    if (!mapsReady) return
    const chart = chartRef.current?.getEchartsInstance()
    if (!chart) return

    const resize = () => chart.resize()
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [mapsReady, chartOption, mapLevel])

  const handleMapClick = useCallback(
    (params: { data?: MapClickData }) => {
      const adcode = params.data?.adcode
      const name = params.data?.name ?? ''
      if (!adcode) return

      if (mapLevel === 'china') {
        const province = provinceByAdcode.get(adcode)
        if (!province) return
        onRegionClick?.({
          adcode,
          name,
          level: 'province',
          provinceAdcode: null,
        })
        return
      }

      if (activeProvince) {
        onRegionClick?.({
          adcode,
          name,
          level: 'city',
          provinceAdcode: activeProvince,
        })
      }
    },
    [mapLevel, provinceByAdcode, activeProvince, onRegionClick],
  )

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-full min-h-0 animate-pulse bg-[rgba(79,184,178,0.08)]',
          className,
        )}
      />
    )
  }

  return (
    <div className={cn('relative h-full min-h-0 w-full', className)}>
      {mapsReady && (
        <ReactECharts
          ref={chartRef}
          option={chartOption}
          style={{
            height: '100%',
            width: '100%',
            cursor: 'pointer',
          }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={false}
          onEvents={{ click: handleMapClick }}
        />
      )}
    </div>
  )
}
