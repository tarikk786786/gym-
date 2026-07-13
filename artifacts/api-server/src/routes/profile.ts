import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

// GET /api/profile — return authenticated user's profile
router.get("/profile", requireAuth, async (req: any, res): Promise<void> => {
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, req.userId));

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(profile);
});

// PUT /api/profile — upsert profile (validated via generated Zod schema)
router.put("/profile", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId: string = req.userId;
  const data = { id: userId, ...parsed.data };

  const [profile] = await db
    .insert(profilesTable)
    .values(data as any)
    .onConflictDoUpdate({
      target: profilesTable.id,
      set: { ...parsed.data, updatedAt: new Date() } as any,
    })
    .returning();

  res.json(profile);
});

export default router;
