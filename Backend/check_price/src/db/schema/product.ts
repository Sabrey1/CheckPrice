import {
    sqliteTable,
    integer,
    text,
} from "drizzle-orm/sqlite-core";

import { categories } from "./categories";
import { branchs } from "./branch";
import { relations } from "drizzle-orm"; 


export const products = sqliteTable("products", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    category_id: integer("category_id").notNull(),
    branch_id: integer("branch_id").notNull(),
    name: text("name").notNull(),
    cost_price: text("cost_price"),
    sale_price: text("sale_price"),
    description: text("description"),
    image: text("image"),
    created_at: integer("created_at"),
});


export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
  branch: one(branchs, {
    fields: [products.branch_id],
    references: [branchs.id],
  }),
}));