import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDB } from "../config/db";
import type { Env } from "../types/env";
import { categories } from "../db/schema";

export const Routercategory = new Hono<{ Bindings: Env }>();
 
Routercategory.get("/", async (c) => {
  const db = getDB(c.env.DB);

  const branchId = c.req.query("branch_id");

  const data = await db
    .select()
    .from(categories)
    .where(
      branchId
        ? eq(categories.branch_id, Number(branchId))
        : undefined
    )
    .all();

  return c.json({
    success: true,
    data,
  });
});

Routercategory.get("/export", async (c) => {
  const db = getDB(c.env.DB);

  const branchId = c.req.query("branch_id");

  if (!branchId) {
    return c.json(
      {
        message: "branch_id is required",
      },
      400
    );
  }

  const data = await db
    .select({
      id: categories.id,
      name: categories.name,
      branch_id: categories.branch_id,
      description: categories.description,
      created_at: categories.created_at,
    })
    .from(categories)
    .where(eq(categories.branch_id, Number(branchId)))
    .all();

  const header =
    "id,name,branch_id,description,created_at";

  const rows = data.map((item) => {
    return [
      item.id,
      csvEscape(item.name),
      item.branch_id ?? "",
      csvEscape(item.description),
      item.created_at ?? "",
    ].join(",");
  });

  // UTF-8 BOM
  const csv =
    "\uFEFF" +
    [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",

      "Content-Disposition":
        `attachment; filename="categories_branch_${branchId}.csv"`,
    },
  });
});
 
Routercategory.get("/template", (c) => {
  const csv =
    "\uFEFF" +
    "name,branch_id,description\n";

  return new Response(csv, {
    headers: {
      "Content-Type":
        "text/csv; charset=utf-8",

      "Content-Disposition":
        'attachment; filename="categories_template.csv"',
    },
  });
});


Routercategory.post("/import", async (c) => {
  try {
    const body = await c.req.parseBody();

    const file = body.file;

    console.log("IMPORT BODY:", body);
    console.log("IMPORT FILE:", file);

    if (!(file instanceof File)) {
      return c.json(
        {
          success: false,
          message: "CSV file is required",
        },
        400
      );
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return c.json(
        {
          success: false,
          message: "Only CSV files are allowed",
        },
        400
      );
    }

    const buffer = await file.arrayBuffer();

    const decoder = new TextDecoder("utf-8");

    let text = decoder.decode(buffer);

    // Remove UTF-8 BOM
    text = text.replace(/^\uFEFF/, "");
 
 
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return c.json(
        {
          success: false,
          message: "CSV has no data rows",
        },
        400
      );
    }

    const db = getDB(c.env.DB);

    let inserted = 0;
    let skipped = 0;
 

    for (const row of rows) {
       
      const name = row.name?.trim();

      if (!name) {
        
        skipped++;
        continue;
      }

      let branchId: number | null = null;

      if (row.branch_id?.trim()) {
        const parsedBranchId = Number(row.branch_id.trim());

        if (Number.isNaN(parsedBranchId)) {
        
          skipped++;
          continue;
        }

        branchId = parsedBranchId;
      }

      const description =
        row.description?.trim() || null;

      await db
        .insert(categories)
        .values({
          name,
          branch_id: branchId,
          description,
          created_at: Date.now(),
        });

      inserted++;
    }

    return c.json({
      success: true,
      message: "Import completed successfully",
      total: rows.length,
      inserted,
      skipped,
    });
  } catch (error) {
  
    return c.json(
      {
        success: false,
        message: "Import failed",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      500
    );
  }
});

Routercategory.get("/:id", async (c) => {
  const db = getDB(c.env.DB);

  const id = c.req.param("id");

  const data = await db
    .select()
    .from(categories)
    .where(eq(categories.id, Number(id)))
    .all();

  return c.json({
    success: true,
    data,
  });
});

Routercategory.post("/", async (c) => {
  const db = getDB(c.env.DB);

  const body = await c.req.json();

  const data = await db
    .insert(categories)
    .values(body)
    .returning()
    .all();

  return c.json({
    success: true,
    data,
  });
});

Routercategory.put("/:id", async (c) => {
  const db = getDB(c.env.DB);

  const id = c.req.param("id");

  const body = await c.req.json();

  const data = await db
    .update(categories)
    .set(body)
    .where(eq(categories.id, Number(id)))
    .returning()
    .all();

  return c.json({
    success: true,
    data,
  });
});

Routercategory.delete("/:id", async (c) => {
  const db = getDB(c.env.DB);

  const id = c.req.param("id");

  const data = await db
    .delete(categories)
    .where(eq(categories.id, Number(id)))
    .returning()
    .all();

  return c.json({
    success: true,
    data,
  });
});

function csvEscape(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function parseCSV(
  text: string
): Record<string, string>[] {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCSVLine(lines[0]).map(
    (header) =>
      header
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
  );

  console.log("CSV HEADERS:", headers);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] =
        values[index]?.trim() ?? "";
    });

    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];

  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      char === "," &&
      !insideQuotes
    ) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);

  return result;
}