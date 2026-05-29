export interface ChinaHistoryRuler {
  /** 姓名 */
  name: string
  /** 庙号、谥号或帝号（如「汉武帝」） */
  title?: string
  /** 在位纪年展示 */
  reign?: string
  /** 所属政权（分裂时期分组用） */
  regime?: string
  /** 补充说明（开国、末帝、临朝等） */
  note?: string
}

export interface ChinaHistoryPeriod {
  id: string
  name: string
  rangeLabel: string
  startYear: number
  endYear: number
  summary: string
  /** UI 称谓，默认「统治者」 */
  rulerRole?: string
  rulers: ChinaHistoryRuler[]
}
