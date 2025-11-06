import Session from "../models/Session";
import User from "../models/User";

export async function createSessionForUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.status === "inactive") {
    throw new Error("Inactive users cannot create sessions");
  }
  user.logins += 1;
  await user.save();
  return Session.create({ userId: user._id });
}

export async function terminateSession(sessionId: string) {
  return Session.findByIdAndUpdate(sessionId, { terminatedAt: new Date() }, { new: true });
}
