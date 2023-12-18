import { OpenAPIHono } from "@hono/zod-openapi"
import { uploadAssetRoute } from "./openapi"
import { AuthSessionManager } from "@/v2/lib/managers/auth/user-session-manager"
import { AssetManager } from "@/v2/lib/managers/asset/asset-manager"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(uploadAssetRoute, async (ctx) => {
    const authSessionManager = new AuthSessionManager(ctx)

    const { user } = await authSessionManager.validateSession()

    if (!user) {
        return ctx.json(
            {
                success: false,
                error: "Unauthorized",
            },
            401
        )
    }

    const { asset, name, tags, assetCategoryId, gameId } = ctx.req.valid("form")

    const { drizzle } = getConnection(ctx.env)
    const assetManager = new AssetManager(drizzle)

    const newAsset = await assetManager.createAsset(
        user.id,
        user.username,
        {
            name,
            tags,
            assetCategoryId,
            gameId,
        },
        ctx.env.FILES_BUCKET,
        asset as File
    )

    return ctx.json(
        {
            success: true,
            asset: newAsset,
        },
        200
    )
})

export default handler
