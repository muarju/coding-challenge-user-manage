import User from "../models/User.js";
import bcrypt from "bcryptjs";

export async function createUser(data: any) {
  const { password, ...rest } = data;
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({ ...rest, passwordHash });
}

export async function updateUserDomainAware(id: string, updates: any) {
  const user = await User.findById(id);
  if (!user) return null;

  if (user.status === "inactive" && (updates.firstName || updates.lastName)) {
    throw new Error("Inactive users cannot update firstName/lastName");
  }
  return User.findByIdAndUpdate(id, updates, { new: true });
}
