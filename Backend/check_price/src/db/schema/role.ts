import {
    sqliteTable,
    integer,
    text,
} from "drizzle-orm/sqlite-core";

import { users } from "./users";
import { relations } from "drizzle-orm/relations";

export const roles = sqliteTable("roles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    branch_id: integer("branch_id"),
    created_at: integer("created_at"),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));