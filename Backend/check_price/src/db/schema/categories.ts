import {
    sqliteTable,
    integer,
    text,
} from "drizzle-orm/sqlite-core";

import { products } from "./product";
import { relations } from "drizzle-orm/relations";

export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    branch_id: integer("branch_id"),
    description: text("description"),
    created_at: integer("created_at"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));