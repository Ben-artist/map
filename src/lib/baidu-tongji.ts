declare global {
  interface Window {
    _hmt?: Array<[string, ...unknown[]]>
  }
}

const LOADED_IDS = new Set<string>()

/**
 * 百度统计站点 ID（来自环境变量，仅生产构建需配置）。
 */
export function getBaiduTongjiSiteId(): string | undefined {
  const id = import.meta.env.VITE_BAIDU_TONGJI_ID
  if (typeof id !== 'string' || !/^[a-f0-9]{16,32}$/i.test(id.trim())) {
    return undefined
  }
  return id.trim()
}

/**
 * 是否应在当前环境启用百度统计。
 */
export function isBaiduTongjiEnabled(): boolean {
  return import.meta.env.PROD && Boolean(getBaiduTongjiSiteId())
}

/**
 * 注入 hm.js（同一站点 ID 只加载一次）。
 */
export function loadBaiduTongjiScript(siteId: string): void {
  if (typeof document === 'undefined' || LOADED_IDS.has(siteId)) return

  window._hmt = window._hmt || []
  const script = document.createElement('script')
  script.src = `https://hm.baidu.com/hm.js?${siteId}`
  script.async = true
  script.dataset.baiduTongji = siteId
  document.head.appendChild(script)
  LOADED_IDS.add(siteId)
}

/**
 * 上报 SPA 页面浏览（pathname + search）。
 */
export function trackBaiduPageview(path: string): void {
  if (!isBaiduTongjiEnabled()) return
  window._hmt = window._hmt || []
  window._hmt.push(['_trackPageview', path])
}
