import { Context } from "hono"

declare global {
    /**
     * Environment variables that are required by the API.
     */
    type Bindings = {
        DISCORD_TOKEN: string
        FILES_BUCKET: R2Bucket
        ENVIRONMENT: "PROD" | "DEV"
        VERY_SECRET_SIGNUP_KEY: string
        TURSO_DATABASE_URL: string
        TURSO_DATABASE_AUTH_TOKEN: string
        DISCORD_CLIENT_ID: string
        DISCORD_CLIENT_SECRET: string
        DISCORD_REDIRECT_URI: string
        RESEND_API_KEY: string
        RATE_LIMITER: DurableObjectNamespace
        REKOGNITION_LABEL_API_KEY: string
    }

    type Variables = {
        //
    }

    export type APIContext = Context<{
        Bindings: Bindings
        Variables: Variables
    }>
}

export default global
