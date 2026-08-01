import {
    sqliteTable,
    integer,
    text,
} from "drizzle-orm/sqlite-core";

import { categories } from "./categories";
import { relations } from "drizzle-orm";
import { product_prices } from "./product_prices";


export const products = sqliteTable("products", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    category_id: integer("category_id").notNull(),
    image: text("image"),
    created_at: integer("created_at"),
});


export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),

  prices: many(product_prices),
}));