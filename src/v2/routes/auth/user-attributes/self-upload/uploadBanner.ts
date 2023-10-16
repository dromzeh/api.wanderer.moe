import { auth } from "@/v2/lib/auth/lucia"
import { z } from "zod"

const ALLOWED_BANNER_TYPES = ["image/png"]
const MAX_BANNER_SIZE = 5000
// TODO(dromzeh): implement size checks
// const MAX_BANNER_WIDTH = 1920
// const MAX_BANNER_HEIGHT = 1080

const UploadBannerSchema = z.object({
    banner: z
        .any()
        .refine((files) => files?.length == 1, "Banner is required.")
        .refine(
            (files) => files?.[0]?.size <= MAX_BANNER_SIZE,
            `Max file size is 5MB.`
        )
        .refine(
            (files) => ALLOWED_BANNER_TYPES.includes(files?.[0]?.type),
            ".png files are accepted."
        ),
})

// TODO: add support for animated banners
export async function uploadBannerImage(c: APIContext): Promise<Response> {
    const formData = UploadBannerSchema.safeParse(
        await c.req.formData().then((formData) => {
            const data = Object.fromEntries(formData.entries())
            return data
        })
    )

    if (!formData.success) {
        return c.json({ success: false, state: "invalid data" }, 400)
    }

    const { banner } = formData.data

    const authRequest = auth(c.env).handleRequest(c)
    const session = await authRequest.validate()

    if (!session || session.state === "idle") {
        if (session) {
            await auth(c.env).invalidateSession(session.sessionId)
            authRequest.setSession(null)
        }
        return c.json({ success: false, state: "invalid session" }, 200)
    }

    if (session.user.isContributor !== 1) {
        return c.json({ success: false, state: "unauthorized" }, 401)
    }

    const newBanner = new File([banner], `${session.user.userId}.png`)
    const newBannerURL = `/banners/${session.user.userId}.png`

    if (!session.user.avatarUrl) {
        await auth(c.env).updateUserAttributes(session.user.userId, {
            banner_url: newBannerURL,
        })
    }

    if (session.user.avatarUrl) {
        const oldBannerObject = await c.env.FILES_BUCKET.get(
            session.user.bannerUrl
        )

        if (oldBannerObject) {
            await c.env.FILES_BUCKET.delete(session.user.avatarUrl)
        }
    }

    await c.env.FILES_BUCKET.put(newBannerURL, newBanner)

    return c.json({ success: true, state: "uploaded new banner" }, 200)
}
