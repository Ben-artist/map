/**
 * 与 Vite `base` / Nitro `baseURL` 对齐的路由前缀。
 * 开发环境 base 为 `/` 时不设 basepath；生产挂载在 `/map/` 时为 `/map`。
 */
export function getAppBasepath(): string | undefined {
  const trimmed = import.meta.env.BASE_URL.replace(/\/$/, '')
  if (!trimmed || trimmed === '/') return undefined
  return trimmed
}
