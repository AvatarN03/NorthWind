import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhookHandler from "./webhooks/clerk";
import { getEnv } from "./lib/env";
import fs from "node:fs";
import path from "node:path";
import keepAppAlive from "./lib/cron";
import meRouter from "./routes/meRoute";
import productRouter from "./routes/productRoute";
import streamRouter from "./routes/streamRoute";
import checkoutRouter from "./routes/checkoutRoute";

const env = getEnv();
const app = express();

const rawJson = express.raw({ type: "application/json", limit: "1mb" });

// it must mention before the express.json() middleware, otherwise it will not work
app.post("/webhooks/clerk", rawJson, (req, res) => {
  void clerkWebhookHandler(req, res);
});

// app.post("/webhooks/polar", rawJson, (req, res) => {
//   void polarWebhookHandler(req, res);
// });

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// unused variable can be written as _ to avoid eslint error
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/me", meRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);
app.use("/api/checkout", checkoutRouter);

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
  if (env.NODE_ENV === "production") {
    keepAppAlive.start();
  }
});
