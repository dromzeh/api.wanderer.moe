import { OpenAPIHono } from "@hono/zod-openapi"
import { userLoginRoute } from "./openapi"
import { UserAuthenticationManager } from "@/v2/lib/managers/auth/user-auth-manager"

const handler = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

handler.openapi(userLoginRoute, async (ctx) => {
    const currentUser = "hi"

    if (currentUser) {
        return ctx.json(
            {
                success: false,
                error: "Already logged in",
            },
            401
        )
    }

    const { email, password } = ctx.req.valid("json")

    const userAuthManager = new UserAuthenticationManager(ctx)

    const newLoginCookie = await userAuthManager.loginViaPassword(
        email,
        password
    )

    if (!newLoginCookie) {
        return ctx.json(
            {
                success: false,
                error: "Invalid credentials",
            },
            401
        )
    }

    ctx.header("Set-Cookie", newLoginCookie.serialize(), {
        append: true,
    })

    return ctx.json(
        {
            success: true,
        },
        200
    )
})

export default handler
