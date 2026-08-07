import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDB } from "../config/db";
import { roles } from "../db/schema/role";
import type { Env } from "../types/env";

export const RouterRole = new Hono<{ Bindings: Env }>();

// GET ALL
RouterRole.get("/", async (c) => {
  const db = getDB(c.env.DB);

  const data = await db.select().from(roles).all();

  return c.json({
    success: true,
    data,
  });
});

// GET BY ID
RouterRole.get("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.select().from(roles).where(eq(roles.id, Number(id))).all();

  return c.json({
    success: true,
    data,
  });
});

// post 
RouterRole.post("/", async (c) => {
  const db = getDB(c.env.DB);
  const body = await c.req.json();

  const data = await db.insert(roles).values(body).returning().all();

  return c.json({
    success: true,
    data,
  });
});

// put
RouterRole.put("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();

  const data = await db.update(roles).set(body).where(eq(roles.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data,
  });
});

//delete

RouterRole.delete("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.delete(roles).where(eq(roles.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data,
  });
});