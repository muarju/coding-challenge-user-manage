import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";

// Prefer localhost; if it fails, we will fall back to an in-memory Mongo
const DEFAULT_URI = "mongodb://127.0.0.1:27017/backoffice_user_manager";
const MONGO_URI = process.env.MONGO_URI || DEFAULT_URI;
const PORT = process.env.PORT || 4000;

async function tryConnect(uri: string) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 } as any);
}

async function ensureMongoConnection() {
  try {
    console.log(`[backend] Connecting to Mongo at ${MONGO_URI}`);
    await tryConnect(MONGO_URI);
    console.log("[backend] Connected to Mongo");
    // If using a dedicated E2E database, drop it on startup to keep tests isolated
    if (/_e2e/i.test(MONGO_URI)) {
      const db = mongoose.connection.db;
      if (db) {
        await db.dropDatabase();
        console.log("[backend] E2E database dropped at startup");
      }
    }
  } catch (err) {
    console.warn("[backend] Primary Mongo connection failed. Falling back to in-memory server.");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    const uri = mem.getUri();
    console.log(`[backend] In-memory Mongo started at ${uri}`);
    await tryConnect(uri);
  }
}

async function main() {
  console.log(`[backend] cwd=${process.cwd()}`);
  console.log(`[backend] PORT=${PORT}`);
  await ensureMongoConnection();
  const app = createApp();
  app.listen(Number(PORT), "0.0.0.0", () => console.log(`backend listening on :${PORT}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
