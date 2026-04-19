// // packages/shared/src/index.ts
// // Shared types used across web app (and future mobile app)

// export type MonitorType = "visual" | "xpath" | "json_api";
// export type JobStatus = "success" | "changed" | "no_change" | "error";
// export type StorageProvider = "uploadthing" | "s3";
// export type EmailProvider = "resend" | "smtp" | "both";
// export type NotificationType =
//   | "change_detected"
//   | "job_failed"
//   | "job_recovered"
//   | "system";

// export interface CronPreset {
//   label: string;
//   value: string;
//   description: string;
// }

// export const CRON_PRESETS: CronPreset[] = [
//   {
//     label: "Every 15 minutes",
//     value: "*/15 * * * *",
//     description: "Runs every 15 minutes",
//   },
//   {
//     label: "Every 30 minutes",
//     value: "*/30 * * * *",
//     description: "Runs every 30 minutes",
//   },
//   {
//     label: "Every hour",
//     value: "0 * * * *",
//     description: "Runs at the start of every hour",
//   },
//   {
//     label: "Every 6 hours",
//     value: "0 */6 * * *",
//     description: "Runs every 6 hours",
//   },
//   {
//     label: "Every 12 hours",
//     value: "0 */12 * * *",
//     description: "Runs every 12 hours",
//   },
//   {
//     label: "Daily at 9 AM",
//     value: "0 9 * * *",
//     description: "Runs once a day at 9:00 AM",
//   },
//   {
//     label: "Daily at midnight",
//     value: "0 0 * * *",
//     description: "Runs once a day at midnight",
//   },
//   {
//     label: "Weekly (Monday 9 AM)",
//     value: "0 9 * * 1",
//     description: "Runs every Monday at 9:00 AM",
//   },
// ];

// export interface DiffRegion {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   label?: string;
// }

// export interface JobFormValues {
//   name: string;
//   url: string;
//   description?: string;
//   monitorType: MonitorType;
//   xpathSelector?: string;
//   jsonPath?: string;
//   httpHeaders?: string;
//   viewportWidth: number;
//   viewportHeight: number;
//   fullPage: boolean;
//   threshold: number;
//   cronExpression: string;
//   notifyEmails: string[];
//   enabled: boolean;
//   ignoreRegions?: DiffRegion[];
// }

// export interface ApiResponse<T = unknown> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   message?: string;
// }

// packages/shared/src/index.ts
// Shared types used across web app (and future mobile app)

export type MonitorType = "visual" | "text" | "xpath" | "json_api";
export type ImageFormat = "webp" | "avif" | "png";
export type JobStatus = "success" | "changed" | "no_change" | "error";
export type StorageProvider = "uploadthing" | "s3";
export type EmailProvider = "resend" | "smtp" | "both";
export type NotificationType =
  | "change_detected"
  | "job_failed"
  | "job_recovered"
  | "system";

export interface CronPreset {
  label: string;
  value: string;
  description: string;
}

export const CRON_PRESETS: CronPreset[] = [
  {
    label: "Every 15 minutes",
    value: "*/15 * * * *",
    description: "Runs every 15 minutes",
  },
  {
    label: "Every 30 minutes",
    value: "*/30 * * * *",
    description: "Runs every 30 minutes",
  },
  {
    label: "Every hour",
    value: "0 * * * *",
    description: "Runs at the start of every hour",
  },
  {
    label: "Every 6 hours",
    value: "0 */6 * * *",
    description: "Runs every 6 hours",
  },
  {
    label: "Every 12 hours",
    value: "0 */12 * * *",
    description: "Runs every 12 hours",
  },
  {
    label: "Daily at 9 AM",
    value: "0 9 * * *",
    description: "Runs once a day at 9:00 AM",
  },
  {
    label: "Daily at midnight",
    value: "0 0 * * *",
    description: "Runs once a day at midnight",
  },
  {
    label: "Weekly (Monday 9 AM)",
    value: "0 9 * * 1",
    description: "Runs every Monday at 9:00 AM",
  },
];

export interface DiffRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface JobFormValues {
  name: string;
  url: string;
  description?: string;
  monitorType: MonitorType;
  xpathSelector?: string;
  jsonPath?: string;
  httpHeaders?: string;
  viewportWidth: number;
  viewportHeight: number;
  fullPage: boolean;
  threshold: number;
  cronExpression: string;
  notifyEmails: string[];
  enabled: boolean;
  ignoreRegions?: DiffRegion[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
