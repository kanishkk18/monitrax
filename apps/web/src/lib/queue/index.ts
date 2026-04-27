// import { Queue, Worker, type Job } from "bullmq";
// import { parseExpression } from "cron-parser";
// import Redis from "ioredis";

// const getRedisConnection = () =>
//   new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
//     maxRetriesPerRequest: null,
//   });

// export const connection = getRedisConnection();

// // ─── Queues ─────────────────────────────────────────────────────────────────

// export const screenshotQueue = new Queue("screenshot", {
//   connection,
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: { type: "exponential", delay: 5000 },
//     removeOnComplete: { count: 100 },
//     removeOnFail: { count: 200 },
//   },
// });

// export const notificationQueue = new Queue("notification", {
//   connection,
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: { type: "exponential", delay: 2000 },
//     removeOnComplete: { count: 50 },
//   },
// });

// // ─── Scheduling ─────────────────────────────────────────────────────────────

// export async function scheduleMonitorJob(monitorJobId: string, cronExpression: string) {
//   await screenshotQueue.upsertJobScheduler(
//     `monitor-${monitorJobId}`,
//     { pattern: cronExpression },
//     {
//       name: "screenshot",
//       data: { jobId: monitorJobId },
//       opts: {},
//     }
//   );
// }

// export async function removeMonitorJobSchedule(monitorJobId: string) {
//   await screenshotQueue.removeJobScheduler(`monitor-${monitorJobId}`);
// }

// export async function runJobNow(monitorJobId: string) {
//   return screenshotQueue.add(
//     "screenshot",
//     { jobId: monitorJobId },
//     { jobId: `manual-${monitorJobId}-${Date.now()}` }
//   );
// }

// export function getNextRunTime(cronExpression: string): Date {
//   const interval = parseExpression(cronExpression);
//   return interval.next().toDate();
// }

import { Queue, Worker, type Job } from "bullmq";
import { parseExpression } from "cron-parser";
import Redis from "ioredis";

const getRedisConnection = () =>
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    enableReadyCheck: false, // Required for BullMQ stability
  });

export const connection = getRedisConnection();

// ─── Queues ─────────────────────────────────────────────────────────────────

export const screenshotQueue = new Queue("screenshot", {
  connection,
  defaultJobOptions: {
    attempts: 2,              // Reduced from 3
    backoff: { type: "fixed", delay: 10000 }, // Fixed instead of exponential
    removeOnComplete: { count: 20 },  // Reduced from 100
    removeOnFail: { count: 10 },      // Reduced from 200
  },
});

export const notificationQueue = new Queue("notification", {
  connection,
  defaultJobOptions: {
    attempts: 2,              // Reduced from 3
    backoff: { type: "fixed", delay: 5000 },
    removeOnComplete: { count: 20 },  // Reduced from 50
    removeOnFail: { count: 5 },
  },
});

// ─── Scheduling ─────────────────────────────────────────────────────────────

export async function scheduleMonitorJob(monitorJobId: string, cronExpression: string) {
  // Force minimum 30-minute interval for free tier
  const minInterval = "*/30 * * * *"; // Every 30 minutes minimum
  
  // Parse and validate the cron
  const interval = parseExpression(cronExpression);
  const nextRuns = [interval.next().toDate(), interval.next().toDate()];
  const diffMs = nextRuns[1].getTime() - nextRuns[0].getTime();
  
  // If user wants more frequent than 30 min, override to 30 min
  const safeCron = diffMs < 30 * 60 * 1000 ? minInterval : cronExpression;

  await screenshotQueue.upsertJobScheduler(
    `monitor-${monitorJobId}`,
    { pattern: safeCron },
    {
      name: "screenshot",
      data: { jobId: monitorJobId },
      opts: {
        removeOnComplete: 5,  // Aggressive cleanup for scheduled jobs
      },
    }
  );
}

export async function removeMonitorJobSchedule(monitorJobId: string) {
  await screenshotQueue.removeJobScheduler(`monitor-${monitorJobId}`);
}

export async function runJobNow(monitorJobId: string) {
  return screenshotQueue.add(
    "screenshot",
    { jobId: monitorJobId },
    { 
      jobId: `manual-${monitorJobId}-${Date.now()}`,
      removeOnComplete: 5,
    }
  );
}

export function getNextRunTime(cronExpression: string): Date {
  const interval = parseExpression(cronExpression);
  return interval.next().toDate();
}
