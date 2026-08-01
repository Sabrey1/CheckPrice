import {
    sqliteTable,
    integer,
    text,
} from "drizzle-orm/sqlite-core";

export const roles = sqliteTable("roles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    created_at: integer("created_at"),
});