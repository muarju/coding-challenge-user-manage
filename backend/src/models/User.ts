import { Schema, model, Types } from "mongoose";

export type UserStatus = "active" | "inactive";

const UserSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  status:    { type: String, enum: ["active", "inactive"], default: "active" },
  passwordHash: { type: String, select: false },
  logins:    { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date(), immutable: true },
  updatedAt: { type: Date, default: () => new Date() }
}, {
  versionKey: false,
  toJSON: {
    transform(_doc, ret) {
      // Ensure hashed password is never exposed in API responses
      delete (ret as any).passwordHash;
      return ret;
    }
  }
});

UserSchema.pre("save", function(next) {
  this.set("updatedAt", new Date());
  next();
});

UserSchema.pre("findOneAndUpdate", function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  status: UserStatus;
  passwordHash?: string;
  logins: number;
  createdAt: Date;
  updatedAt: Date;
}

export default model<IUser>("User", UserSchema);
