/**
 * ECharts 地图布局：用 layoutCenter + layoutSize 保持地理宽高比。
 * 勿用 top/left/right/bottom 百分比撑满，否则在竖屏下会把地图横向拉扁。
 */

export interface MapSeriesLayout {
  layoutCenter: [string, string]
  layoutSize: string | number
  /**
   * 校正经纬度在屏幕上的观感。ECharts 默认 0.75。
   * 实测：0.58 过瘦，0.82 过宽；0.72 在宽屏下较接近常见中国地图示意。
   */
  aspectScale: number
}

/** 16:9 视口下标定值 */
const REF_VIEWPORT_ASPECT = 16 / 9
const REF_ASPECT_SCALE = 0.7

/** 全国省级视图 */
export const CHINA_MAP_LAYOUT: MapSeriesLayout = {
  layoutCenter: ['50%', '51%'],
  layoutSize: '92%',
  aspectScale: REF_ASPECT_SCALE,
}

/** 省内市级视图 */
export const PROVINCE_MAP_LAYOUT: MapSeriesLayout = {
  layoutCenter: ['50%', '50%'],
  layoutSize: '90%',
  aspectScale: REF_ASPECT_SCALE,
}

/**
 * 按容器宽高比动态校正 aspectScale（宽屏略降低，避免地图被压扁）。
 */
export function dynamicAspectScale(
  containerWidth: number,
  containerHeight: number,
): number {
  if (containerWidth <= 0 || containerHeight <= 0) return REF_ASPECT_SCALE
  const ar = containerWidth / containerHeight
  const scale = REF_ASPECT_SCALE * (REF_VIEWPORT_ASPECT / ar) ** 0.35
  return Math.min(0.82, Math.max(0.7, scale))
}

/**
 * 将布局字段合并进 map series 配置。
 */
export function applyMapLayout<T extends Record<string, unknown>>(
  series: T,
  layout: MapSeriesLayout,
): T {
  return {
    ...series,
    layoutCenter: layout.layoutCenter,
    layoutSize: layout.layoutSize,
    aspectScale: layout.aspectScale,
    top: undefined,
    bottom: undefined,
    left: undefined,
    right: undefined,
  }
}
