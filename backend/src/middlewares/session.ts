import { Request, Response, NextFunction } from "express";
import Session from "../models/Session.js";

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.header("x-session-id");
  if (!sessionId) return res.status(401).json({ error: "Missing session id" });

  const session = await Session.findById(sessionId);
  if (!session || session.terminatedAt) {
    return res.status(401).json({ error: "Invalid/terminated session" });
  }
  (req as any).session = session;
  next();
}
