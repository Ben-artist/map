/**
 * 格式化为中文纪年展示。
 * @param year - 公元纪年；公元前为负数
 */
export function formatYear(year: number): string {
  if (year < 0) return `公元前${Math.abs(year)}年`
  return `${year}年`
}

/**
 * 格式化为年份区间（起止可为公元前）。
 */
export function formatYearRange(startYear: number, endYear: number): string {
  if (startYear === endYear) return formatYear(startYear)
  return `${formatYear(startYear)} — ${formatYear(endYear)}`
}
