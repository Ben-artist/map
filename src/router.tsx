import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import {
  parseMapSearch,
  stringifyMapSearch,
} from '#/lib/map-search-serialization.ts'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    parseSearch: parseMapSearch,
    stringifySearch: stringifyMapSearch,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
