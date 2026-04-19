// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@changd/database";
// import { auth } from "@/lib/auth";
// import { scheduleMonitorJob, getNextRunTime } from "@/lib/queue";
// import { z } from "zod";
// import { headers } from "next/headers";

// const jobSchema = z.object({
//   name: z.string().min(1).max(100),
//   url: z.string().url(),
//   description: z.string().optional(),
//   monitorType: z.enum(["visual", "xpath", "json_api"]).default("visual"),
//   xpathSelector: z.string().optional(),
//   jsonPath: z.string().optional(),
//   httpHeaders: z.string().optional(),
//   viewportWidth: z.number().int().min(320).max(3840).default(1920),
//   viewportHeight: z.number().int().min(240).max(2160).default(1080),
//   fullPage: z.boolean().default(true),
//   threshold: z.number().min(0).max(100).default(0.5),
//   cronExpression: z.string().default("0 9 * * *"),
//   notifyEmails: z.array(z.string().email()).default([]),
//   enabled: z.boolean().default(true),
//   ignoreRegions: z.string().optional(),
// });

// async function getUser(req: NextRequest) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   return session?.user || null;
// }

// // GET /api/jobs - list all jobs for current user
// export async function GET(req: NextRequest) {
//   const user = await getUser(req);
//   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const jobs = await prisma.monitorJob.findMany({
//     where: { userId: user.id },
//     orderBy: { createdAt: "desc" },
//     include: {
//       screenshots: {
//         orderBy: { capturedAt: "desc" },
//         take: 1,
//         select: {
//           id: true,
//           imageUrl: true,
//           hasChanged: true,
//           diffPercentage: true,
//           capturedAt: true,
//         },
//       },
//       _count: { select: { screenshots: true } },
//     },
//   });

//   return NextResponse.json({ jobs });
// }

// // POST /api/jobs - create a new job
// export async function POST(req: NextRequest) {
//   const user = await getUser(req);
//   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const body = await req.json();
//   const parsed = jobSchema.safeParse(body);
//   if (!parsed.success)
//     return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

//   const data = parsed.data;
//   const nextRunAt = getNextRunTime(data.cronExpression);

//   const job = await prisma.monitorJob.create({
//     data: {
//       userId: user.id,
//       name: data.name,
//       url: data.url,
//       description: data.description,
//       monitorType: data.monitorType,
//       xpathSelector: data.xpathSelector,
//       jsonPath: data.jsonPath,
//       httpHeaders: data.httpHeaders,
//       viewportWidth: data.viewportWidth,
//       viewportHeight: data.viewportHeight,
//       fullPage: data.fullPage,
//       threshold: data.threshold,
//       cronExpression: data.cronExpression,
//       notifyEmails: data.notifyEmails,
//       enabled: data.enabled,
//       ignoreRegions: data.ignoreRegions,
//       nextRunAt,
//     },
//   });

//   // Schedule in BullMQ
//   if (job.enabled) {
//     await scheduleMonitorJob(job.id, job.cronExpression);
//   }

//   return NextResponse.json({ job }, { status: 201 });
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@changd/database";
import { auth } from "@/lib/auth";
import { scheduleMonitorJob, getNextRunTime } from "@/lib/queue";
import { z } from "zod";
import { headers } from "next/headers";

const jobSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  description: z.string().optional(),
  monitorType: z.enum(["visual", "text", "xpath", "json_api"]).default("visual"),
  captureScreenshot: z.boolean().default(true),
  imageFormat: z.enum(["webp", "avif", "png"]).default("webp"),
  xpathSelector: z.string().optional(),
  jsonPath: z.string().optional(),
  httpHeaders: z.string().optional(),
  viewportWidth: z.number().int().min(320).max(3840).default(1920),
  viewportHeight: z.number().int().min(240).max(2160).default(1080),
  fullPage: z.boolean().default(true),
  threshold: z.number().min(0).max(100).default(0.5),
  cronExpression: z.string().default("0 9 * * *"),
  notifyEmails: z.array(z.string().email()).default([]),
  enabled: z.boolean().default(true),
  ignoreRegions: z.string().optional(),
});

async function getUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}

// GET /api/jobs - list all jobs for current user
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.monitorJob.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      screenshots: {
        orderBy: { capturedAt: "desc" },
        take: 1,
        select: {
          id: true,
          imageUrl: true,
          hasChanged: true,
          diffPercentage: true,
          capturedAt: true,
        },
      },
      _count: { select: { screenshots: true } },
    },
  });

  return NextResponse.json({ jobs });
}

// POST /api/jobs - create a new job
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = parsed.data;
  const nextRunAt = getNextRunTime(data.cronExpression);

  const job = await prisma.monitorJob.create({
    data: {
      userId: user.id,
      name: data.name,
      url: data.url,
      description: data.description,
      monitorType: data.monitorType,
      captureScreenshot: data.captureScreenshot,
      imageFormat: data.imageFormat,
      xpathSelector: data.xpathSelector,
      jsonPath: data.jsonPath,
      httpHeaders: data.httpHeaders,
      viewportWidth: data.viewportWidth,
      viewportHeight: data.viewportHeight,
      fullPage: data.fullPage,
      threshold: data.threshold,
      cronExpression: data.cronExpression,
      notifyEmails: data.notifyEmails,
      enabled: data.enabled,
      ignoreRegions: data.ignoreRegions,
      nextRunAt,
    },
  });

  // Schedule in BullMQ
  if (job.enabled) {
    await scheduleMonitorJob(job.id, job.cronExpression);
  }

  return NextResponse.json({ job }, { status: 201 });
}
