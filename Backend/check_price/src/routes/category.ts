import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDB } from "../config/db";
import type { Env } from "../types/env";
import { categories } from "../db/schema";

export const Routercategory = new Hono<{ Bindings: Env }>();

// GET ALL
Routercategory.get("/", async (c) => {
  const db = getDB(c.env.DB);

  const data = await db.select().from(categories).all();

  return c.json({
    success: true,
    data,
  });
});

// GET BY ID
Routercategory.get("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.select().from(categories).where(eq(categories.id, Number(id))).all();

  return c.json({
    success: true,
    data,
  });
});

// post 
Routercategory.post("/", async (c) => {
  const db = getDB(c.env.DB);
  const body = await c.req.json();

  const data = await db.insert(categories).values(body).returning().all();

  return c.json({
    success: true,
    data,
  });
});

// put
Routercategory.put("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();

  const data = await db.update(categories).set(body).where(eq(categories.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data,
  });
});

//delete

Routercategory.delete("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.delete(categories).where(eq(categories.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data,
  });
});
