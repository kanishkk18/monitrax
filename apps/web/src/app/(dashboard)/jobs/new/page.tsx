// import { JobForm } from "@/components/jobs/job-form";
// import { ChevronLeft } from "lucide-react";
// import Link from "next/link";

// export default function NewJobPage() {
//   return (
//     <div className="space-y-6">
//       <div>
//         <Link
//           href="/jobs"
//           className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Back to monitors
//         </Link>
//         <h1 className="text-2xl font-bold">New Monitor</h1>
//         <p className="text-muted-foreground text-sm mt-1">
//           Set up a new website change monitor
//         </p>
//       </div>
//       <JobForm />
//     </div>
//   );
// }

import { JobForm } from "@/components/jobs/job-form";
import { ChevronLeft, Monitor } from "lucide-react";
import Link from "next/link";

export default function NewJobPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to monitors
        </Link>
        
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Monitor className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">New Monitor</h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
              Set up automated change detection for any website, API, or web page. 
              Choose the monitoring type that fits your use case.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <JobForm />
    </div>
  );
}