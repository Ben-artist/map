import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import {
  getBaiduTongjiSiteId,
  isBaiduTongjiEnabled,
  loadBaiduTongjiScript,
  trackBaiduPageview,
} from '#/lib/baidu-tongji.ts'

/**
 * 生产环境加载百度统计，并在客户端路由变化时上报 PV。
 */
export function BaiduTongji() {
  const siteId = getBaiduTongjiSiteId()
  const loadedRef = useRef(false)

  const pagePath = useRouterState({
    select: (state) =>
      `${state.location.pathname}${state.location.searchStr ?? ''}`,
  })

  useEffect(() => {
    if (!siteId || !isBaiduTongjiEnabled() || loadedRef.current) return
    loadBaiduTongjiScript(siteId)
    loadedRef.current = true
  }, [siteId])

  useEffect(() => {
    if (!siteId || !isBaiduTongjiEnabled()) return
    trackBaiduPageview(pagePath)
  }, [pagePath, siteId])

  return null
}
