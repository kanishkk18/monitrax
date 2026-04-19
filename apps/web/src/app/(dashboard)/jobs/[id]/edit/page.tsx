// import { auth } from "@/lib/auth";
// import { prisma } from "@changd/database";
// import { headers } from "next/headers";
// import { notFound, redirect } from "next/navigation";
// import { JobForm } from "@/components/jobs/job-form";
// import { ChevronLeft } from "lucide-react";
// import Link from "next/link";

// export default async function EditJobPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session?.user) redirect("/login");

//   const { id } = await params;

//   const job = await prisma.monitorJob.findFirst({
//     where: { id, userId: session.user.id },
//   });

//   if (!job) notFound();

//   return (
//     <div className="space-y-6">
//       <div>
//         <Link
//           href={`/jobs/${id}`}
//           className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Back to monitor
//         </Link>
//         <h1 className="text-2xl font-bold">Edit Monitor</h1>
//         <p className="text-muted-foreground text-sm mt-1">{job.name}</p>
//       </div>
//       <JobForm
//         jobId={id}
//         defaultValues={{
//           name: job.name,
//           url: job.url,
//           description: job.description ?? undefined,
//           monitorType: job.monitorType as "visual" | "xpath" | "json_api",
//           xpathSelector: job.xpathSelector ?? undefined,
//           jsonPath: job.jsonPath ?? undefined,
//           httpHeaders: job.httpHeaders ?? undefined,
//           viewportWidth: job.viewportWidth,
//           viewportHeight: job.viewportHeight,
//           fullPage: job.fullPage,
//           threshold: job.threshold,
//           cronExpression: job.cronExpression,
//           notifyEmails: job.notifyEmails,
//           enabled: job.enabled,
//         }}
//       />
//     </div>
//   );
// }

import { auth } from "@/lib/auth";
import { prisma } from "@changd/database";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { JobForm } from "@/components/jobs/job-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const job = await prisma.monitorJob.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!job) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/jobs/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to monitor
        </Link>
        <h1 className="text-2xl font-bold">Edit Monitor</h1>
        <p className="text-muted-foreground text-sm mt-1">{job.name}</p>
      </div>
      <JobForm
        jobId={id}
        defaultValues={{
          name: job.name,
          url: job.url,
          description: job.description ?? undefined,
          monitorType: job.monitorType as "visual" | "text" | "xpath" | "json_api",
          captureScreenshot: (job as any).captureScreenshot ?? true,
          imageFormat: ((job as any).imageFormat || "webp") as "webp" | "avif" | "png",
          xpathSelector: job.xpathSelector ?? undefined,
          jsonPath: job.jsonPath ?? undefined,
          httpHeaders: job.httpHeaders ?? undefined,
          viewportWidth: job.viewportWidth,
          viewportHeight: job.viewportHeight,
          fullPage: job.fullPage,
          threshold: job.threshold,
          cronExpression: job.cronExpression,
          notifyEmails: job.notifyEmails,
          enabled: job.enabled,
        }}
      />
    </div>
  );
}
