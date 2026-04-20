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



//    import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@changd/database";
// import { getNextRunTime } from "@/lib/queue";
// import { captureScreenshot } from "@/lib/screenshot/playwright";
// import { compareScreenshots } from "@/lib/screenshot/comparison";
// import { computeTextDiff } from "@/lib/screenshot/text-diff";
// import { extractXPathContent, extractJsonApiContent } from "@/lib/screenshot/xpath";
// import { getStorageProvider } from "@/lib/storage";
// import { EmailService } from "@/lib/notifications/email";
// import { createNotification } from "@/lib/notifications/in-app";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";
// export const maxDuration = 60;

// export async function POST(req: NextRequest) {
//   const authHeader = req.headers.get("authorization");
//   const cronSecret = process.env.CRON_SECRET;
//   if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const now = new Date();
//   const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

//   const jobs = await prisma.monitorJob.findMany({
//     where: {
//       enabled: true,
//       OR: [{ nextRunAt: { lte: now } }, { nextRunAt: null }],
//     },
//     include: { user: { include: { settings: true } } },
//   });

//   const results = [];

//   for (const job of jobs) {
//     const user = job.user;
//     const settings = user.settings;
//     const storageProvider = getStorageProvider(settings?.storageProvider);

//     const log = async (level: "info" | "warn" | "error", message: string) => {
//       await prisma.jobLog.create({
//         data: { jobId: job.id, level, message },
//       });
//     };

//     try {
//       await log("info", `Running: ${job.url}`);

//       const latestSnapshot = await prisma.screenshot.findFirst({
//         where: { jobId: job.id },
//         orderBy: { capturedAt: "desc" },
//       });

//       let screenshotResult = null;
//       let extractedContent = null;

//       if (job.monitorType === "xpath") {
//         extractedContent = await extractXPathContent(job.url, job.xpathSelector!);
//       } else if (job.monitorType === "json_api") {
//         const httpHeaders = job.httpHeaders ? JSON.parse(job.httpHeaders) : undefined;
//         extractedContent = await extractJsonApiContent(job.url, job.jsonPath!, httpHeaders);
//       } else {
//         const doCapture = job.monitorType !== "text" && (job as any).captureScreenshot !== false;
//         screenshotResult = await captureScreenshot({
//           url: job.url,
//           viewportWidth: job.viewportWidth,
//           viewportHeight: job.viewportHeight,
//           fullPage: job.fullPage,
//           captureScreenshot: doCapture,
//           imageFormat: ((job as any).imageFormat || "webp") as "webp" | "avif" | "png",
//           storageProvider,
//           userId: user.id,
//           jobId: job.id,
//         });
//       }

//       let hasChanged = false;
//       let diffPercentage = 0;
//       let diffPixels = 0;
//       let diffUrl: string | undefined;
//       let diffStorageKey: string | undefined;
//       let textDiffResult = null;
//       let textChanged = false;

//       if (latestSnapshot) {
//         if (job.monitorType === "visual" && screenshotResult?.buffer && latestSnapshot.imageUrl) {
//           const ignoreRegions = job.ignoreRegions ? JSON.parse(job.ignoreRegions) : undefined;
//           const comparison = await compareScreenshots({
//             oldImageUrl: latestSnapshot.imageUrl,
//             newImageBuffer: screenshotResult.buffer,
//             threshold: job.threshold,
//             storageProvider,
//             userId: user.id,
//             jobId: job.id,
//             ignoreRegions,
//           });
//           hasChanged = comparison.hasChanged;
//           diffPercentage = comparison.diffPercentage;
//           diffPixels = comparison.diffPixels;
//           diffUrl = comparison.diffUrl;
//           diffStorageKey = comparison.diffStorageKey;
//         }

//         if (
//           (job.monitorType === "text" ||
//             (job.monitorType === "visual" && (job as any).captureScreenshot === false)) &&
//           screenshotResult?.textContent &&
//           latestSnapshot.textContent
//         ) {
//           textDiffResult = computeTextDiff(latestSnapshot.textContent, screenshotResult.textContent);
//           textChanged = textDiffResult.hasChanged;
//           hasChanged = textChanged;
//           diffPercentage = textChanged ? 100 : 0;
//         }

//         if (
//           (job.monitorType === "xpath" || job.monitorType === "json_api") &&
//           latestSnapshot.extractedContent !== null &&
//           extractedContent !== null
//         ) {
//           textDiffResult = computeTextDiff(latestSnapshot.extractedContent, extractedContent);
//           textChanged = textDiffResult.hasChanged;
//           hasChanged = textChanged;
//           diffPercentage = textChanged ? 100 : 0;
//         }
//       } else {
//         await log("info", "First run — baseline captured");
//       }

//       const newSnapshot = await prisma.screenshot.create({
//         data: {
//           jobId: job.id,
//           imageUrl: screenshotResult?.imageUrl || "",
//           storageKey: screenshotResult?.storageKey || "",
//           previousId: latestSnapshot?.id,
//           diffUrl,
//           diffStorageKey,
//           diffPercentage,
//           diffPixels,
//           hasChanged,
//           extractedContent,
//           textContent: screenshotResult?.textContent || extractedContent || null,
//           textDiff: textDiffResult?.unifiedDiff || null,
//           textChanged,
//           capturedAt: new Date(),
//           captureDuration: screenshotResult?.captureDuration || 0,
//           viewportWidth: screenshotResult?.viewportWidth || job.viewportWidth,
//           viewportHeight: screenshotResult?.viewportHeight || job.viewportHeight,
//           pageTitle: screenshotResult?.pageTitle || null,
//         },
//       });

//       await prisma.monitorJob.update({
//         where: { id: job.id },
//         data: {
//           lastRunAt: new Date(),
//           lastStatus: hasChanged ? "changed" : "no_change",
//           failureCount: 0,
//           totalRuns: { increment: 1 },
//           nextRunAt: getNextRunTime(job.cronExpression),
//         },
//       });

//       if (hasChanged && latestSnapshot) {
//         if (!settings || settings.inAppNotifications !== false) {
//           await createNotification({
//             userId: user.id,
//             type: "change_detected",
//             title: `Change detected: ${job.name}`,
//             message: textDiffResult
//               ? `${textDiffResult.addedLines} lines added, ${textDiffResult.removedLines} lines removed`
//               : `${diffPercentage.toFixed(2)}% of the page changed`,
//             jobId: job.id,
//             screenshotId: newSnapshot.id,
//             actionUrl: `/jobs/${job.id}`,
//             actionText: "View Changes",
//           });
//         }

//         if (settings?.emailNotifications !== false) {
//           const emailRecipients = [user.email, ...job.notifyEmails].filter(Boolean);
//           if (emailRecipients.length > 0 && settings) {
//             try {
//               const emailService = new EmailService(settings);
//               await emailService.sendChangeAlert({
//                 to: emailRecipients,
//                 jobName: job.name,
//                 url: job.url,
//                 diffPercentage,
//                 screenshotUrl: screenshotResult?.imageUrl || "",
//                 diffUrl,
//                 jobId: job.id,
//                 appUrl,
//               });
//             } catch {}
//           }
//         }
//       }

//       results.push({ jobId: job.id, status: hasChanged ? "changed" : "no_change" });
//       await log("info", `Done. Status: ${hasChanged ? "changed" : "no_change"}`);
//     } catch (err) {
//       const error = err as Error;
//       await log("error", `Failed: ${error.message}`);
//       await prisma.monitorJob.update({
//         where: { id: job.id },
//         data: {
//           lastStatus: "error",
//           failureCount: { increment: 1 },
//           lastRunAt: new Date(),
//           totalRuns: { increment: 1 },
//           nextRunAt: getNextRunTime(job.cronExpression),
//         },
//       });
//       results.push({ jobId: job.id, status: "error", error: error.message });
//     }
//   }

//   return NextResponse.json({ processed: results.length, results, timestamp: now.toISOString() });
// }

// export async function GET(req: NextRequest) {
//   return POST(req);
// }
// // Also support GET for Vercel cron
// export async function GET(req: NextRequest) {
//   return POST(req);
// }
