import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, blogsTable } from "@workspace/db";

const router: IRouter = Router();

// ─── GET /blogs (public) — always restricts to published only ─────────────────
router.get("/blogs", async (_req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(blogsTable)
    .where(eq(blogsTable.published, true))
    .orderBy(blogsTable.createdAt);
  res.json(posts);
});

// ─── GET /blogs/:slug (public) ────────────────────────────────────────────────
router.get("/blogs/:slug", async (req, res): Promise<void> => {
  const [post] = await db
    .select()
    .from(blogsTable)
    .where(eq(blogsTable.slug, req.params.slug))
    .limit(1);

  if (!post || !post.published) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }

  res.json(post);
});

export default router;
