import { Router } from "express";
import { authDto } from "../services/validations.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createSessionForUser, terminateSession } from "../services/sessionService.js";
import Session from "../models/Session.js";

const r = Router();

r.post("/signup", async (req, res) => {
  const parsed = authDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({
    firstName: parsed.data.firstName,
    lastName:  parsed.data.lastName,
    status: "active",
    passwordHash
  });
  const session = await createSessionForUser(user._id.toString());
  res.status(201).json({ user, sessionId: session._id });
});

r.post("/signin", async (req, res) => {
  const parsed = authDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const user = await User.findOne({
    firstName: parsed.data.firstName,
    lastName:  parsed.data.lastName
  }).select("+passwordHash");
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  // Proactively block inactive users with a consistent 403 response
  if ((user as any).status === "inactive") {
    return res.status(403).json({ error: "User is inactive. Please contact the admin." });
  }
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash || "");
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  try {
    // Avoid re-querying by id; update the found doc to prevent rare race conditions in tests
    user.logins += 1;
    await user.save();
    const session = await Session.create({ userId: user._id });
    res.json({ user, sessionId: session._id });
  } catch (e:any) {
    const msg = (e?.message || "").toString();
    if (msg.toLowerCase().includes("inactive users cannot create sessions")) {
      return res.status(403).json({ error: "User is inactive. Please contact the admin." });
    }
    res.status(400).json({ error: msg || "Unable to sign in" });
  }
});

r.post("/logout", async (req, res) => {
  const sessionId = req.header("x-session-id");
  if (!sessionId) return res.status(400).json({ error: "Missing session id" });
  const s = await terminateSession(sessionId);
  if (!s) return res.status(404).json({ error: "Session not found" });
  res.json({ ok: true });
});

export default r;
