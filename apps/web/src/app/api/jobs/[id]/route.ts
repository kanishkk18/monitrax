// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@changd/database";
// import { auth } from "@/lib/auth";
// import {
//   scheduleMonitorJob,
//   removeMonitorJobSchedule,
//   runJobNow,
//   getNextRunTime,
// } from "@/lib/queue";
// import { z } from "zod";
// import { headers } from "next/headers";

// async function getUser() {
//   const session = await auth.api.getSession({ headers: await headers() });
//   return session?.user || null;
// }

// async function getJobForUser(jobId: string, userId: string) {
//   return prisma.monitorJob.findFirst({ where: { id: jobId, userId } });
// }

// // GET /api/jobs/[id]
// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const user = await getUser();
//   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   const { id } = await params;

//   const job = await prisma.monitorJob.findFirst({
//     where: { id, userId: user.id },
//     include: {
//       screenshots: {
//         orderBy: { capturedAt: "desc" },
//         take: 20,
//       },
//       logs: {
//         orderBy: { createdAt: "desc" },
//         take: 50,
//       },
//       _count: { select: { screenshots: true } },
//     },
//   });

//   if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

//   return NextResponse.json({ job });
// }

// // PATCH /api/jobs/[id]
// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const user = await getUser();
//   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   const { id } = await params;

//   const existing = await getJobForUser(id, user.id);
//   if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

//   const body = await req.json();

//   // Handle "run now" action
//   if (body.action === "run_now") {
//     await runJobNow(id);
//     return NextResponse.json({ message: "Job queued for immediate run" });
//   }

//   // Handle toggle enabled
//   if (typeof body.enabled === "boolean" && Object.keys(body).length === 1) {
//     const job = await prisma.monitorJob.update({
//       where: { id },
//       data: { enabled: body.enabled },
//     });

//     if (body.enabled) {
//       await scheduleMonitorJob(id, job.cronExpression);
//     } else {
//       await removeMonitorJobSchedule(id);
//     }

//     return NextResponse.json({ job });
//   }

//   // Full update
//   const updateSchema = z.object({
//     name: z.string().min(1).max(100).optional(),
//     url: z.string().url().optional(),
//     description: z.string().optional(),
//     monitorType: z.enum(["visual", "xpath", "json_api"]).optional(),
//     xpathSelector: z.string().optional(),
//     jsonPath: z.string().optional(),
//     httpHeaders: z.string().optional(),
//     viewportWidth: z.number().int().min(320).max(3840).optional(),
//     viewportHeight: z.number().int().min(240).max(2160).optional(),
//     fullPage: z.boolean().optional(),
//     threshold: z.number().min(0).max(100).optional(),
//     cronExpression: z.string().optional(),
//     notifyEmails: z.array(z.string().email()).optional(),
//     enabled: z.boolean().optional(),
//     ignoreRegions: z.string().optional(),
//   });

//   const parsed = updateSchema.safeParse(body);
//   if (!parsed.success)
//     return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

//   const data = parsed.data;
//   const nextRunAt = data.cronExpression
//     ? getNextRunTime(data.cronExpression)
//     : undefined;

//   const job = await prisma.monitorJob.update({
//     where: { id },
//     data: { ...data, ...(nextRunAt ? { nextRunAt } : {}) },
//   });

//   // Reschedule if cron or enabled changed
//   if (data.cronExpression || typeof data.enabled === "boolean") {
//     if (job.enabled) {
//       await scheduleMonitorJob(id, job.cronExpression);
//     } else {
//       await removeMonitorJobSchedule(id);
//     }
//   }

//   return NextResponse.json({ job });
// }

// // DELETE /api/jobs/[id]
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const user = await getUser();
//   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   const { id } = await params;

//   const existing = await getJobForUser(id, user.id);
//   if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

//   await removeMonitorJobSchedule(id);
//   await prisma.monitorJob.delete({ where: { id } });

//   return NextResponse.json({ message: "Deleted" });
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@changd/database";
import { auth } from "@/lib/auth";
import {
  scheduleMonitorJob,
  removeMonitorJobSchedule,
  runJobNow,
  getNextRunTime,
} from "@/lib/queue";
import { z } from "zod";
import { headers } from "next/headers";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}

async function getJobForUser(jobId: string, userId: string) {
  return prisma.monitorJob.findFirst({ where: { id: jobId, userId } });
}

// GET /api/jobs/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const job = await prisma.monitorJob.findFirst({
    where: { id, userId: user.id },
    include: {
      screenshots: {
        orderBy: { capturedAt: "desc" },
        take: 20,
      },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { screenshots: true } },
    },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ job });
}

// PATCH /api/jobs/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await getJobForUser(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  // Handle "run now" action
  if (body.action === "run_now") {
    await runJobNow(id);
    return NextResponse.json({ message: "Job queued for immediate run" });
  }

  // Handle toggle enabled
  if (typeof body.enabled === "boolean" && Object.keys(body).length === 1) {
    const job = await prisma.monitorJob.update({
      where: { id },
      data: { enabled: body.enabled },
    });

    if (body.enabled) {
      await scheduleMonitorJob(id, job.cronExpression);
    } else {
      await removeMonitorJobSchedule(id);
    }

    return NextResponse.json({ job });
  }

  // Full update
  const updateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    url: z.string().url().optional(),
    description: z.string().optional(),
    monitorType: z.enum(["visual", "text", "xpath", "json_api"]).optional(),
  captureScreenshot: z.boolean().optional(),
  imageFormat: z.enum(["webp", "avif", "png"]).optional(),
    xpathSelector: z.string().optional(),
    jsonPath: z.string().optional(),
    httpHeaders: z.string().optional(),
    viewportWidth: z.number().int().min(320).max(3840).optional(),
    viewportHeight: z.number().int().min(240).max(2160).optional(),
    fullPage: z.boolean().optional(),
    threshold: z.number().min(0).max(100).optional(),
    cronExpression: z.string().optional(),
    notifyEmails: z.array(z.string().email()).optional(),
    enabled: z.boolean().optional(),
    ignoreRegions: z.string().optional(),
  });

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = parsed.data;
  const nextRunAt = data.cronExpression
    ? getNextRunTime(data.cronExpression)
    : undefined;

  const job = await prisma.monitorJob.update({
    where: { id },
    data: { ...data, ...(nextRunAt ? { nextRunAt } : {}) },
  });

  // Reschedule if cron or enabled changed
  if (data.cronExpression || typeof data.enabled === "boolean") {
    if (job.enabled) {
      await scheduleMonitorJob(id, job.cronExpression);
    } else {
      await removeMonitorJobSchedule(id);
    }
  }

  return NextResponse.json({ job });
}

// DELETE /api/jobs/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await getJobForUser(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await removeMonitorJobSchedule(id);
  await prisma.monitorJob.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted" });
}
