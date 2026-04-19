#!/usr/bin/env tsx
// Run this as a separate process: npm run worker
// In production (Vercel), use a separate service (Railway/Render) or Vercel Cron

import "dotenv/config";
import { createScreenshotWorker } from "./screenshot-worker";

console.log("🚀 Starting Monitrax worker process...");

const worker = createScreenshotWorker();

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down worker...");
  await worker.close();
  process.exit(0);
});

console.log("✨ Worker is listening for screenshot jobs...");
