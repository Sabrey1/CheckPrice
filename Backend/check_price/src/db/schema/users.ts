import {
    sqliteTable,
    integer,
    text,
} from "drizzle-orm/sqlite-core";
import { roles } from "./role";
import { relations } from "drizzle-orm/relations";
import { branchs } from "./branch";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    role_id: integer("role_id").notNull().references(() => roles.id),
    branch_id: integer("branch_id").notNull().references(() => branchs.id),
    username: text("username").notNull(),
    password: text("password").notNull(),
    full_name: text("full_name"),
    phone: text("phone"),
    email: text("email"),
    active: text("active"),
    created_at: integer("created_at"),
});

export const usersRelations = relations(users, ({ one }) => ({
  branch: one(branchs, {
    fields: [users.branch_id],
    references: [branchs.id],
  }),

  role: one(roles, {
    fields: [users.role_id],
    references: [roles.id],
  }),
}));