// import { Worker, type Job } from "bullmq";
// import { prisma } from "@changd/database";
// import { connection } from "@/lib/queue";
// import { captureScreenshot } from "@/lib/screenshot/playwright";
// import { compareScreenshots } from "@/lib/screenshot/comparison";
// import { extractXPathContent, extractJsonApiContent } from "@/lib/screenshot/xpath";
// import { getStorageProvider } from "@/lib/storage";
// import { EmailService } from "@/lib/notifications/email";
// import { createNotification } from "@/lib/notifications/in-app";

// async function processScreenshotJob(jobId: string) {
//   const job = await prisma.monitorJob.findUnique({
//     where: { id: jobId },
//     include: { user: { include: { settings: true } } },
//   });

//   if (!job || !job.enabled) return;

//   const user = job.user;
//   const settings = user.settings;
//   const storageProvider = getStorageProvider(settings?.storageProvider);
//   const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

//   // Create a log helper
//   const log = async (level: "info" | "warn" | "error", message: string, metadata?: object) => {
//     await prisma.jobLog.create({
//       data: {
//         jobId: job.id,
//         level,
//         message,
//         metadata: metadata ? JSON.stringify(metadata) : null,
//       },
//     });
//   };

//   await log("info", `Starting monitor run for: ${job.url}`);

//   try {
//     // ── 1. Capture / Extract ────────────────────────────────────────────────
//     let screenshotResult: Awaited<ReturnType<typeof captureScreenshot>> | null = null;
//     let extractedContent: string | null = null;

//     if (job.monitorType === "xpath") {
//       extractedContent = await extractXPathContent(job.url, job.xpathSelector!);
//     } else if (job.monitorType === "json_api") {
//       const httpHeaders = job.httpHeaders ? JSON.parse(job.httpHeaders) : undefined;
//       extractedContent = await extractJsonApiContent(job.url, job.jsonPath!, httpHeaders);
//     } else {
//       // Visual screenshot
//       screenshotResult = await captureScreenshot({
//         url: job.url,
//         viewportWidth: job.viewportWidth,
//         viewportHeight: job.viewportHeight,
//         fullPage: job.fullPage,
//         storageProvider,
//         userId: user.id,
//         jobId: job.id,
//       });
//     }

//     // ── 2. Compare with previous ────────────────────────────────────────────
//     const latestScreenshot = await prisma.screenshot.findFirst({
//       where: { jobId: job.id },
//       orderBy: { capturedAt: "desc" },
//     });

//     let hasChanged = false;
//     let diffPercentage = 0;
//     let diffPixels = 0;
//     let diffUrl: string | undefined;
//     let diffStorageKey: string | undefined;

//     if (latestScreenshot) {
//       if (job.monitorType === "visual" && screenshotResult && latestScreenshot.imageUrl) {
//         const ignoreRegions = job.ignoreRegions
//           ? JSON.parse(job.ignoreRegions)
//           : undefined;

//         const comparison = await compareScreenshots({
//           oldImageUrl: latestScreenshot.imageUrl,
//           newImageBuffer: screenshotResult.buffer,
//           threshold: job.threshold,
//           storageProvider,
//           userId: user.id,
//           jobId: job.id,
//           ignoreRegions,
//         });

//         hasChanged = comparison.hasChanged;
//         diffPercentage = comparison.diffPercentage;
//         diffPixels = comparison.diffPixels;
//         diffUrl = comparison.diffUrl;
//         diffStorageKey = comparison.diffStorageKey;
//       } else if (
//         (job.monitorType === "xpath" || job.monitorType === "json_api") &&
//         latestScreenshot.extractedContent !== null
//       ) {
//         hasChanged = latestScreenshot.extractedContent !== extractedContent;
//         diffPercentage = hasChanged ? 100 : 0;
//       }
//     } else {
//       // First run — always "no change" since there's nothing to compare
//       hasChanged = false;
//       await log("info", "First run — baseline screenshot captured");
//     }

//     // ── 3. Save screenshot record ───────────────────────────────────────────
//     const newScreenshot = await prisma.screenshot.create({
//       data: {
//         jobId: job.id,
//         imageUrl: screenshotResult?.imageUrl || "",
//         storageKey: screenshotResult?.storageKey || "",
//         previousId: latestScreenshot?.id,
//         diffUrl,
//         diffStorageKey,
//         diffPercentage,
//         diffPixels,
//         hasChanged,
//         extractedContent,
//         capturedAt: new Date(),
//         captureDuration: screenshotResult?.captureDuration || 0,
//         viewportWidth: screenshotResult?.viewportWidth || job.viewportWidth,
//         viewportHeight: screenshotResult?.viewportHeight || job.viewportHeight,
//         pageTitle: screenshotResult?.pageTitle,
//       },
//     });

//     // ── 4. Update job status ────────────────────────────────────────────────
//     await prisma.monitorJob.update({
//       where: { id: job.id },
//       data: {
//         lastRunAt: new Date(),
//         lastStatus: hasChanged ? "changed" : "no_change",
//         failureCount: 0,
//         totalRuns: { increment: 1 },
//       },
//     });

//     // ── 5. Send notifications if changed ───────────────────────────────────
//     if (hasChanged && latestScreenshot) {
//       await log("info", `Change detected: ${diffPercentage.toFixed(2)}% pixels changed`);

//       // In-app notification
//       if (!settings || settings.inAppNotifications !== false) {
//         await createNotification({
//           userId: user.id,
//           type: "change_detected",
//           title: `Change detected: ${job.name}`,
//           message: `${diffPercentage.toFixed(2)}% of the page changed on ${job.url}`,
//           jobId: job.id,
//           screenshotId: newScreenshot.id,
//           actionUrl: `/jobs/${job.id}`,
//           actionText: "View Changes",
//         });
//       }

//       // Email notification
//       if (settings?.emailNotifications !== false) {
//         const emailRecipients = [user.email, ...job.notifyEmails].filter(Boolean);
//         if (emailRecipients.length > 0 && settings) {
//           try {
//             const emailService = new EmailService(settings);
//             await emailService.sendChangeAlert({
//               to: emailRecipients,
//               jobName: job.name,
//               url: job.url,
//               diffPercentage,
//               screenshotUrl: screenshotResult?.imageUrl || "",
//               diffUrl,
//               jobId: job.id,
//               appUrl,
//             });
//           } catch (emailErr) {
//             await log("warn", `Email notification failed: ${(emailErr as Error).message}`);
//           }
//         }
//       }
//     }

//     await log("info", `Run complete. Status: ${hasChanged ? "changed" : "no_change"}`);
//   } catch (err) {
//     const error = err as Error;
//     await log("error", `Job failed: ${error.message}`, { stack: error.stack });

//     const updatedJob = await prisma.monitorJob.update({
//       where: { id: job.id },
//       data: {
//         lastStatus: "error",
//         failureCount: { increment: 1 },
//         lastRunAt: new Date(),
//         totalRuns: { increment: 1 },
//       },
//     });

//     // Notify on failure
//     await createNotification({
//       userId: user.id,
//       type: "job_failed",
//       title: `Monitor job failed: ${job.name}`,
//       message: error.message,
//       jobId: job.id,
//       actionUrl: `/jobs/${job.id}`,
//       actionText: "View Logs",
//     });

//     // Email on failure (only if not failing too many times to avoid spam)
//     if (updatedJob.failureCount <= 3) {
//       const settings = user.settings;
//       if (settings?.emailNotifications) {
//         try {
//           const emailService = new EmailService(settings);
//           await emailService.sendJobFailureAlert({
//             to: [user.email],
//             jobName: job.name,
//             url: job.url,
//             error: error.message,
//             jobId: job.id,
//             appUrl,
//           });
//         } catch {}
//       }
//     }

//     throw err; // Re-throw so BullMQ marks job as failed and can retry
//   }
// }

// // ─── Worker instance ────────────────────────────────────────────────────────
// export function createScreenshotWorker() {
//   return new Worker(
//     "screenshot",
//     async (job: Job) => {
//       await processScreenshotJob(job.data.jobId);
//     },
//     {
//       connection,
//       concurrency: 3, // Process up to 3 jobs simultaneously
//     }
//   );
// }


import { Worker, type Job } from "bullmq";
import { prisma } from "@changd/database";
import { connection } from "@/lib/queue";
import { captureScreenshot } from "@/lib/screenshot/playwright";
import { compareScreenshots } from "@/lib/screenshot/comparison";
import { extractXPathContent, extractJsonApiContent } from "@/lib/screenshot/xpath";
import { computeTextDiff } from "@/lib/screenshot/text-diff";
import { getStorageProvider } from "@/lib/storage";
import { EmailService } from "@/lib/notifications/email";
import { createNotification } from "@/lib/notifications/in-app";

async function processScreenshotJob(jobId: string) {
  const job = await prisma.monitorJob.findUnique({
    where: { id: jobId },
    include: { user: { include: { settings: true } } },
  });

  if (!job || !job.enabled) return;

  const user = job.user;
  const settings = user.settings;
  const storageProvider = getStorageProvider(settings?.storageProvider);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const log = async (level: "info" | "warn" | "error", message: string, metadata?: object) => {
    await prisma.jobLog.create({
      data: {
        jobId: job.id,
        level,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  };

  await log("info", `Starting monitor run for: ${job.url}`);

  try {
    // ── 1. Fetch the previous snapshot ─────────────────────────────────────
    const latestSnapshot = await prisma.screenshot.findFirst({
      where: { jobId: job.id },
      orderBy: { capturedAt: "desc" },
    });

    // ── 2. Capture / Extract based on monitor type ──────────────────────────
    let screenshotResult: Awaited<ReturnType<typeof captureScreenshot>> | null = null;
    let extractedContent: string | null = null;

    if (job.monitorType === "xpath") {
      extractedContent = await extractXPathContent(job.url, job.xpathSelector!);
    } else if (job.monitorType === "json_api") {
      const httpHeaders = job.httpHeaders ? JSON.parse(job.httpHeaders) : undefined;
      extractedContent = await extractJsonApiContent(job.url, job.jsonPath!, httpHeaders);
    } else {
      // "visual" or "text" — both use Playwright
      // "text" mode: captureScreenshot=false (lightweight, no image)
      // "visual" mode: captureScreenshot depends on job.captureScreenshot toggle
      const doCapture =
        job.monitorType === "text"
          ? false
          : (job as any).captureScreenshot !== false; // default true

      screenshotResult = await captureScreenshot({
        url: job.url,
        viewportWidth: job.viewportWidth,
        viewportHeight: job.viewportHeight,
        fullPage: job.fullPage,
        captureScreenshot: doCapture,
        imageFormat: ((job as any).imageFormat || "webp") as "webp" | "avif" | "png",
        storageProvider,
        userId: user.id,
        jobId: job.id,
      });
    }

    // ── 3. Compare ──────────────────────────────────────────────────────────
    let hasChanged = false;
    let diffPercentage = 0;
    let diffPixels = 0;
    let diffUrl: string | undefined;
    let diffStorageKey: string | undefined;
    let textDiffResult: ReturnType<typeof computeTextDiff> | null = null;
    let textChanged = false;

    if (latestSnapshot) {
      // --- Visual pixel comparison ---
      if (
        job.monitorType === "visual" &&
        screenshotResult?.buffer &&
        latestSnapshot.imageUrl
      ) {
        const ignoreRegions = job.ignoreRegions ? JSON.parse(job.ignoreRegions) : undefined;
        const comparison = await compareScreenshots({
          oldImageUrl: latestSnapshot.imageUrl,
          newImageBuffer: screenshotResult.buffer,
          threshold: job.threshold,
          storageProvider,
          userId: user.id,
          jobId: job.id,
          ignoreRegions,
        });
        hasChanged = comparison.hasChanged;
        diffPercentage = comparison.diffPercentage;
        diffPixels = comparison.diffPixels;
        diffUrl = comparison.diffUrl;
        diffStorageKey = comparison.diffStorageKey;
      }

      // --- Text comparison (visual with screenshot OFF, or "text" type) ---
      if (
        (job.monitorType === "text" ||
          (job.monitorType === "visual" && (job as any).captureScreenshot === false)) &&
        screenshotResult?.textContent &&
        latestSnapshot.textContent
      ) {
        textDiffResult = computeTextDiff(
          latestSnapshot.textContent,
          screenshotResult.textContent
        );
        textChanged = textDiffResult.hasChanged;
        hasChanged = textChanged;
        diffPercentage = textChanged ? 100 : 0;
      }

      // --- XPath / JSON text comparison ---
      if (
        (job.monitorType === "xpath" || job.monitorType === "json_api") &&
        latestSnapshot.extractedContent !== null &&
        extractedContent !== null
      ) {
        textDiffResult = computeTextDiff(latestSnapshot.extractedContent, extractedContent);
        textChanged = textDiffResult.hasChanged;
        hasChanged = textChanged;
        diffPercentage = textChanged ? 100 : 0;
      }
    } else {
      await log("info", "First run — baseline captured");
    }

    // ── 4. Save snapshot record ─────────────────────────────────────────────
    const newSnapshot = await prisma.screenshot.create({
      data: {
        jobId: job.id,
        imageUrl: screenshotResult?.imageUrl || "",
        storageKey: screenshotResult?.storageKey || "",
        previousId: latestSnapshot?.id,
        diffUrl,
        diffStorageKey,
        diffPercentage,
        diffPixels,
        hasChanged,
        extractedContent,
        textContent: screenshotResult?.textContent || extractedContent || null,
        textDiff: textDiffResult?.unifiedDiff || null,
        textChanged,
        capturedAt: new Date(),
        captureDuration: screenshotResult?.captureDuration || 0,
        viewportWidth: screenshotResult?.viewportWidth || job.viewportWidth,
        viewportHeight: screenshotResult?.viewportHeight || job.viewportHeight,
        pageTitle: screenshotResult?.pageTitle || null,
      },
    });

    // ── 5. Update job status ────────────────────────────────────────────────
    await prisma.monitorJob.update({
      where: { id: job.id },
      data: {
        lastRunAt: new Date(),
        lastStatus: hasChanged ? "changed" : "no_change",
        failureCount: 0,
        totalRuns: { increment: 1 },
      },
    });

    // ── 6. Notify if changed ────────────────────────────────────────────────
    if (hasChanged && latestSnapshot) {
      const changeDescription =
        textDiffResult
          ? `${textDiffResult.addedLines} lines added, ${textDiffResult.removedLines} lines removed`
          : `${diffPercentage.toFixed(2)}% of the page changed`;

      await log("info", `Change detected: ${changeDescription}`);

      if (!settings || settings.inAppNotifications !== false) {
        await createNotification({
          userId: user.id,
          type: "change_detected",
          title: `Change detected: ${job.name}`,
          message: changeDescription,
          jobId: job.id,
          screenshotId: newSnapshot.id,
          actionUrl: `/jobs/${job.id}`,
          actionText: "View Changes",
        });
      }

      if (settings?.emailNotifications !== false) {
        const emailRecipients = [user.email, ...job.notifyEmails].filter(Boolean);
        if (emailRecipients.length > 0 && settings) {
          try {
            const emailService = new EmailService(settings);
            await emailService.sendChangeAlert({
              to: emailRecipients,
              jobName: job.name,
              url: job.url,
              diffPercentage,
              screenshotUrl: screenshotResult?.imageUrl || "",
              diffUrl,
              jobId: job.id,
              appUrl,
              textDiff: textDiffResult?.unifiedDiff as any,
            });
          } catch (emailErr) {
            await log("warn", `Email failed: ${(emailErr as Error).message}`);
          }
        }
      }
    }

    await log("info", `Run complete. Status: ${hasChanged ? "changed" : "no_change"}`);
  } catch (err) {
    const error = err as Error;
    await log("error", `Job failed: ${error.message}`, { stack: error.stack });

    const updatedJob = await prisma.monitorJob.update({
      where: { id: job.id },
      data: {
        lastStatus: "error",
        failureCount: { increment: 1 },
        lastRunAt: new Date(),
        totalRuns: { increment: 1 },
      },
    });

    await createNotification({
      userId: user.id,
      type: "job_failed",
      title: `Monitor job failed: ${job.name}`,
      message: error.message,
      jobId: job.id,
      actionUrl: `/jobs/${job.id}`,
      actionText: "View Logs",
    });

    if (updatedJob.failureCount <= 3 && user.settings?.emailNotifications) {
      try {
        const emailService = new EmailService(user.settings);
        await emailService.sendJobFailureAlert({
          to: [user.email],
          jobName: job.name,
          url: job.url,
          error: error.message,
          jobId: job.id,
          appUrl,
        });
      } catch {}
    }

    throw err;
  }
}

export function createScreenshotWorker() {
  return new Worker(
    "screenshot",
    async (job: Job) => {
      await processScreenshotJob(job.data.jobId);
    },
    {
      connection,
      concurrency: 2, // Reduced from 3 — saves memory
    }
  );
}
