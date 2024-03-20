import { AppHandler } from "../handler"
import { createRoute } from "@hono/zod-openapi"
import { assetTag } from "@/v2/db/schema"
import { getConnection } from "@/v2/db/turso"
import { eq } from "drizzle-orm"
import { z } from "@hono/zod-openapi"
import { selectAssetTagSchema } from "@/v2/db/schema"
import { GenericResponses } from "@/v2/lib/response-schemas"

const paramsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            description: "The ID of the tag to retrieve.",
            example: "official",
            required: true,
        },
    }),
})

const responseSchema = z.object({
    success: z.literal(true),
    tag: selectAssetTagSchema,
})

const openRoute = createRoute({
    path: "/{id}",
    method: "get",
    summary: "Get a tag",
    description: "Get tag by their ID.",
    tags: ["Tags"],
    request: {
        params: paramsSchema,
    },
    responses: {
        200: {
            description: "Tag was found.",
            content: {
                "application/json": {
                    schema: responseSchema,
                },
            },
        },
        ...GenericResponses,
    },
})

export const GetTagByIdRoute = (handler: AppHandler) => {
    handler.openapi(openRoute, async (ctx) => {
        const id = ctx.req.valid("param").id

        const { drizzle } = await getConnection(ctx.env)

        const [foundTag] = await drizzle
            .select()
            .from(assetTag)
            .where(eq(assetTag.id, id))

        if (!foundTag) {
            return ctx.json(
                {
                    success: false,
                    message: "Tag not found",
                },
                400
            )
        }

        return ctx.json(
            {
                success: true,
                tag: foundTag,
            },
            200
        )
    })
}
