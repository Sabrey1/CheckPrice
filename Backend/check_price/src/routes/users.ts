import { hashPassword } from "../lib/password";
import type { AppEnv} from '../middleware/auth';

import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDB } from "../config/db";
import { users } from "../db/schema/users";
import type { Env } from "../types/env";

export const RouterUser = new Hono<AppEnv>();

// GET ALL
RouterUser.get("/", async (c) => {
  const db = getDB(c.env.DB);

  const data = await db.select().from(users).all();

  const result = data.map(({ password, ...user }) => user);

  return c.json({
    success: true,
    data: result,
  });
});

// GET BY ID
RouterUser.get("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.select().from(users).where(eq(users.id, Number(id))).all();

  return c.json({
    success: true,
    data,
  });
});

// post 
RouterUser.post("/", async (c) => {
  const db = getDB(c.env.DB);
  const body = await c.req.json();

  const data = await db.insert(users).values({...body, password: await hashPassword(body.password)}).returning().all();

  return c.json({
    success: true,
    data: data.map(({ password, ...user }) => user),
  });
});

// put
RouterUser.put("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();

  if(body.password){
    body.password = await hashPassword(body.password);
  }

  const data = await db.update(users).set(body).where(eq(users.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data: data.map(({ password, ...user }) => user),
  });
});

//delete

RouterUser.delete("/:id", async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param("id");

  const data = await db.delete(users).where(eq(users.id, Number(id))).returning().all();

  return c.json({
    success: true,
    data,
  });
});