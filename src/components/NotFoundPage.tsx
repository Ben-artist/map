import { Link } from '@tanstack/react-router'
import Header from '#/components/Header.tsx'

/** 全站 404 页面，由根路由 notFoundComponent 渲染。 */
export function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="page-wrap flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-16 text-center">
        <p className="island-kicker m-0">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-(--sea-ink)">页面未找到</h1>
        <p className="mt-2 max-w-md text-(--sea-ink-soft)">
          您访问的地址不存在，或已被移动。
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full border border-(--chip-line) bg-(--chip-bg) px-5 py-2.5 text-sm font-semibold text-(--sea-ink) no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] transition hover:bg-(--link-bg-hover)"
        >
          返回地图首页
        </Link>
      </main>
    </>
  )
}
