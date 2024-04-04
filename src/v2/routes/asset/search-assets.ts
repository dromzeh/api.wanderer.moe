import { getConnection } from "@/v2/db/turso"
import { SplitQueryByCommas } from "@/v2/lib/helpers/split-query-by-commas"
import { createRoute } from "@hono/zod-openapi"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { z } from "@hono/zod-openapi"
import {
    selectAssetSchema,
    selectAssetTagAssetSchema,
    selectAssetTagSchema,
} from "@/v2/db/schema"
import { type AppHandler } from "../handler"

const responseSchema = z.object({
    success: z.literal(true),
    assets: z.array(
        selectAssetSchema
            .pick({
                id: true,
                name: true,
                extension: true,
                url: true,
                assetCategoryId: true,
                gameId: true,
                viewCount: true,
                downloadCount: true,
                uploadedDate: true,
                fileSize: true,
                width: true,
                height: true,
            })
            .extend({
                assetTagAsset: z.array(
                    selectAssetTagAssetSchema.pick({}).extend({
                        assetTag: selectAssetTagSchema.pick({
                            id: true,
                            formattedName: true,
                        }),
                    })
                ),
            })
    ),
})

const querySchema = z
    .object({
        name: z.string().openapi({
            param: {
                description:
                    "The name of the asset(s) to retrieve. Doesn't have to be exact, uses 'like' operator to search.",
                name: "name",
                in: "query",
                example: "keqing",
                required: false,
            },
        }),
        game: z.string().openapi({
            param: {
                description:
                    "The game id(s) of the asset(s) to retrieve. Comma seperated.",
                name: "game",
                in: "query",
                example: "genshin-impact,honkai-impact-3rd",
                required: false,
            },
        }),
        category: z.string().openapi({
            param: {
                description:
                    "The category id(s) of the asset(s) to retrieve. Comma seperated.",
                name: "category",
                in: "query",
                example: "character-sheets,splash-art",
                required: false,
            },
        }),
        tags: z.string().openapi({
            param: {
                description: "The tag id(s) of the asset(s) to retrieve.",
                name: "tags",
                in: "query",
                example: "official,fanmade",
                required: false,
            },
        }),
        offset: z.string().openapi({
            param: {
                description: "The offset for the asset(s) to retrieve.",
                name: "offset",
                example: "0",
                in: "query",
                required: false,
            },
        }),
        limit: z.string().openapi({
            param: {
                description: "The limit for the asset(s) to retrieve.",
                name: "limit",
                example: "25",
                in: "query",
                required: false,
            },
        }),
    })
    .partial()

export type assetSearchAllFilter = z.infer<typeof querySchema>

const openRoute = createRoute({
    path: "/search",
    method: "get",
    summary: "Search for assets",
    description: "Filter all assets",
    tags: ["Asset"],
    request: {
        query: querySchema,
    },
    responses: {
        200: {
            description: "Found assets",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const AssetSearchAllFilterRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { drizzle } = await getConnection(ctx.env)

        const { name, game, category, tags, offset, limit } =
            ctx.req.valid("query")

        const gameList = game ? SplitQueryByCommas(game.toLowerCase()) : null
        const categoryList = category
            ? SplitQueryByCommas(category.toLowerCase())
            : null
        const searchQuery = name ?? null
        const tagList = tags ? SplitQueryByCommas(tags.toLowerCase()) : null

        // is this bad for performance? probably
        const assets = await drizzle.query.asset.findMany({
            where: (asset, { and, or, like, eq, sql }) =>
                and(
                    tagList && tagList.length > 0
                        ? or(
                              ...tagList.map(
                                  (t) =>
                                      sql`EXISTS (SELECT 1 FROM assetTagAsset WHERE assetTagAsset.asset_id = ${asset.id} AND assetTagAsset.asset_tag_id = ${t})`
                              )
                          )
                        : undefined,
                    searchQuery
                        ? like(asset.name, `%${searchQuery}%`)
                        : undefined,
                    gameList
                        ? or(...gameList.map((game) => eq(asset.gameId, game)))
                        : undefined,
                    categoryList
                        ? or(
                              ...categoryList.map((category) =>
                                  eq(asset.assetCategoryId, category)
                              )
                          )
                        : undefined,
                    eq(asset.status, "approved")
                ),
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
            columns: {
                id: true,
                name: true,
                extension: true,
                url: true,
                assetCategoryId: true,
                gameId: true,
                viewCount: true,
                downloadCount: true,
                uploadedDate: true,
                fileSize: true,
                width: true,
                height: true,
            },
            with: {
                assetTagAsset: {
                    columns: {
                        assetTagId: false,
                        assetId: false,
                    },
                    with: {
                        assetTag: {
                            columns: {
                                id: true,
                                formattedName: true,
                            },
                        },
                    },
                },
            },
        })

        return ctx.json(
            {
                success: true,
                assets,
            },
            200
        )
    })
}
