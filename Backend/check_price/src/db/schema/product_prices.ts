import {
    sqliteTable,
    integer,
    text,
    numeric
} from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";
import { products } from "./product";
import { branchs } from "./branch";


export const product_prices = sqliteTable("product_prices", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    product_id: text("product_id").notNull(),
    branch_id: text("branch_id").notNull(),
    selling_price: numeric("selling_price").notNull(),
    discount_price: numeric("discount_price"),
    created_at: integer("created_at"),
});


export const productPricesRelations = relations(product_prices, ({ one }) => ({
  product: one(products, {
    fields: [product_prices.product_id],
    references: [products.id],
  }),

  branch: one(branchs, {
    fields: [product_prices.branch_id],
    references: [branchs.id],
  }),
}));