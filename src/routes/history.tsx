import { createFileRoute } from '@tanstack/react-router'
import Header from '#/components/Header.tsx'
import { ChinaHistoryExplorer } from '#/components/ChinaHistoryExplorer.tsx'
import { getChinaHistoryPeriod } from '#/data/china-history.ts'

type HistorySearch = {
  period?: string
}

function validateHistorySearch(search: Record<string, unknown>): HistorySearch {
  const period =
    typeof search.period === 'string' && getChinaHistoryPeriod(search.period)
      ? search.period
      : undefined
  return { period }
}

export const Route = createFileRoute('/history')({
  validateSearch: validateHistorySearch,
  component: HistoryPage,
})

function HistoryPage() {
  const { period } = Route.useSearch()

  return (
    <>
      <Header />
      <main className="history-page min-h-[calc(100dvh-4rem)]">
        <div className="page-wrap px-4 py-8 sm:py-10">
          <ChinaHistoryExplorer initialPeriodId={period} />
        </div>
      </main>
    </>
  )
}
