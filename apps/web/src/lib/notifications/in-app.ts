import { prisma } from "@changd/database";
import type { NotificationType } from "@changd/shared";

export async function createNotification({
  userId,
  type,
  title,
  message,
  jobId,
  screenshotId,
  actionUrl,
  actionText,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: string;
  screenshotId?: string;
  actionUrl?: string;
  actionText?: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      jobId,
      screenshotId,
      actionUrl,
      actionText,
    },
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}
