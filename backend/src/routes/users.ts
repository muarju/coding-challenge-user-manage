import { Router } from "express";
import { createUserDto, updateUserDto } from "../services/validations";
import { createUser, updateUserDomainAware } from "../services/userService";
import User from "../models/User";

const r = Router();

r.post("/", async (req, res) => {
  const parsed = createUserDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const user = await createUser(parsed.data);
  res.status(201).json(user);
});

r.get("/", async (req, res) => {
  const page  = Math.max(parseInt(String(req.query.page || 1), 10), 1);
  const limit = Math.max(parseInt(String(req.query.limit || 6), 10), 1);
  const skip  = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments()
  ]);
  res.json({ items, page, limit, total, pages: Math.ceil(total/limit) });
});

r.patch("/:id", async (req, res) => {
  const parsed = updateUserDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  try {
    const user = await updateUserDomainAware(req.params.id, parsed.data);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (e:any) {
    res.status(400).json({ error: e.message });
  }
});

r.delete("/:id", async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

export default r;
