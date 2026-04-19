import { Queue, Worker, type Job } from "bullmq";
import { parseExpression } from "cron-parser";
import Redis from "ioredis";

const getRedisConnection = () =>
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  });

export const connection = getRedisConnection();

// ─── Queues ─────────────────────────────────────────────────────────────────

export const screenshotQueue = new Queue("screenshot", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});

export const notificationQueue = new Queue("notification", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 50 },
  },
});

// ─── Scheduling ─────────────────────────────────────────────────────────────

export async function scheduleMonitorJob(monitorJobId: string, cronExpression: string) {
  await screenshotQueue.upsertJobScheduler(
    `monitor-${monitorJobId}`,
    { pattern: cronExpression },
    {
      name: "screenshot",
      data: { jobId: monitorJobId },
      opts: {},
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
    { jobId: `manual-${monitorJobId}-${Date.now()}` }
  );
}

export function getNextRunTime(cronExpression: string): Date {
  const interval = parseExpression(cronExpression);
  return interval.next().toDate();
}
