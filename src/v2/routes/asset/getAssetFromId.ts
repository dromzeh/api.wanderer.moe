import { getConnection } from "@/v2/db/turso"
import { assets } from "@/v2/db/schema"
import { desc } from "drizzle-orm"
import type { APIContext as Context } from "@/worker-configuration"

export async function getAssetFromId(c: Context): Promise<Response> {
	const { id } = c.req.param()
	const cacheKey = new Request(c.req.url.toString(), c.req)
	const cache = caches.default
	let response = await cache.match(cacheKey)

	if (response) return response

	const drizzle = getConnection(c.env).drizzle

	const asset = await drizzle.query.assets.findFirst({
		where: (assets, { eq, and }) =>
			and(eq(assets.status, 1), eq(assets.id, parseInt(id))),
		with: {
			assetTagsAssets: {
				with: {
					assetTags: true,
				},
			},
		},
	})

	if (!asset) {
		c.status(200)
		response = c.json({
			success: false,
			status: "not found",
		})
		await cache.put(cacheKey, response.clone())
		return response
	}

	const similarAssets = await drizzle.query.assets.findMany({
		where: (assets, { eq, and }) =>
			and(
				eq(assets.status, 1),
				eq(assets.assetCategory, asset.assetCategory)
			),
		limit: 6,
		orderBy: desc(assets.id),
	})

	c.status(200)
	response = c.json({
		success: true,
		status: "ok",
		asset,
		similarAssets,
	})

	response.headers.set("Cache-Control", "s-maxage=604800")
	await cache.put(cacheKey, response.clone())

	return response
}
