import {
    sqliteTable,
    integer,
    text,
} from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    branch_id: integer("branch_id"),
    description: text("description"),
    created_at: integer("created_at"),
});