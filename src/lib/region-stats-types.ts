/** 地区经济社会指标（统计公报口径，亿元 / 万人 / 万 km²） */
export interface RegionStats {
  adcode: string
  year: number
  /** GDP，单位：亿元 */
  gdpYi: number
  /** 常住人口，单位：万人 */
  populationWan: number
  /** 土地面积，单位：万 km² */
  areaWanKm2: number
  /** 城镇化率，0–100 */
  urbanRate: number
  /** 是否为估算或参考上级数据 */
  estimated?: boolean
}

export interface RegionStatsMetric {
  key: string
  label: string
  value: number
  unit: string
  /** 图表归一化高度 0–100 */
  chartHeight: number
  display: string
}
