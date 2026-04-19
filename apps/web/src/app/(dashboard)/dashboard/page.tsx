import { auth } from "@/lib/auth";
import { prisma } from "@changd/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentChanges } from "@/components/dashboard/recent-changes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [totalJobs, activeJobs, totalScreenshots, recentChanges, recentLogs] =
    await Promise.all([
      prisma.monitorJob.count({ where: { userId } }),
      prisma.monitorJob.count({ where: { userId, enabled: true } }),
      prisma.screenshot.count({
        where: { job: { userId } },
      }),
      prisma.screenshot.findMany({
        where: { job: { userId }, hasChanged: true },
        orderBy: { capturedAt: "desc" },
        take: 5,
        include: { job: { select: { id: true, name: true, url: true } } },
      }),
      prisma.jobLog.findMany({
        where: { job: { userId }, level: "error" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { job: { select: { id: true, name: true } } },
      }),
    ]);

  const stats = { totalJobs, activeJobs, totalScreenshots };

  return (
    <div className="space-y-5 pt-5">
{/* <div className="flex items-center justify-between bg-red-500">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 " />
            New Monitor
          </Button>
        </Link>
      </div> */}
      <DashboardStats stats={stats} />
      <RecentChanges changes={recentChanges} errors={recentLogs} />
    </div>
  );
}
