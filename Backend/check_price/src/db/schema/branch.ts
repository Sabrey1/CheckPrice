import {
    sqliteTable,
    integer,
    text,
} from "drizzle-orm/sqlite-core";
import { products } from "./product";
import { users } from "./users";
import { relations } from "drizzle-orm/relations";

export const branchs = sqliteTable("branchs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    status: text("status").notNull(),
    created_at: integer("created_at"),
});

export const branchesRelations = relations(branchs, ({ many }) => ({
  users: many(users),
  prices: many(products),
}));