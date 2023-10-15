import { getConnection } from "@/v2/db/turso"

export async function listAllAssetTags(c: APIContext): Promise<Response> {
    const cacheKey = new Request(c.req.url.toString(), c.req)
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (response) return response

    const drizzle = getConnection(c.env).drizzle

    const someAssetTags = await drizzle.query.assetTags.findMany({
        orderBy: (assetTags) => assetTags.name,
        limit: 500,
        with: {
            assetTagsAssets: {
                with: {
                    assets: true,
                },
            },
        },
    })

    response = c.json(
        {
            success: true,
            status: "ok",
            someAssetTags,
        },
        200
    )

    response.headers.set("Cache-Control", "s-maxage=604800")
    await cache.put(cacheKey, response.clone())

    return response
}
