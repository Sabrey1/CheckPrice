import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDB } from "../config/db";
import { products } from "../db/schema/product";
import type { Env } from "../types/env";

export const Routerproduct = new Hono<{ Bindings: Env }>();

// GET ALL
Routerproduct.get("/", async (c) => {
  const db = getDB(c.env.DB);

  const data = await db.select().from(products).all();

  return c.json({
    success: true,
    data,
  });
});

// GET BY ID
Routerproduct.get("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.select().from(products).where(eq(products.id, Number(id))).all();

  return c.json({
    success: true,
    data,
  });
});

// post 
Routerproduct.post("/", async (c) => {
  const db = getDB(c.env.DB);
  const body = await c.req.json();

  const data = await db.insert(products).values(body).returning().all();

  return c.json({
    success: true,
    data,
  });
});

// put
Routerproduct.put("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();

  const data = await db.update(products).set(body).where(eq(products.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data,
  });
});

//delete

Routerproduct.delete("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.delete(products).where(eq(products.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data,
  });
});