import { tableNames } from "@/v2/db/drizzle"
import { relations } from "drizzle-orm"
import {
    sqliteTable,
    text,
    // uniqueIndex,
    index,
} from "drizzle-orm/sqlite-core"
import { authUser } from "../user/user"
import { userCollection } from "./user-collections"

export const userCollectionCollaborators = sqliteTable(
    tableNames.userCollectionCollaborators,
    {
        collectionId: text("collection_id")
            .notNull()
            .references(() => userCollection.id),
        collaboratorId: text("collaborator_id")
            .notNull()
            .references(() => authUser.id),
        createdAt: text("createdAt")
            .notNull()
            .$defaultFn(() => {
                return new Date().toISOString()
            }),
    },
    (userCollectionCollaborators) => {
        return {
            collectionIdx: index(
                "userCollectionCollaborators_collectionId_idx"
            ).on(userCollectionCollaborators.collectionId),
            collaboratorId: index(
                "userCollectionCollaborators_collaboratorId_idx"
            ).on(userCollectionCollaborators.collaboratorId),
        }
    }
)

export type UserCollectionCollaborators =
    typeof userCollectionCollaborators.$inferSelect
export type NewUserCollectionCollaborators =
    typeof userCollectionCollaborators.$inferInsert

export const userCollectionCollaboratorsRelations = relations(
    userCollectionCollaborators,
    ({ one }) => ({
        collection: one(userCollection, {
            fields: [userCollectionCollaborators.collectionId],
            references: [userCollection.id],
            relationName: "userCollectionCollaborators_collection_id",
        }),
        collaborator: one(authUser, {
            fields: [userCollectionCollaborators.collaboratorId],
            references: [authUser.id],
            relationName: "userCollectionCollaborators_collaborator_id",
        }),
    })
)
