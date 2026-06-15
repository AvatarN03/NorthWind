  import express from "express";
  import cors from "cors";
  import "dotenv/config";
  import { clerkMiddleware } from "@clerk/express";
  import clerkWebhookHandler from "./webhooks/clerk";
  import { getEnv } from "./lib/env";
  import fs from "node:fs";
  import path from "node:path";

  const env = getEnv();
  const app = express();

  const rawJson = express.raw({ type: "application/json", limit: "1mb" });

  // it must mention before the express.json() middleware, otherwise it will not work
  app.post("/webhook/clerk", rawJson, (req, res) => {
    void clerkWebhookHandler(req, res);
  });

  app.use(express.json());
  app.use(cors());
  app.use(clerkMiddleware());

  const publicDir = path.join(process.cwd(), "public");
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));

    app.get("/{*splat}", (req, res, next) => {
      if (req.path.startsWith("/webhooks") || req.path.startsWith("/api")) {
        next();
        return;
      }

      res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
    });
  }

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
