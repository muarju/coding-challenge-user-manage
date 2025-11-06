import express from "express";
import cors, { CorsOptions } from "cors";
import morgan from "morgan";
import users from "./routes/users.js";
import sessions from "./routes/sessions.js";

export const createApp = () => {
  const app = express();
  const corsOptions: CorsOptions = {
    origin: "*",
    methods: ["GET","POST","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","x-session-id"],
  };
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_, res) => res.json({ ok: true }));
  app.use("/api/users", users);
  app.use("/api/sessions", sessions);
  return app;
};

export default createApp;
