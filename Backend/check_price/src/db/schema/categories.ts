import {
    sqliteTable,
    integer,
    text,
} from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    created_at: integer("created_at"),
});