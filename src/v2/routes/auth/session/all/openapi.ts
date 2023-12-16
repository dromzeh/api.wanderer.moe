import { createRoute } from "@hono/zod-openapi"

export const authAllCurrentSessions = createRoute({
    path: "/",
    method: "get",
    description: "Get all current sessions.",
    tags: ["Auth"],
    responses: {
        200: {
            description: "All current sessions are returned",
        },
        401: {
            description: "Unauthorized",
        },
        500: {
            description: "Internal server error.",
        },
    },
})
