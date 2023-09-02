import { responseHeaders } from "@/v2/lib/responseHeaders"
import { getConnection } from "@/v2/db/turso"
import { like } from "drizzle-orm"
import type { APIContext as Context } from "@/worker-configuration"

function SplitQueryByCommas(query: string): string[] {
	return query.split(",") ? query.split(",") : [query]
}

export async function searchForAssets(c: Context): Promise<Response> {
	const cacheKey = new Request(c.req.url.toString(), c.req)
	const cache = caches.default
	let response = await cache.match(cacheKey)
	if (response) return response

	const { query, game, assetCategory, assetTags } = c.req.param()

	// search parameters can include optional search params: query, game, assetCategory, assetTags
	// query?: string => ?query=keqing
	// game?: comma separated list of game names => ?game=genshin-impact,honkai-impact-3rd
	// assetCategory?: comma separated list of asset category names => ?assetCategory=splash-art,character-sheets
	// assetTags?: comma separated list of asset tag names => ?assetTags=no-background,fanmade,official

	const drizzle = await getConnection(c.env).drizzle

	const searchQuery = query ?? null
	const gameList = game ? SplitQueryByCommas(game) : null
	const assetCategoryList = assetCategory
		? SplitQueryByCommas(assetCategory)
		: null
	const assetTagsList = assetTags ? SplitQueryByCommas(assetTags) : null

	const assetResponse = await drizzle.query.assets.findMany({
		where: (assets, { and, or, eq }) => {
			return and(
				searchQuery ? like(assets.name, `%${searchQuery}%`) : null,
				gameList
					? or(...gameList.map((game) => eq(assets.game, game)))
					: null,
				assetCategoryList
					? or(
							...assetCategoryList.map((assetCategory) =>
								eq(assets.assetCategory, assetCategory)
							)
					  )
					: null,
				eq(assets.status, "approved")
			)
		},
		...(assetTagsList.length > 0
			? {
					with: {
						assetTags: {
							where: (assetTags, { and, eq }) => {
								return and(
									...assetTagsList.map((assetTag) =>
										eq(assetTags.name, assetTag)
									)
								)
							},
						},
					},
			  }
			: {}),
	})

	response = c.json(
		{
			success: true,
			status: "ok",
			query,
			game,
			assetCategory,
			assetTags,
			results: assetResponse,
		},
		200,
		responseHeaders
	)

	return response
}
