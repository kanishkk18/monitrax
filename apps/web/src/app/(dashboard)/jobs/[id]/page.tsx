// import { auth } from "@/lib/auth";
// import { prisma } from "@changd/database";
// import { headers } from "next/headers";
// import { notFound, redirect } from "next/navigation";
// import { formatDistanceToNow, format } from "date-fns";
// import Link from "next/link";
// import { ChevronLeft, Edit, ExternalLink } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { ScreenshotHistory } from "@/components/screenshots/screenshot-history";
// import { JobLogsPanel } from "@/components/jobs/job-logs-panel";

// export default async function JobDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session?.user) redirect("/login");

//   const { id } = await params;

//   const job = await prisma.monitorJob.findFirst({
//     where: { id, userId: session.user.id },
//     include: {
//       screenshots: {
//         orderBy: { capturedAt: "desc" },
//         take: 20,
//       },
//       logs: {
//         orderBy: { createdAt: "desc" },
//         take: 50,
//       },
//       _count: { select: { screenshots: true } },
//     },
//   });

//   if (!job) notFound();

//   const changedCount = job.screenshots.filter((s) => s.hasChanged).length;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <Link
//             href="/jobs"
//             className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Back to monitors
//           </Link>
//           <h1 className="text-2xl font-bold">{job.name}</h1>
//           <div className="flex items-center gap-3 mt-1">
//             <a
//               href={job.url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
//             >
//               <ExternalLink className="w-3 h-3" />
//               {job.url}
//             </a>
//             <Badge variant={job.enabled ? "default" : "secondary"}>
//               {job.enabled ? "Active" : "Paused"}
//             </Badge>
//           </div>
//         </div>
//         <Link href={`/jobs/${id}/edit`}>
//           <Button variant="outline" size="sm">
//             <Edit className="w-4 h-4 mr-2" />
//             Edit
//           </Button>
//         </Link>
//       </div>

//       {/* Stats row */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[
//           { label: "Total runs", value: job._count.screenshots },
//           { label: "Changes detected", value: changedCount },
//           { label: "Failure count", value: job.failureCount },
//           {
//             label: "Next run",
//             value: job.nextRunAt
//               ? formatDistanceToNow(new Date(job.nextRunAt), { addSuffix: true })
//               : "Not scheduled",
//           },
//         ].map((stat) => (
//           <Card key={stat.label}>
//             <CardContent className="pt-4">
//               <div className="text-2xl font-bold">{stat.value}</div>
//               <div className="text-xs text-muted-foreground">{stat.label}</div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Screenshot history with diff viewer */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Screenshot History</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ScreenshotHistory screenshots={job.screenshots} />
//         </CardContent>
//       </Card>

//       {/* Logs */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Run Logs</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <JobLogsPanel logs={job.logs} />
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { auth } from "@/lib/auth";
import { prisma } from "@changd/database";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { ChevronLeft, Edit, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScreenshotHistory } from "@/components/screenshots/screenshot-history";
import { JobLogsPanel } from "@/components/jobs/job-logs-panel";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const job = await prisma.monitorJob.findFirst({
    where: { id, userId: session.user.id },
    include: {
      screenshots: {
        orderBy: { capturedAt: "desc" },
        take: 20,
        select: {
          id: true,
          imageUrl: true,
          diffUrl: true,
          diffPercentage: true,
          hasChanged: true,
          textChanged: true,
          textDiff: true,
          capturedAt: true,
          pageTitle: true,
          error: true,
        },
      },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { screenshots: true } },
    },
  });

  if (!job) notFound();

  const changedCount = job.screenshots.filter((s) => s.hasChanged).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to monitors
          </Link>
          <h1 className="text-2xl font-bold">{job.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              {job.url}
            </a>
            <Badge variant={job.enabled ? "default" : "secondary"}>
              {job.enabled ? "Active" : "Paused"}
            </Badge>
          </div>
        </div>
        <Link href={`/jobs/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total runs", value: job._count.screenshots },
          { label: "Changes detected", value: changedCount },
          { label: "Failure count", value: job.failureCount },
          {
            label: "Next run",
            value: job.nextRunAt
              ? formatDistanceToNow(new Date(job.nextRunAt), { addSuffix: true })
              : "Not scheduled",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Screenshot history with diff viewer */}
      <Card>
        <CardHeader>
          <CardTitle>Screenshot History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScreenshotHistory screenshots={job.screenshots} />
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Run Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <JobLogsPanel logs={job.logs} />
        </CardContent>
      </Card>
    </div>
  );
}
