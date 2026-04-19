import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@changd/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}

// GET /api/notifications
export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const unreadOnly = searchParams.get("unread") === "true";

  const where = {
    userId: user.id,
    ...(unreadOnly ? { read: false } : {}),
  };

  const [notifications, unreadCount, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.notification.count({ where }),
  ]);

  return NextResponse.json({ notifications, unreadCount, total, page, limit });
}

// PATCH /api/notifications - mark as read
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ message: "All notifications marked as read" });
  }

  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, userId: user.id },
      data: { read: true },
    });
    return NextResponse.json({ message: "Notification marked as read" });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
