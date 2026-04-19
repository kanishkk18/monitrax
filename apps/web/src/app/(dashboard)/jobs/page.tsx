// import { auth } from "@/lib/auth";
// import { prisma } from "@changd/database";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { JobList } from "@/components/jobs/job-list";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Plus, RefreshCcw } from "lucide-react";
// import { Input } from "@/components/ui/input";

// export default async function JobsPage() {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session?.user) redirect("/login");

//   const jobs = await prisma.monitorJob.findMany({
//     where: { userId: session.user.id },
//     orderBy: { createdAt: "desc" },
//     include: {
//       screenshots: {
//         orderBy: { capturedAt: "desc" },
//         take: 1,
//         select: {
//           id: true,
//           imageUrl: true,
//           hasChanged: true,
//           diffPercentage: true,
//           capturedAt: true,
//           error: true,
//         },
//       },
//       _count: { select: { screenshots: true } },
//     },
//   });

//   return (
//     <div className="space-y-6">
//       <div className="border-b border-border py-1 flex justify-between items-center ">
//         <Input className="w-full md:w-52 !bg-transparent focus-visible:ring-0 focus-visible:border-none focus:border-none " placeholder="Search..." />
//         <div className="">
//           <Button variant="outline" className="">
//             <RefreshCcw className="w-4 h-4 " />
//             <p className="text-xs"> Refresh </p>
//           </Button>
//         </div>
//       </div>
//       <JobList jobs={jobs} />
//     </div>
//   );
// }

import { auth } from "@/lib/auth";
import { prisma } from "@changd/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { JobList } from "@/components/jobs/job-list";
import { JobSearch } from "@/components/jobs/job-search";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { q, status, type } = await searchParams;

  const jobs = await prisma.monitorJob.findMany({
    where: {
      userId: session.user.id,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { url: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(status === "active" && { enabled: true }),
      ...(status === "paused" && { enabled: false }),
      ...(status === "changed" && { lastStatus: "changed" }),
      ...(status === "error" && { lastStatus: "error" }),
      ...(type && type !== "all" && { monitorType: type }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      screenshots: {
        orderBy: { capturedAt: "desc" },
        take: 1,
        select: {
          id: true,
          imageUrl: true,
          hasChanged: true,
          diffPercentage: true,
          capturedAt: true,
          error: true,
        },
      },
      _count: { select: { screenshots: true } },
    },
  });

  return (
    <div className="space-y-6">
     {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitor Jobs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {jobs.length} monitor{jobs.length !== 1 ? "s" : ""}
            {q && ` matching "${q}"`}
          </p>
        </div>
        
      </div>  */}
      <JobList jobs={jobs} />
    </div>
  );
}
