import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDB } from "../config/db";
import { branchs } from "../db/schema/branch";
import type { Env } from "../types/env";

export const Routerbranch = new Hono<{ Bindings: Env }>();

// GET ALL
Routerbranch.get("/", async (c) => {
  const db = getDB(c.env.DB);

  const data = await db.select().from(branchs).all();

  return c.json({
    success: true,
    data,
  });
});

// GET BY ID
Routerbranch.get("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.select().from(branchs).where(eq(branchs.id, Number(id))).all();

  return c.json({
    success: true,
    data,
  });
});

// post 
Routerbranch.post("/", async (c) => {
  const db = getDB(c.env.DB);
  const body = await c.req.json();

  const data = await db.insert(branchs).values(body).returning().all();

  return c.json({
    success: true,
    data,
  });
});

// put
Routerbranch.put("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();

  const data = await db.update(branchs).set(body).where(eq(branchs.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data,
  });
});

//delete

Routerbranch.delete("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.delete(branchs).where(eq(branchs.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data,
  });
});


