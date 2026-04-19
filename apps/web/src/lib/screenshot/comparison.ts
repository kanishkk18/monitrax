// // import pixelmatch from "pixelmatch";
// // import { PNG } from "pngjs";
// // import type { IStorageProvider } from "@/lib/storage";

// // export interface ComparisonResult {
// //   diffPercentage: number;
// //   diffPixels: number;
// //   totalPixels: number;
// //   hasChanged: boolean;
// //   diffUrl?: string;
// //   diffStorageKey?: string;
// // }

// // export interface IgnoreRegion {
// //   x: number;
// //   y: number;
// //   width: number;
// //   height: number;
// // }

// // export async function compareScreenshots(params: {
// //   oldImageUrl: string;
// //   newImageBuffer: Buffer;
// //   threshold: number; // 0-100 percentage
// //   storageProvider: IStorageProvider;
// //   userId: string;
// //   jobId: string;
// //   ignoreRegions?: IgnoreRegion[];
// // }): Promise<ComparisonResult> {
// //   const { oldImageUrl, newImageBuffer, threshold, storageProvider, userId, jobId, ignoreRegions } =
// //     params;

// //   // Fetch old image
// //   const oldResponse = await fetch(oldImageUrl);
// //   if (!oldResponse.ok) throw new Error("Failed to fetch previous screenshot");
// //   const oldBuffer = Buffer.from(await oldResponse.arrayBuffer());

// //   const img1 = PNG.sync.read(oldBuffer);
// //   const img2 = PNG.sync.read(newImageBuffer);

// //   // Handle dimension mismatch
// //   if (img1.width !== img2.width || img1.height !== img2.height) {
// //     return {
// //       diffPercentage: 100,
// //       diffPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
// //       totalPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
// //       hasChanged: true,
// //     };
// //   }

// //   const { width, height } = img1;
// //   const diff = new PNG({ width, height });

// //   // Zero out ignored regions in both images before comparison
// //   if (ignoreRegions && ignoreRegions.length > 0) {
// //     for (const region of ignoreRegions) {
// //       for (let y = region.y; y < region.y + region.height; y++) {
// //         for (let x = region.x; x < region.x + region.width; x++) {
// //           const idx = (y * width + x) * 4;
// //           // Make both images identical in ignored regions (set to same grey)
// //           img1.data[idx] = img2.data[idx] = 128;
// //           img1.data[idx + 1] = img2.data[idx + 1] = 128;
// //           img1.data[idx + 2] = img2.data[idx + 2] = 128;
// //           img1.data[idx + 3] = img2.data[idx + 3] = 255;
// //         }
// //       }
// //     }
// //   }

// //   const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
// //     threshold: 0.1, // per-pixel color threshold
// //     includeAA: false,
// //     diffColor: [255, 0, 0], // red highlights
// //     diffColorAlt: [0, 255, 0], // green for anti-aliasing
// //   });

// //   const totalPixels = width * height;
// //   const diffPercentage = (diffPixels / totalPixels) * 100;
// //   const hasChanged = diffPercentage > threshold;

// //   let diffUrl: string | undefined;
// //   let diffStorageKey: string | undefined;

// //   if (hasChanged && diffPixels > 0) {
// //     // Generate and upload the diff image
// //     const diffBuffer = PNG.sync.write(diff);
// //     const timestamp = Date.now();
// //     diffStorageKey = `diffs/${userId}/${jobId}/${timestamp}.png`;
// //     diffUrl = await storageProvider.upload(diffStorageKey, Buffer.from(diffBuffer));
// //   }

// //   return {
// //     diffPercentage,
// //     diffPixels,
// //     totalPixels,
// //     hasChanged,
// //     diffUrl,
// //     diffStorageKey,
// //   };
// // }

// import pixelmatch from "pixelmatch";
// import { PNG } from "pngjs";
// import type { IStorageProvider } from "@/lib/storage";

// export interface ComparisonResult {
//   diffPercentage: number;
//   diffPixels: number;
//   totalPixels: number;
//   hasChanged: boolean;
//   diffUrl?: string;
//   diffStorageKey?: string;
// }

// export interface IgnoreRegion {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }

// /** Check if buffer is a valid PNG by inspecting magic bytes */
// function isValidPng(buffer: Buffer): boolean {
//   return (
//     buffer.length > 8 &&
//     buffer[0] === 0x89 &&
//     buffer[1] === 0x50 &&
//     buffer[2] === 0x4e &&
//     buffer[3] === 0x47 &&
//     buffer[4] === 0x0d &&
//     buffer[5] === 0x0a &&
//     buffer[6] === 0x1a &&
//     buffer[7] === 0x0a
//   );
// }

// export async function compareScreenshots(params: {
//   oldImageUrl: string;
//   newImageBuffer: Buffer;
//   threshold: number;
//   storageProvider: IStorageProvider;
//   userId: string;
//   jobId: string;
//   ignoreRegions?: IgnoreRegion[];
// }): Promise<ComparisonResult> {
//   const { oldImageUrl, newImageBuffer, threshold, storageProvider, userId, jobId, ignoreRegions } =
//     params;

//   // ── Validate new image buffer ───────────────────────────────────────────
//   if (!newImageBuffer || newImageBuffer.length < 100) {
//     throw new Error(`New screenshot buffer is empty or truncated (${newImageBuffer?.length} bytes)`);
//   }
//   if (!isValidPng(newImageBuffer)) {
//     throw new Error("New screenshot buffer is not a valid PNG");
//   }

//   // ── Fetch old image with validation ─────────────────────────────────────
//   const oldResponse = await fetch(oldImageUrl, { redirect: "follow" });
//   if (!oldResponse.ok) {
//     throw new Error(`Failed to fetch previous screenshot: ${oldResponse.status} ${oldResponse.statusText}`);
//   }
  
//   // Check content-type to catch HTML error pages early
//   const contentType = oldResponse.headers.get("content-type") || "";
//   if (contentType.includes("text/html")) {
//     throw new Error("Previous screenshot URL returned HTML instead of image data");
//   }

//   const oldBuffer = Buffer.from(await oldResponse.arrayBuffer());
  
//   if (!isValidPng(oldBuffer)) {
//     throw new Error(`Previous screenshot is not a valid PNG (got ${oldBuffer.length} bytes, content-type: ${contentType})`);
//   }

//   const img1 = PNG.sync.read(oldBuffer);
//   const img2 = PNG.sync.read(newImageBuffer);

//   // Handle dimension mismatch
//   if (img1.width !== img2.width || img1.height !== img2.height) {
//     return {
//       diffPercentage: 100,
//       diffPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
//       totalPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
//       hasChanged: true,
//     };
//   }

//   const { width, height } = img1;
//   const diff = new PNG({ width, height });

//   // Zero out ignored regions in both images before comparison
//   if (ignoreRegions && ignoreRegions.length > 0) {
//     for (const region of ignoreRegions) {
//       for (let y = region.y; y < region.y + region.height; y++) {
//         for (let x = region.x; x < region.x + region.width; x++) {
//           const idx = (y * width + x) * 4;
//           img1.data[idx] = img2.data[idx] = 128;
//           img1.data[idx + 1] = img2.data[idx + 1] = 128;
//           img1.data[idx + 2] = img2.data[idx + 2] = 128;
//           img1.data[idx + 3] = img2.data[idx + 3] = 255;
//         }
//       }
//     }
//   }

//   const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
//     threshold: 0.1,
//     includeAA: false,
//     diffColor: [255, 0, 0],
//     diffColorAlt: [0, 255, 0],
//   });

//   const totalPixels = width * height;
//   const diffPercentage = (diffPixels / totalPixels) * 100;
//   const hasChanged = diffPercentage > threshold;

//   let diffUrl: string | undefined;
//   let diffStorageKey: string | undefined;

//   if (hasChanged && diffPixels > 0) {
//     const diffBuffer = PNG.sync.write(diff);
//     const timestamp = Date.now();
//     diffStorageKey = `diffs/${userId}/${jobId}/${timestamp}.png`;
//     diffUrl = await storageProvider.upload(diffStorageKey, Buffer.from(diffBuffer));
//   }

//   return {
//     diffPercentage,
//     diffPixels,
//     totalPixels,
//     hasChanged,
//     diffUrl,
//     diffStorageKey,
//   };
// }

// import pixelmatch from "pixelmatch";
// import { PNG } from "pngjs";
// import type { IStorageProvider } from "@/lib/storage";

// export interface ComparisonResult {
//   diffPercentage: number;
//   diffPixels: number;
//   totalPixels: number;
//   hasChanged: boolean;
//   diffUrl?: string;
//   diffStorageKey?: string;
// }

// export interface IgnoreRegion {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }

// /** Convert any image format to PNG using sharp */
// async function toPng(buffer: Buffer): Promise<Buffer> {
//   // Check if already PNG
//   if (
//     buffer.length > 8 &&
//     buffer[0] === 0x89 &&
//     buffer[1] === 0x50 &&
//     buffer[2] === 0x4e &&
//     buffer[3] === 0x47
//   ) {
//     return buffer;
//   }
  
//   const sharp = (await import("sharp")).default;
//   return await sharp(buffer).png().toBuffer();
// }

// export async function compareScreenshots(params: {
//   oldImageUrl: string;
//   newImageBuffer: Buffer;
//   threshold: number;
//   storageProvider: IStorageProvider;
//   userId: string;
//   jobId: string;
//   ignoreRegions?: IgnoreRegion[];
// }): Promise<ComparisonResult> {
//   const { oldImageUrl, newImageBuffer, threshold, storageProvider, userId, jobId, ignoreRegions } =
//     params;

//   // ── Validate new image buffer ───────────────────────────────────────────
//   if (!newImageBuffer || newImageBuffer.length < 100) {
//     throw new Error(`New screenshot buffer is empty or truncated (${newImageBuffer?.length} bytes)`);
//   }

//   // ── Fetch old image with validation ─────────────────────────────────────
//   const oldResponse = await fetch(oldImageUrl, { redirect: "follow" });
//   if (!oldResponse.ok) {
//     throw new Error(`Failed to fetch previous screenshot: ${oldResponse.status} ${oldResponse.statusText}`);
//   }
  
//   const contentType = oldResponse.headers.get("content-type") || "";
//   if (contentType.includes("text/html")) {
//     throw new Error("Previous screenshot URL returned HTML instead of image data");
//   }

//   const oldBuffer = Buffer.from(await oldResponse.arrayBuffer());
//   if (!oldBuffer || oldBuffer.length < 100) {
//     throw new Error(`Previous screenshot buffer is empty (${oldBuffer?.length} bytes)`);
//   }

//   // ── Convert both to PNG (handles WebP/AVIF/PNG inputs) ──────────────────
//   let oldPng: Buffer;
//   let newPng: Buffer;
  
//   try {
//     [oldPng, newPng] = await Promise.all([
//       toPng(oldBuffer),
//       toPng(newImageBuffer),
//     ]);
//   } catch (convertErr) {
//     throw new Error(`Failed to convert images to PNG: ${(convertErr as Error).message}`);
//   }

//   const img1 = PNG.sync.read(oldPng);
//   const img2 = PNG.sync.read(newPng);

//   // Handle dimension mismatch
//   if (img1.width !== img2.width || img1.height !== img2.height) {
//     return {
//       diffPercentage: 100,
//       diffPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
//       totalPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
//       hasChanged: true,
//     };
//   }

//   const { width, height } = img1;
//   const diff = new PNG({ width, height });

//   // Zero out ignored regions in both images before comparison
//   if (ignoreRegions && ignoreRegions.length > 0) {
//     for (const region of ignoreRegions) {
//       for (let y = region.y; y < region.y + region.height; y++) {
//         for (let x = region.x; x < region.x + region.width; x++) {
//           const idx = (y * width + x) * 4;
//           img1.data[idx] = img2.data[idx] = 128;
//           img1.data[idx + 1] = img2.data[idx + 1] = 128;
//           img1.data[idx + 2] = img2.data[idx + 2] = 128;
//           img1.data[idx + 3] = img2.data[idx + 3] = 255;
//         }
//       }
//     }
//   }

//   const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
//     threshold: 0.1,
//     includeAA: false,
//     diffColor: [255, 0, 0],
//     diffColorAlt: [0, 255, 0],
//   });

//   const totalPixels = width * height;
//   const diffPercentage = (diffPixels / totalPixels) * 100;
//   const hasChanged = diffPercentage > threshold;

//   let diffUrl: string | undefined;
//   let diffStorageKey: string | undefined;

//   if (hasChanged && diffPixels > 0) {
//     const diffBuffer = PNG.sync.write(diff);
//     const timestamp = Date.now();
//     diffStorageKey = `diffs/${userId}/${jobId}/${timestamp}.png`;
//     diffUrl = await storageProvider.upload(diffStorageKey, Buffer.from(diffBuffer));
//   }

//   return {
//     diffPercentage,
//     diffPixels,
//     totalPixels,
//     hasChanged,
//     diffUrl,
//     diffStorageKey,
//   };
// }

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import type { IStorageProvider } from "@/lib/storage";

export interface ComparisonResult {
  diffPercentage: number;
  diffPixels: number;
  totalPixels: number;
  hasChanged: boolean;
  diffUrl?: string;
  diffStorageKey?: string;
}

export interface IgnoreRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Convert any image format to PNG using sharp */
async function toPng(buffer: Buffer): Promise<Buffer> {
  // Check if already PNG by magic bytes
  if (
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return buffer;
  }
  
  const sharp = (await import("sharp")).default;
  return await sharp(buffer).png().toBuffer();
}

export async function compareScreenshots(params: {
  oldImageUrl: string;
  newImageBuffer: Buffer;
  threshold: number;
  storageProvider: IStorageProvider;
  userId: string;
  jobId: string;
  ignoreRegions?: IgnoreRegion[];
}): Promise<ComparisonResult> {
  const { oldImageUrl, newImageBuffer, threshold, storageProvider, userId, jobId, ignoreRegions } =
    params;

  // ── Validate new image buffer ───────────────────────────────────────────
  if (!newImageBuffer || newImageBuffer.length < 100) {
    throw new Error(`New screenshot buffer is empty or truncated (${newImageBuffer?.length} bytes)`);
  }

  // ── Fetch old image ─────────────────────────────────────────────────────
  const oldResponse = await fetch(oldImageUrl, { redirect: "follow" });
  if (!oldResponse.ok) {
    throw new Error(`Failed to fetch previous screenshot: ${oldResponse.status} ${oldResponse.statusText}`);
  }
  
  const contentType = oldResponse.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error("Previous screenshot URL returned HTML instead of image data");
  }

  const oldBuffer = Buffer.from(await oldResponse.arrayBuffer());
  if (!oldBuffer || oldBuffer.length < 100) {
    throw new Error(`Previous screenshot buffer is empty (${oldBuffer?.length} bytes)`);
  }

  // ── Convert old image to PNG (new image is already PNG) ─────────────────
  let oldPng: Buffer;
  try {
    oldPng = await toPng(oldBuffer);
  } catch (convertErr) {
    throw new Error(`Failed to convert previous image to PNG: ${(convertErr as Error).message}`);
  }

  const img1 = PNG.sync.read(oldPng);
  const img2 = PNG.sync.read(newImageBuffer); // Already PNG from captureScreenshot

  // Handle dimension mismatch
  if (img1.width !== img2.width || img1.height !== img2.height) {
    return {
      diffPercentage: 100,
      diffPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
      totalPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
      hasChanged: true,
    };
  }

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  // Zero out ignored regions in both images before comparison
  if (ignoreRegions && ignoreRegions.length > 0) {
    for (const region of ignoreRegions) {
      for (let y = region.y; y < region.y + region.height; y++) {
        for (let x = region.x; x < region.x + region.width; x++) {
          const idx = (y * width + x) * 4;
          img1.data[idx] = img2.data[idx] = 128;
          img1.data[idx + 1] = img2.data[idx + 1] = 128;
          img1.data[idx + 2] = img2.data[idx + 2] = 128;
          img1.data[idx + 3] = img2.data[idx + 3] = 255;
        }
      }
    }
  }

  const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
    diffColor: [255, 0, 0],
    diffColorAlt: [0, 255, 0],
  });

  const totalPixels = width * height;
  const diffPercentage = (diffPixels / totalPixels) * 100;
  const hasChanged = diffPercentage > threshold;

  let diffUrl: string | undefined;
  let diffStorageKey: string | undefined;

  if (hasChanged && diffPixels > 0) {
    const diffBuffer = PNG.sync.write(diff);
    const timestamp = Date.now();
    diffStorageKey = `diffs/${userId}/${jobId}/${timestamp}.png`;
    diffUrl = await storageProvider.upload(diffStorageKey, Buffer.from(diffBuffer));
  }

  return {
    diffPercentage,
    diffPixels,
    totalPixels,
    hasChanged,
    diffUrl,
    diffStorageKey,
  };
}