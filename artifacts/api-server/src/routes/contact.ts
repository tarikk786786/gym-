import { Router } from "express";
import {
  db,
  contactSubmissionsTable,
  newsletterSubscribersTable,
} from "@workspace/db";

const router = Router();

router.post("/contact", async (req, res) => {
  const { name, email, subject, message, type } = req.body ?? {};

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  await db.insert(contactSubmissionsTable).values({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject ?? null,
    message: message.trim(),
    type: type ?? "contact",
  });

  req.log.info({ name, email, subject, type }, "Contact form submission saved");

  res.json({
    success: true,
    message: "Thank you for your message! We'll be in touch soon.",
  });
});

router.post("/newsletter", async (req, res) => {
  const { email, name } = req.body ?? {};

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }

  await db
    .insert(newsletterSubscribersTable)
    .values({ email: email.trim().toLowerCase(), name: name ?? null })
    .onConflictDoNothing();

  req.log.info({ email, name }, "Newsletter subscription saved");

  res.json({
    success: true,
    message: "You're subscribed! Get ready for elite fitness insights.",
  });
});

export default router;
