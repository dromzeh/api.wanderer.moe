import { DrizzleInstance } from "@/v2/db/turso"
import { and, eq } from "drizzle-orm"
import { userNetworking } from "@/v2/db/schema"
import type { UserNetworking, NewUserNetworking } from "@/v2/db/schema"

/**
 * Manages user follow and unfollow operations.
 */
export class UserFollowManager {
    constructor(private drizzle: DrizzleInstance) {}

    /**
     * Follows a user by creating a following relationship between two users.
     *
     * @param followerId - The ID of the user who is following.
     * @param followingId - The ID of the user being followed.
     * @returns The user networking object representing the follow relationship.
     */
    public async followUser(
        followerId: string,
        followingId: string
    ): Promise<NewUserNetworking> {
        try {
            const [networking] = await this.drizzle
                .insert(userNetworking)
                .values({
                    followerId,
                    followingId,
                    createdAt: new Date().toISOString(),
                })
                .returning()

            return networking
        } catch (e) {
            console.error(
                `Error following user ${followingId} from user ${followerId}`,
                e
            )
            throw new Error(
                `Error following user ${followingId} from user ${followerId}`
            )
        }
    }

    /**
     * Unfollows a user by removing the following relationship between two users.
     *
     * @param followerId - The ID of the user who is unfollowing.
     * @param followingId - The ID of the user being unfollowed.
     * @returns The user networking object representing the removed follow relationship.
     */
    public async unfollowUser(
        followerId: string,
        followingId: string
    ): Promise<UserNetworking> {
        try {
            const [networking] = await this.drizzle
                .delete(userNetworking)
                .where(
                    and(
                        eq(userNetworking.followerId, followerId),
                        eq(userNetworking.followingId, followingId)
                    )
                )
                .returning()

            return networking
        } catch (e) {
            console.error(
                `Error unfollowing user ${followingId} from user ${followerId}`,
                e
            )
            throw new Error(
                `Error unfollowing user ${followingId} from user ${followerId}`
            )
        }
    }

    /**
     * Retrieves the followers of a user by their user ID.
     *
     * @param userId - The ID of the user for whom to retrieve followers.
     * @returns An array of user networking objects representing followers.
     */
    public async getFollowers(
        userId: string
    ): Promise<UserNetworking[] | null> {
        try {
            const followers = await this.drizzle
                .select()
                .from(userNetworking)
                .where(eq(userNetworking.followingId, userId))

            return followers ?? null
        } catch (e) {
            console.error(`Error getting followers for user ${userId}`, e)
            throw new Error(`Error getting followers for user ${userId}`)
        }
    }
}
