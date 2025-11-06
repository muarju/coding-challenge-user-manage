import { Schema, model, Types } from "mongoose";

const SessionSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt:   { type: Date, default: () => new Date(), immutable: true },
  terminatedAt:{ type: Date }
}, { versionKey: false });

export interface ISession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  terminatedAt?: Date;
}

export default model<ISession>("Session", SessionSchema);
