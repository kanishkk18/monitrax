import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@changd/database";
import { screenshotQueue, getNextRunTime } from "@/lib/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all enabled jobs due to run
  const jobs = await prisma.monitorJob.findMany({
    where: {
      enabled: true,
      OR: [{ nextRunAt: { lte: now } }, { nextRunAt: null }],
    },
    select: { id: true, cronExpression: true },
  });

  const queued: string[] = [];
  const errors: string[] = [];

  for (const job of jobs) {
    try {
      await screenshotQueue.add(
        "screenshot",
        { jobId: job.id },
        { jobId: `cron-${job.id}-${now.getTime()}` }
      );

      const nextRun = getNextRunTime(job.cronExpression);
      await prisma.monitorJob.update({
        where: { id: job.id },
        data: { nextRunAt: nextRun, lastRunAt: now },
      });

      queued.push(job.id);
    } catch (err) {
      errors.push(`${job.id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({
    queued: queued.length,
    errors: errors.length,
    details: { queued, errors },
    timestamp: now.toISOString(),
  });
}

// Also support GET for Vercel cron
export async function GET(req: NextRequest) {
  return POST(req);
}
