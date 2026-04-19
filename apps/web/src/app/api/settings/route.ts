// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@changd/database";
// import { auth } from "@/lib/auth";
// import { z } from "zod";
// import { headers } from "next/headers";

// async function getUser() {
//   const session = await auth.api.getSession({ headers: await headers() });
//   return session?.user || null;
// }

// // GET /api/settings
// export async function GET() {
//   const user = await getUser();
//   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   let settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });

//   if (!settings) {
//     settings = await prisma.userSettings.create({ data: { userId: user.id } });
//   }

//   // Mask secrets in response
//   return NextResponse.json({
//     settings: {
//       ...settings,
//       resendApiKey: settings.resendApiKey ? "••••••••" : null,
//       smtpPassword: settings.smtpPassword ? "••••••••" : null,
//       s3AccessKey: settings.s3AccessKey ? "••••••••" : null,
//       s3SecretKey: settings.s3SecretKey ? "••••••••" : null,
//     },
//   });
// }

// const settingsSchema = z.object({
//   emailNotifications: z.boolean().optional(),
//   inAppNotifications: z.boolean().optional(),
//   emailProvider: z.enum(["resend", "smtp", "both"]).optional(),
//   emailFrom: z.string().email().optional(),
//   resendApiKey: z.string().optional(),
//   smtpHost: z.string().optional(),
//   smtpPort: z.number().int().optional(),
//   smtpUser: z.string().optional(),
//   smtpPassword: z.string().optional(),
//   smtpSecure: z.boolean().optional(),
//   storageProvider: z.enum(["uploadthing", "s3"]).optional(),
//   s3Bucket: z.string().optional(),
//   s3Region: z.string().optional(),
//   s3AccessKey: z.string().optional(),
//   s3SecretKey: z.string().optional(),
// });

// // PATCH /api/settings
// export async function PATCH(req: NextRequest) {
//   const user = await getUser();
//   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const body = await req.json();
//   const parsed = settingsSchema.safeParse(body);
//   if (!parsed.success)
//     return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

//   // Don't overwrite masked values
//   const data = Object.fromEntries(
//     Object.entries(parsed.data).filter(([, v]) => v !== "••••••••")
//   );

//   const settings = await prisma.userSettings.upsert({
//     where: { userId: user.id },
//     create: { userId: user.id, ...data },
//     update: data,
//   });

//   return NextResponse.json({ settings });
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@changd/database";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { headers } from "next/headers";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}

// GET /api/settings
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });

  if (!settings) {
    settings = await prisma.userSettings.create({ data: { userId: user.id } });
  }

  // Mask secrets in response
  return NextResponse.json({
    settings: {
      ...settings,
      resendApiKey: settings.resendApiKey ? "••••••••" : null,
      smtpPassword: settings.smtpPassword ? "••••••••" : null,
      s3AccessKey: settings.s3AccessKey ? "••••••••" : null,
      s3SecretKey: settings.s3SecretKey ? "••••••••" : null,
    },
  });
}

const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  emailProvider: z.enum(["resend", "smtp", "both"]).optional(),
  emailFrom: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().email().optional().nullable()
  ),
  resendApiKey: z.string().optional().nullable(),      // Add .nullable()
  smtpHost: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().optional().nullable()
  ),
  smtpPort: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    },
    z.number().int().optional().nullable()
  ),
  smtpUser: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().optional().nullable()
  ),
  smtpPassword: z.string().optional().nullable(),      // Add .nullable()
  smtpSecure: z.boolean().optional(),
  storageProvider: z.enum(["uploadthing", "s3"]).optional(),
  s3Bucket: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().optional().nullable()
  ),
  s3Region: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().optional().nullable()
  ),
  s3AccessKey: z.string().optional().nullable(),       // Add .nullable()
  s3SecretKey: z.string().optional().nullable(),       // Add .nullable()
});
// PATCH /api/settings
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.flatten());
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    // Don't overwrite masked values - filter them out completely
    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== "••••••••")
    );

    // Additional cleanup: remove undefined values to prevent overwriting with undefined
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...cleanData },
      update: cleanData,
    });

    // Return masked response
    return NextResponse.json({
      settings: {
        ...settings,
        resendApiKey: settings.resendApiKey ? "••••••••" : null,
        smtpPassword: settings.smtpPassword ? "••••••••" : null,
        s3AccessKey: settings.s3AccessKey ? "••••••••" : null,
        s3SecretKey: settings.s3SecretKey ? "••••••••" : null,
      },
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}