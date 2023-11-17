import { DrizzleInstance } from "@/v2/db/turso"
import {
    asset,
    assetCategory,
    assetTag,
    assetTagAsset,
    game,
} from "@/v2/db/schema"
import { eq, or, like, sql, and } from "drizzle-orm"
import { R2Bucket } from "@cloudflare/workers-types"
import { SplitQueryByCommas } from "../../helpers/split-query-by-commas"
import { z } from "zod"
import type { Asset, NewAsset } from "@/v2/db/schema"

// these are all optional
type AssetSearchQuery = {
    name?: string
    game?: string
    category?: string
    tag?: string
    limit?: number
}

const MAX_FILE_SIZE = 5000
const ACCEPTED_IMAGE_TYPES = ["image/png"]

export const UploadAssetSchema = z.object({
    asset: z
        .any()
        .refine((files) => files?.length == 1, "Image is required.")
        .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            `Max file size is 5MB.`
        )
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            ".jpg, .jpeg, .png and .webp files are accepted."
        ),
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    extension: z.string({
        required_error: "Extension is required",
        invalid_type_error: "Extension must be a string",
    }),
    tags: z.string().optional(),
    assetCategoryId: z.string({
        required_error: "Category is required",
        invalid_type_error: "Category must be a string",
    }),
    gameId: z.string({
        required_error: "Game is required",
        invalid_type_error: "Game must be a string",
    }),
    size: z.number({
        required_error: "Size is required",
        invalid_type_error: "Size must be a number",
    }),
    width: z.number({
        required_error: "Width is required",
        invalid_type_error: "Width must be a number",
    }),
    height: z.number({
        required_error: "Height is required",
        invalid_type_error: "Height must be a number",
    }),
})

export class AssetManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Retrieves an asset by its ID.
     * @param assetId - The unique ID of the asset to retrieve.
     * @returns A promise that resolves to the retrieved asset, its game, category and tags.
     */
    public async getAssetById(assetId: number): Promise<Asset | null> {
        try {
            const [foundAsset] = await this.drizzle
                .select()
                .from(asset)
                .where(eq(asset.id, assetId))

            return foundAsset ?? null
        } catch (e) {
            console.error(`Error getting asset by ID ${assetId}`, e)
            throw new Error(`Error getting asset by ID ${assetId}`)
        }
    }

    /**
     * Retrieves a list of all assets.
     * @returns A promise that resolves to an array of assets.
     */
    public async listAssets(): Promise<Asset[]> {
        try {
            const assets = await this.drizzle.select().from(asset)

            return assets
        } catch (e) {
            console.error("Error listing assets", e)
            throw new Error("Error listing assets")
        }
    }

    /**
     * Searches for assets based on optional query filters.
     * @param query - An object containing optional search parameters.
     * @returns A promise that resolves to an array of matching assets.
     */
    public async searchAssets(
        query: AssetSearchQuery
    ): Promise<Asset[] | Asset | null> {
        try {
            const { name, game, category, tag, limit } = query

            const assetLimit = limit ?? 500
            const gameList = game
                ? SplitQueryByCommas(game.toLowerCase())
                : null
            const categoryList = category
                ? SplitQueryByCommas(category.toLowerCase())
                : null
            const tagList = tag
                ? SplitQueryByCommas(tag.toLowerCase())
                : ["official"]
            const searchQuery = name ?? null

            const assetTagResponse = this.drizzle.$with("sq").as(
                this.drizzle
                    .select({
                        assetId: assetTagAsset.assetId,
                        tags: sql<string[] | null>`array_agg(${assetTag})`.as(
                            "tags"
                        ),
                    })
                    .from(assetTagAsset)
                    .leftJoin(
                        assetTag,
                        eq(assetTag.id, assetTagAsset.assetTagId)
                    )
                    .where(or(...tagList.map((tag) => eq(assetTag.name, tag))))
                    .groupBy(assetTagAsset.assetId)
            )

            const foundAssets = await this.drizzle
                .with(assetTagResponse)
                .select()
                .from(asset)
                .innerJoin(
                    assetTagResponse,
                    eq(assetTagResponse.assetId, asset.id)
                )
                .where(
                    and(
                        searchQuery && like(asset.name, `%${searchQuery}%`),
                        gameList &&
                            or(
                                ...gameList.map((game) =>
                                    eq(asset.assetCategoryId, game)
                                )
                            ),
                        categoryList &&
                            or(
                                ...categoryList.map((category) =>
                                    eq(asset.assetCategoryId, category)
                                )
                            )
                    )
                )
                .groupBy(asset.id)
                .limit(assetLimit)

            // TODO(dromzeh): the incorrect type is occuring becuase of the inner join, idk how to fix it tbh
            // @ts-expect-error - i need to fix this
            return foundAssets
        } catch (e) {
            console.error("Error searching assets", e)
            throw new Error("Error searching assets")
        }
    }

    /**
     * Creates a new asset.
     * @param userId - The ID of the user creating the asset.
     * @param newAsset - The new asset data, adhering to the UploadAssetSchema.
     * @param bucket - The Cloudflare R2Bucket for asset storage.
     * @param file - The File object representing the asset to be uploaded.
     * @returns A promise that resolves to the created asset.
     */
    public async createAsset(
        userId: string,
        newAsset: z.infer<typeof UploadAssetSchema>,
        bucket: R2Bucket,
        file: File
    ): Promise<NewAsset> {
        try {
            const { key } = await bucket.put(
                `/assets/${newAsset.gameId}/${newAsset.assetCategoryId}/${newAsset.name}.${newAsset.extension}`,
                file
            )

            const returnedNewAsset: NewAsset = await this.drizzle.transaction(
                async (trx) => {
                    const [createdAsset] = await trx
                        .insert(asset)
                        .values({
                            name: newAsset.name,
                            extension: newAsset.extension,
                            gameId: newAsset.gameId,
                            assetCategoryId: newAsset.assetCategoryId,
                            url: key,
                            uploadedById: userId,
                            status: "pending",
                            fileSize: newAsset.size,
                            width: newAsset.width,
                            height: newAsset.height,
                        })
                        .returning()

                    await trx
                        .update(game)
                        .set({
                            assetCount: sql<number>`asset_count + 1`,
                        })
                        .where(eq(game.id, newAsset.gameId))

                    await trx
                        .update(assetCategory)
                        .set({
                            assetCount: sql<number>`asset_count + 1`,
                        })
                        .where(eq(assetCategory.id, newAsset.assetCategoryId))

                    const tags = newAsset.tags
                        ? SplitQueryByCommas(newAsset.tags)
                        : []

                    if (tags.length === 0) return createdAsset

                    for (const tag of tags) {
                        const foundTag = await trx
                            .select()
                            .from(assetTag)
                            .where(eq(assetTag.name, tag))

                        if (foundTag.length === 0) {
                            await trx.insert(assetTagAsset).values({
                                assetId: createdAsset[0].assetId,
                                assetTagId: tag,
                            })
                        }
                    }

                    return createdAsset
                }
            )

            return returnedNewAsset
        } catch (e) {
            console.error("Error creating asset", e)
            throw new Error("Error creating asset")
        }
    }
}
