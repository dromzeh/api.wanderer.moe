import { OpenAPIHono } from "@hono/zod-openapi"
import { getUserByNameRoute } from "./openapi"
import { authUser } from "@/v2/db/schema"
import { eq } from "drizzle-orm"
import { getConnection } from "@/v2/db/turso"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(getUserByNameRoute, async (ctx) => {
    const username = ctx.req.valid("param").username

    const { drizzle } = await getConnection(ctx.env)

    const [user] = await drizzle
        .select({
            id: authUser.id,
            avatarUrl: authUser.avatarUrl,
            displayName: authUser.displayName,
            username: authUser.username,
            usernameColour: authUser.usernameColour,
            pronouns: authUser.pronouns,
            verified: authUser.verified,
            bio: authUser.bio,
            dateJoined: authUser.dateJoined,
            isSupporter: authUser.isSupporter,
            role: authUser.role,
        })
        .from(authUser)
        .where(eq(authUser.username, username))

    return ctx.json(
        {
            success: true,
            user,
        },
        200
    )
})

export default handler
