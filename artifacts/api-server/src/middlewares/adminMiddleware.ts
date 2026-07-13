import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import type { Request, Response, NextFunction } from "express";

/** Attaches userId and checks admin role. Returns 401/403 otherwise. */
export async function adminMiddleware(
  req: Request & { userId?: string; isAdmin?: boolean },
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const userId = (auth?.sessionClaims?.userId as string) || auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [profile] = await db
    .select({ isAdmin: profilesTable.isAdmin, isSuspended: profilesTable.isSuspended })
    .from(profilesTable)
    .where(eq(profilesTable.id, userId))
    .limit(1);

  if (!profile?.isAdmin) {
    res.status(403).json({ error: "Forbidden: admin access required" });
    return;
  }

  req.userId = userId;
  req.isAdmin = true;
  next();
}
