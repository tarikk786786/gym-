import { Router } from "express";

const router = Router();

router.post("/contact", (req, res) => {
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

  req.log.info(
    { name: String(name), email: String(email), subject: subject ?? "(none)", type: type ?? "contact" },
    "Contact form submission received",
  );

  res.json({
    success: true,
    message: "Thank you for your message! We'll be in touch soon.",
  });
});

router.post("/newsletter", (req, res) => {
  const { email, name } = req.body ?? {};

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }

  req.log.info(
    { email: String(email), name: name ?? "anonymous" },
    "Newsletter subscription",
  );

  res.json({
    success: true,
    message: "You're subscribed! Get ready for elite fitness insights.",
  });
});

export default router;
