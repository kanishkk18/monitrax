// import { chromium } from "playwright";
// import type { IStorageProvider } from "@/lib/storage";

// export interface ScreenshotOptions {
//   url: string;
//   viewportWidth: number;
//   viewportHeight: number;
//   fullPage: boolean;
//   storageProvider: IStorageProvider;
//   userId: string;
//   jobId: string;
// }

// export interface ScreenshotResult {
//   imageUrl: string;
//   storageKey: string;
//   captureDuration: number;
//   viewportWidth: number;
//   viewportHeight: number;
//   pageTitle: string;
//   buffer: Buffer; // kept in memory for immediate comparison
// }

// export async function captureScreenshot(
//   options: ScreenshotOptions
// ): Promise<ScreenshotResult> {
//   const { url, viewportWidth, viewportHeight, fullPage, storageProvider, userId, jobId } =
//     options;

//   const browser = await chromium.launch({ headless: true });

//   try {
//     const context = await browser.newContext({
//       viewport: { width: viewportWidth, height: viewportHeight },
//       userAgent:
//         "Mozilla/5.0 (compatible; Changd-Monitor/1.0; +https://changd.app)",
//     });

//     const page = await context.newPage();
//     const startTime = Date.now();

//     await page.goto(url, {
//       waitUntil: "networkidle",
//       timeout: 30_000,
//     });

//     // Wait a bit for any lazy-loaded content
//     await page.waitForTimeout(1000);

//     const pageTitle = await page.title();

//     const screenshotBuffer = await page.screenshot({
//       fullPage,
//       type: "png",
//     });

//     const captureDuration = Date.now() - startTime;
//     const buffer = Buffer.from(screenshotBuffer);

//     // Upload to storage
//     const timestamp = Date.now();
//     const storageKey = `screenshots/${userId}/${jobId}/${timestamp}.png`;
//     const imageUrl = await storageProvider.upload(storageKey, buffer);

//     return {
//       imageUrl,
//       storageKey,
//       captureDuration,
//       viewportWidth,
//       viewportHeight,
//       pageTitle,
//       buffer,
//     };
//   } finally {
//     await browser.close();
//   }
// }

// All Playwright imports are dynamic — never loaded by Next.js pages
import type { IStorageProvider } from "@/lib/storage";

export type ImageFormat = "webp" | "avif" | "png";

export interface ScreenshotOptions {
  url: string;
  viewportWidth: number;
  viewportHeight: number;
  fullPage: boolean;
  captureScreenshot: boolean; // if false, skip image capture entirely
  imageFormat: ImageFormat;
  storageProvider: IStorageProvider;
  userId: string;
  jobId: string;
}

export interface ScreenshotResult {
  imageUrl: string;
  storageKey: string;
  captureDuration: number;
  viewportWidth: number;
  viewportHeight: number;
  pageTitle: string;
  buffer: Buffer | null; // null when captureScreenshot=false
  textContent: string;   // always extracted regardless of screenshot toggle
}

export async function captureScreenshot(
  options: ScreenshotOptions
): Promise<ScreenshotResult> {
  const {
    url,
    viewportWidth,
    viewportHeight,
    fullPage,
    captureScreenshot: doCapture,
    imageFormat,
    storageProvider,
    userId,
    jobId,
  } = options;

  // Dynamic import — Playwright never touched by Next.js module graph
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: viewportWidth, height: viewportHeight },
      userAgent: "Mozilla/5.0 (compatible; Changd-Monitor/1.0; +https://changd.app)",
    });

    const page = await context.newPage();
    const startTime = Date.now();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForTimeout(800);

    const pageTitle = await page.title();

    // ── Always extract full visible text ──────────────────────────────────
    const textContent = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("script,style,nav,footer,header,[aria-hidden]").forEach((el) =>
        el.remove()
      );
      return clone.innerText
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)
        .join("\n");
    });

    const captureDuration = Date.now() - startTime;

    // ── Optional image capture ─────────────────────────────────────────────
//     if (!doCapture) {
//       return {
//         imageUrl: "",
//         storageKey: "",
//         captureDuration,
//         viewportWidth,
//         viewportHeight,
//         pageTitle,
//         buffer: null,
//         textContent,
//       };
//     }

//     const screenshotBuffer = await page.screenshot({ fullPage, type: "png" });
//     const rawBuffer = Buffer.from(screenshotBuffer);

//     // ── Convert to WebP or AVIF using sharp ───────────────────────────────
//     let finalBuffer: Buffer;
//     let ext: string;
//     let mimeType: string;

//     try {
//       const sharp = (await import("sharp")).default;
//       if (imageFormat === "avif") {
//         finalBuffer = await sharp(rawBuffer).avif({ quality: 60 }).toBuffer();
//         ext = "avif";
//         mimeType = "image/avif";
//       } else if (imageFormat === "webp") {
//         finalBuffer = await sharp(rawBuffer).webp({ quality: 75 }).toBuffer();
//         ext = "webp";
//         mimeType = "image/webp";
//       } else {
//         finalBuffer = rawBuffer;
//         ext = "png";
//         mimeType = "image/png";
//       }
//     } catch {
//       // sharp not available — fall back to png
//       finalBuffer = rawBuffer;
//       ext = "png";
//       mimeType = "image/png";
//     }

//     const timestamp = Date.now();
//     const storageKey = `screenshots/${userId}/${jobId}/${timestamp}.${ext}`;
//     const imageUrl = await storageProvider.upload(storageKey, finalBuffer, mimeType);

//     return {
//       imageUrl,
//       storageKey,
//       captureDuration: Date.now() - startTime,
//       viewportWidth,
//       viewportHeight,
//       pageTitle,
//       buffer: finalBuffer,
//       textContent,
//     };
//   } finally {
//     await browser.close();
//   }
// }

    // ── Optional image capture ─────────────────────────────────────────────
    if (!doCapture) {
      return {
        imageUrl: "",
        storageKey: "",
        captureDuration,
        viewportWidth,
        viewportHeight,
        pageTitle,
        buffer: null,
        textContent,
      };
    }

    const screenshotBuffer = await page.screenshot({ fullPage, type: "png" });
    const rawBuffer = Buffer.from(screenshotBuffer);

    // Validate screenshot succeeded
    if (!rawBuffer || rawBuffer.length < 100) {
      throw new Error(`Screenshot produced empty buffer for ${url}`);
    }

    // ── Convert to WebP or AVIF using sharp (FOR UPLOAD ONLY) ─────────────
    let uploadBuffer: Buffer;
    let ext: string;
    let mimeType: string;

    try {
      const sharp = (await import("sharp")).default;
      if (imageFormat === "avif") {
        uploadBuffer = await sharp(rawBuffer).avif({ quality: 60 }).toBuffer();
        ext = "avif";
        mimeType = "image/avif";
      } else if (imageFormat === "webp") {
        uploadBuffer = await sharp(rawBuffer).webp({ quality: 75 }).toBuffer();
        ext = "webp";
        mimeType = "image/webp";
      } else {
        uploadBuffer = rawBuffer;
        ext = "png";
        mimeType = "image/png";
      }
    } catch {
      uploadBuffer = rawBuffer;
      ext = "png";
      mimeType = "image/png";
    }

    const timestamp = Date.now();
    const storageKey = `screenshots/${userId}/${jobId}/${timestamp}.${ext}`;
    const imageUrl = await storageProvider.upload(storageKey, uploadBuffer, mimeType);

    return {
      imageUrl,
      storageKey,
      captureDuration: Date.now() - startTime,
      viewportWidth,
      viewportHeight,
      pageTitle,
      buffer: rawBuffer, // ← ALWAYS raw PNG for pixel comparison
      textContent,
    };
    } finally {
    await browser.close();
  }
}