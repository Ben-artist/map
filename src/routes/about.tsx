import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">关于</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          读懂中国
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          地名科普地图：探索省、市地名由来与车牌，支持搜索、详情面板与 URL 分享深链。
          地图数据来自 geojson.cn，技术栈为 TanStack Start + shadcn/ui + D3。
          后续计划支持市级下钻与更丰富的知识库。本站使用百度统计了解访问情况，仅用于改进产品体验。
        </p>
      </section>
    </main>
  )
}
