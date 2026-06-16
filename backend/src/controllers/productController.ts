import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { products } from "../db/schema";
import { desc, eq } from "drizzle-orm";

export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cat =
      typeof req.query.category === "string" ? req.query.category : "";

    const activeProducts = eq(products.active, true);
    const whereClause = cat ? eq(products.category, cat) : activeProducts;

    const rows = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt));

    res.json({ products: rows });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await db
      .select({ category: products.category })
      .from(products)
      .groupBy(products.category)
      .orderBy(products.category);

    const categories = rows.map((r) => r.category);

    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.slug, req.params.slug as string))
      .limit(1);

    if (!row || !row.active)
      return res.status(404).json({ error: "Not found" });

    res.json({ product: row });
  } catch (e) {
    next(e);
  }
};
