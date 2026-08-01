import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDB } from "../config/db";
import { branchs } from "../db/schema/branch";
import type { Env } from "../types/env";

const app = new Hono<{ Bindings: Env }>();

// GET ALL
app.get("/", async (c) => {
  const db = getDB(c.env.DB);

  const data = await db.select().from(branchs).all();

  return c.json({
    success: true,
    data,
  });
});
