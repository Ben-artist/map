import { createFileRoute } from '@tanstack/react-router'
import { ChinaMapExplorer } from '#/components/ChinaMapExplorer.tsx'
import { validateMapUrlSearch } from '#/lib/map-url.ts'

export const Route = createFileRoute('/')({
  validateSearch: validateMapUrlSearch,
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <ChinaMapExplorer />
    </main>
  )
}
