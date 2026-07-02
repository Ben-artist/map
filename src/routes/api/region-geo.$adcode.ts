import { createFileRoute } from '@tanstack/react-router'
import { fetchProvinceGeoUpstream } from '#/server/region-geo.server.ts'

export const Route = createFileRoute('/api/region-geo/$adcode')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { adcode } = params
        if (!/^\d{6}$/.test(adcode)) {
          return Response.json({ error: '无效的 adcode' }, { status: 400 })
        }

        try {
          const data = await fetchProvinceGeoUpstream(adcode)
          return Response.json(data)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : '无法加载地图数据'
          return Response.json({ error: message }, { status: 502 })
        }
      },
    },
  },
})
