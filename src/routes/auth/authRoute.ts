import { Hono } from "hono"
import { login } from "./login"
import { logout } from "./logout"
import { signup } from "./signup"
import { cors } from "hono/cors"
import { validate } from "./validate"
import { uploadProfileImage } from "./user-attributes/self-upload/uploadAvatar"
import { uploadBannerImage } from "./user-attributes/self-upload/uploadBanner"
import { saveOCGeneratorResponse } from "./oc-generators/saveOCGeneratorResponse"
import { updateUserAttributes } from "./user-attributes/updateUserAttributes"
import { uploadAsset } from "./user-attributes/self-upload/uploadAsset"
import { Bindings } from "@/worker-configuration"
import { viewOCGeneratorResponses } from "./oc-generators/viewOCGeneratorResponses"

const authRoute = new Hono<{ Bindings: Bindings }>()

authRoute.use(
    "*",
    cors({
        credentials: true,
        origin: ["https://next.wanderer.moe"],
    })
)

authRoute.post("/login", async (c) => {
    return login(c)
})

authRoute.post("/update/attributes", async (c) => {
    return updateUserAttributes(c)
})

authRoute.post("/upload/asset", async (c) => {
    return uploadAsset(c)
})

authRoute.post("/upload/avatar", async (c) => {
    return uploadProfileImage(c)
})

authRoute.post("/upload/banner", async (c) => {
    return uploadBannerImage(c)
})

authRoute.post("/signup", async (c) => {
    return signup(c)
})

authRoute.post("/oc-generator/save", async (c) => {
    return saveOCGeneratorResponse(c)
})

authRoute.get("/oc-generator/view/all", async (c) => {
    return viewOCGeneratorResponses(c)
})

authRoute.get("/validate", async (c) => {
    return validate(c)
})

authRoute.post("/logout", async (c) => {
    return logout(c)
})

export default authRoute
