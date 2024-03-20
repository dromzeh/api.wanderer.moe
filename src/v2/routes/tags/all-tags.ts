import { AppHandler } from "../handler"
import { getConnection } from "@/v2/db/turso"
import { assetTag } from "@/v2/db/schema"
import { GenericResponses } from "@/v2/lib/response-schemas"
import { createRoute } from "@hono/zod-openapi"
import { z } from "@hono/zod-openapi"
import { selectAssetTagSchema } from "@/v2/db/schema"

const responseSchema = z.object({
    success: z.literal(true),
    tags: selectAssetTagSchema.array(),
})

const openRoute = createRoute({
    path: "/all",
    method: "get",
    summary: "Get all tags",
    description: "Get all tags.",
    tags: ["Tags"],
    responses: {
        200: {
            description: "All tags.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const AllTagsRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const { drizzle } = await getConnection(ctx.env)

        const tags = (await drizzle.select().from(assetTag)) ?? []

        return ctx.json(
            {
                success: true,
                tags,
            },
            200
        )
    })
}
