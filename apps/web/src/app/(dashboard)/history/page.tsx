// import { auth } from "@/lib/auth";
// import { prisma } from "@changd/database";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { format } from "date-fns";
// import Link from "next/link";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";

// export default async function HistoryPage() {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session?.user) redirect("/login");

//   const screenshots = await prisma.screenshot.findMany({
//     where: { job: { userId: session.user.id } },
//     orderBy: { capturedAt: "desc" },
//     take: 50,
//     include: {
//       job: { select: { id: true, name: true, url: true } },
//     },
//   });

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">History</h1>
//         <p className="text-muted-foreground text-sm mt-1">
//           All screenshots across all monitors
//         </p>
//       </div>

//       {screenshots.length === 0 ? (
//         <div className="text-center py-16 border rounded-xl bg-muted/30">
//           <p className="text-muted-foreground">No screenshots yet.</p>
//           <Link href="/jobs/new" className="text-primary text-sm hover:underline mt-2 block">
//             Create a monitor to get started
//           </Link>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {screenshots.map((s) => (
//             <Card key={s.id}>
//               <CardContent className="p-4">
//                 <div className="flex items-center gap-4">
//                   {/* Thumbnail */}
//                   <div className="w-20 h-12 rounded border overflow-hidden bg-muted shrink-0">
//                     {s.imageUrl && (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={s.imageUrl}
//                         alt=""
//                         className="w-full h-full object-cover object-top"
//                       />
//                     )}
//                   </div>

//                   {/* Info */}
//                   <div className="flex-1 min-w-0">
//                     <Link
//                       href={`/jobs/${s.job.id}`}
//                       className="font-medium hover:underline"
//                     >
//                       {s.job.name}
//                     </Link>
//                     <p className="text-xs text-muted-foreground truncate">{s.job.url}</p>
//                     <p className="text-xs text-muted-foreground">
//                       {format(new Date(s.capturedAt), "PPp")}
//                     </p>
//                   </div>

//                   {/* Status */}
//                   <div className="shrink-0">
//                     {s.hasChanged ? (
//                       <Badge variant="destructive">
//                         {s.diffPercentage?.toFixed(2)}% changed
//                       </Badge>
//                     ) : s.error ? (
//                       <Badge variant="outline" className="text-destructive border-destructive/40">
//                         Error
//                       </Badge>
//                     ) : (
//                       <Badge variant="outline" className="text-green-600 border-green-200">
//                         No change
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// import { auth } from "@/lib/auth";
// import { prisma } from "@changd/database";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { format } from "date-fns";
// import Link from "next/link";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { FileText, Image } from "lucide-react";

// export default async function HistoryPage() {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session?.user) redirect("/login");

//   const screenshots = await prisma.screenshot.findMany({
//     where: { job: { userId: session.user.id } },
//     orderBy: { capturedAt: "desc" },
//     take: 50,
//     include: {
//       job: { select: { id: true, name: true, url: true, monitorType: true } },
//     },
//   });

//   return (
//     <div className="space-y-6">
    
//       {screenshots.length === 0 ? (
//         <div className="text-center py-16 border rounded-xl bg-muted/30">
//           <p className="text-muted-foreground">No snapshots yet.</p>
//           <Link href="/jobs/new" className="text-primary text-sm hover:underline mt-2 block">
//             Create a monitor to get started
//           </Link>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {screenshots.map((s) => (
//             <Card key={s.id}>
//               <CardContent className="p-4">
//                 <div className="flex items-center gap-4">
//                   <div className="w-20 h-12 rounded border overflow-hidden bg-muted shrink-0 flex items-center justify-center">
//                     {s.imageUrl ? (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img src={s.imageUrl} alt="" className="w-full h-full object-cover object-top" />
//                     ) : (
//                       <FileText className="w-5 h-5 text-muted-foreground" />
//                     )}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <Link href={`/jobs/${s.job.id}`} className="font-medium hover:underline">
//                         {s.job.name}
//                       </Link>
//                       <Badge variant="outline" className="text-xs capitalize">
//                         {s.job.monitorType.replace("_", " ")}
//                       </Badge>
//                     </div>
//                     <p className="text-xs text-muted-foreground truncate">{s.job.url}</p>
//                     <p className="text-xs text-muted-foreground">{format(new Date(s.capturedAt), "PPp")}</p>
//                   </div>

//                   <div className="shrink-0 flex flex-col items-end gap-1">
//                     {s.hasChanged || s.textChanged ? (
//                       <Badge variant="destructive">
//                         {s.diffPercentage != null && s.diffPercentage < 100
//                           ? `${s.diffPercentage.toFixed(2)}% changed`
//                           : "Text changed"}
//                       </Badge>
//                     ) : s.error ? (
//                       <Badge variant="outline" className="text-destructive border-destructive/40">Error</Badge>
//                     ) : (
//                       <Badge variant="outline" className="text-green-600 border-green-200">No change</Badge>
//                     )}
//                     <span className="text-[10px] text-muted-foreground flex items-center gap-1">
//                       {s.imageUrl ? "screenshot" : "text only"}
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


// import { auth } from "@/lib/auth";
// import { prisma } from "@changd/database";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { format } from "date-fns";
// import Link from "next/link";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { FileText } from "lucide-react";
// // import { HistorySearch } from "@/components/history/history-search";

// export default async function HistoryPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ q?: string; changed?: string; type?: string }>;
// }) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session?.user) redirect("/login");

//   const { q, changed, type } = await searchParams;

//   const screenshots = await prisma.screenshot.findMany({
//     where: {
//       job: {
//         userId: session.user.id,
//         ...(q && {
//           OR: [
//             { name: { contains: q, mode: "insensitive" } },
//             { url: { contains: q, mode: "insensitive" } },
//           ],
//         }),
//         ...(type && type !== "all" && { monitorType: type }),
//       },
//       ...(changed === "yes" && { OR: [{ hasChanged: true }, { textChanged: true }] }),
//       ...(changed === "no" && { hasChanged: false, textChanged: false }),
//     },
//     orderBy: { capturedAt: "desc" },
//     take: 100,
//     include: {
//       job: { select: { id: true, name: true, url: true, monitorType: true } },
//     },
//   });

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">History</h1>
//         <p className="text-muted-foreground text-sm mt-1">
//           {screenshots.length} snapshot{screenshots.length !== 1 ? "s" : ""}
//           {q && ` matching "${q}"`}
//         </p>
//       </div>

//       <HistorySearch />

//       {screenshots.length === 0 ? (
//         <div className="text-center py-16 border rounded-xl bg-muted/30">
//           <p className="text-muted-foreground">No snapshots found.</p>
//           {(q || changed || type) && (
//             <Link href="/history" className="text-primary text-sm hover:underline mt-2 block">
//               Clear filters
//             </Link>
//           )}
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {screenshots.map((s) => (
//             <Card key={s.id}>
//               <CardContent className="p-4">
//                 <div className="flex items-center gap-4">
//                   <div className="w-20 h-12 rounded border overflow-hidden bg-muted shrink-0 flex items-center justify-center">
//                     {s.imageUrl ? (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img src={s.imageUrl} alt="" className="w-full h-full object-cover object-top" />
//                     ) : (
//                       <FileText className="w-5 h-5 text-muted-foreground" />
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <Link href={`/jobs/${s.job.id}`} className="font-medium hover:underline">
//                         {s.job.name}
//                       </Link>
//                       <Badge variant="outline" className="text-xs capitalize">
//                         {s.job.monitorType.replace("_", " ")}
//                       </Badge>
//                     </div>
//                     <p className="text-xs text-muted-foreground truncate">{s.job.url}</p>
//                     <p className="text-xs text-muted-foreground">{format(new Date(s.capturedAt), "PPp")}</p>
//                   </div>
//                   <div className="shrink-0 flex flex-col items-end gap-1">
//                     {s.hasChanged || s.textChanged ? (
//                       <Badge variant="destructive">
//                         {s.diffPercentage != null && s.diffPercentage < 100
//                           ? `${s.diffPercentage.toFixed(2)}% changed`
//                           : "Text changed"}
//                       </Badge>
//                     ) : s.error ? (
//                       <Badge variant="outline" className="text-destructive border-destructive/40">Error</Badge>
//                     ) : (
//                       <Badge variant="outline" className="text-green-600 border-green-200">No change</Badge>
//                     )}
//                     <span className="text-[10px] text-muted-foreground">
//                       {s.imageUrl ? "screenshot" : "text only"}
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// app/history/page.tsx
import { HistoryContent } from "@/components/history/HistoryContent";
import { auth } from "@/lib/auth";
import { prisma } from "@changd/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; changed?: string; type?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { q, changed, type } = await searchParams;

  // Fetch just IDs for initial render, full data comes client-side
  const screenshots = await prisma.screenshot.findMany({
    where: {
      job: {
        userId: session.user.id,
        ...(q && {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { url: { contains: q, mode: "insensitive" } },
          ],
        }),
        ...(type && type !== "all" && { monitorType: type }),
      },
      ...(changed === "yes" && { OR: [{ hasChanged: true }, { textChanged: true }] }),
      ...(changed === "no" && { hasChanged: false, textChanged: false }),
    },
    orderBy: { capturedAt: "desc" },
    take: 100,
    select: {
      id: true,
      imageUrl: true,
      hasChanged: true,
      textChanged: true,
      diffPercentage: true,
      error: true,
      capturedAt: true,
      job: {
        select: {
          id: true,
          name: true,
          url: true,
          monitorType: true,
        },
      },
    },
  });

  return <HistoryContent initialScreenshots={screenshots} />;
}