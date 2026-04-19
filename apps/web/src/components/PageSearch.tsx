// "use client";

// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { useCallback, useTransition } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { RefreshCcw, Search, X, ChevronDown, Check } from "lucide-react";
// import { cn } from "@/lib/utils";

// const STATUS_FILTERS = [
//   { label: "All", value: "" },
//   { label: "Active", value: "active" },
//   { label: "Paused", value: "paused" },
//   { label: "Changed", value: "changed" },
//   { label: "Error", value: "error" },
// ];

// const JOB_TYPE_FILTERS = [
//   { label: "All types", value: "all" },
//   { label: "Visual", value: "visual" },
//   { label: "Text", value: "text" },
//   { label: "XPath", value: "xpath" },
//   { label: "JSON API", value: "json_api" },
// ];

// const CHANGED_FILTERS = [
//   { label: "All", value: "" },
//   { label: "Changed only", value: "yes" },
//   { label: "No change", value: "no" },
// ];

// const HISTORY_TYPE_FILTERS = [
//   { label: "All types", value: "all" },
//   { label: "Visual", value: "visual" },
//   { label: "Text", value: "text" },
//   { label: "XPath", value: "xpath" },
//   { label: "JSON API", value: "json_api" },
// ];

// const NOTIF_TYPE_FILTERS = [
//   { label: "All", value: "" },
//   { label: "Changes", value: "change_detected" },
//   { label: "Failures", value: "job_failed" },
//   { label: "System", value: "system" },
// ];

// const READ_FILTERS = [
//   { label: "All", value: "" },
//   { label: "Unread", value: "unread" },
//   { label: "Read", value: "read" },
// ];

// export function PageSearch() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();

//   // Hide everything on /dashboard
//   if (pathname === "/dashboard" || pathname?.startsWith("/dashboard/")) {
//     return null;
//   }

//   if (pathname === "/jobs/new" || pathname?.startsWith("/jobs/new/")) {
//     return null;
//   }


//   const q = searchParams.get("q") || "";

//   const updateParams = useCallback(
//     (updates: Record<string, string>) => {
//       const params = new URLSearchParams(searchParams.toString());
//       Object.entries(updates).forEach(([key, value]) => {
//         if (value) params.set(key, value);
//         else params.delete(key);
//       });
//       startTransition(() => {
//         router.push(`${pathname}?${params.toString()}`);
//       });
//     },
//     [searchParams, pathname, router]
//   );

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value;
//     clearTimeout((window as any)._pageSearchTimer);
//     (window as any)._pageSearchTimer = setTimeout(() => {
//       updateParams({ q: val });
//     }, 350);
//   };

//   const clearAll = () => {
//     router.push(pathname);
//   };

//   /* ─────────────── /jobs ─────────────── */
//   if (pathname === "/jobs" || pathname?.startsWith("/jobs")) {
//     const status = searchParams.get("status") || "";
//     const type = searchParams.get("type") || "all";
//     const currentStatusLabel =
//       STATUS_FILTERS.find((f) => f.value === status)?.label || "All";
//     const currentTypeLabel =
//       JOB_TYPE_FILTERS.find((f) => f.value === type)?.label || "All types";
//     const hasFilters = q || status || (type && type !== "all");

//     return (
//       <div className="space-y-3">
//         <div className="border-b border-border py-1 px-3 flex justify-between items-center">
//           <div className="relative ">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-white" />
//             <Input
//               className="pl-9 pr-9 !bg-transparent hover:!bg-[#222] border-none dark:text-white"
//               placeholder="Search by name, URL or description..."
//               defaultValue={q}
//               onChange={handleSearchChange}
//             />
//             {q && (
//               <button
//                 onClick={() => updateParams({ q: "" })}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             )}
//           </div>

//           <div className="flex items-center gap-3 flex-wrap">
//             <div className="flex items-center gap-2 flex-wrap">
//               {/* Status */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button
//                     className={cn(
//                       "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
//                       status
//                         ? "bg-primary text-primary-foreground border-primary"
//                         : "hover:bg-muted border-input text-muted-foreground"
//                     )}
//                   >
//                     Status: {currentStatusLabel}
//                     <ChevronDown className="w-3 h-3 opacity-70" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="start" className="min-w-[140px]">
//                   {STATUS_FILTERS.map((f) => (
//                     <DropdownMenuItem
//                       key={f.value}
//                       onClick={() => updateParams({ status: f.value })}
//                       className="text-xs cursor-pointer flex items-center justify-between"
//                     >
//                       {f.label}
//                       {status === f.value && <Check className="w-3 h-3" />}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* Type */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button
//                     className={cn(
//                       "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
//                       type && type !== "all"
//                         ? "bg-primary text-primary-foreground border-primary"
//                         : "hover:bg-muted border-input text-muted-foreground"
//                     )}
//                   >
//                     Type: {currentTypeLabel}
//                     <ChevronDown className="w-3 h-3 opacity-70" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="start" className="min-w-[140px]">
//                   {JOB_TYPE_FILTERS.map((f) => (
//                     <DropdownMenuItem
//                       key={f.value}
//                       onClick={() => updateParams({ type: f.value })}
//                       className="text-xs cursor-pointer flex items-center justify-between"
//                     >
//                       {f.label}
//                       {(type || "all") === f.value && <Check className="w-3 h-3" />}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {hasFilters && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="text-xs h-7"
//                   onClick={clearAll}
//                 >
//                   <X className="w-3 h-3 mr-1" />
//                   Clear filters
//                 </Button>
//               )}
//             </div>

//             <div>
//               <Button onClick={() => router.refresh()} variant="outline">
//                 <RefreshCcw className="w-4 h-4" />
//                 <p className="text-xs">Refresh</p>
//               </Button>
//             </div>
//           </div>
//         </div>

//         {isPending && (
//           <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>
//         )}
//       </div>
//     );
//   }

//   /* ─────────────── /history ─────────────── */
//   if (pathname === "/history" || pathname?.startsWith("/history")) {
//     const changed = searchParams.get("changed") || "";
//     const type = searchParams.get("type") || "all";
//     const currentChangedLabel =
//       CHANGED_FILTERS.find((f) => f.value === changed)?.label || "All";
//     const currentTypeLabel =
//       HISTORY_TYPE_FILTERS.find((f) => f.value === type)?.label || "All types";
//     const hasFilters = q || changed || (type && type !== "all");

//     return (
//       <div className="space-y-3">
//         <div className="border-b border-border py-1 flex justify-between items-center">
//           <div className="relative ml-3">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-white" />
//             <Input
//               className="pl-9 pr-9 !bg-transparent hover:!bg-[#222] border-none dark:text-white"
//               placeholder="Search by monitor name or URL..."
//               defaultValue={q}
//               onChange={handleSearchChange}
//             />
//             {q && (
//               <button
//                 onClick={() => updateParams({ q: "" })}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             )}
//           </div>

//           <div className="flex items-center gap-3 flex-wrap">
//             <div className="flex items-center gap-2 flex-wrap">
//               {/* Changed */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button
//                     className={cn(
//                       "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
//                       changed
//                         ? "bg-primary text-primary-foreground border-primary"
//                         : "hover:bg-muted border-input text-muted-foreground"
//                     )}
//                   >
//                     Changed: {currentChangedLabel}
//                     <ChevronDown className="w-3 h-3 opacity-70" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="start" className="min-w-[140px]">
//                   {CHANGED_FILTERS.map((f) => (
//                     <DropdownMenuItem
//                       key={f.value}
//                       onClick={() => updateParams({ changed: f.value })}
//                       className="text-xs cursor-pointer flex items-center justify-between"
//                     >
//                       {f.label}
//                       {changed === f.value && <Check className="w-3 h-3" />}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* Type */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button
//                     className={cn(
//                       "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
//                       type && type !== "all"
//                         ? "bg-primary text-primary-foreground border-primary"
//                         : "hover:bg-muted border-input text-muted-foreground"
//                     )}
//                   >
//                     Type: {currentTypeLabel}
//                     <ChevronDown className="w-3 h-3 opacity-70" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="start" className="min-w-[140px]">
//                   {HISTORY_TYPE_FILTERS.map((f) => (
//                     <DropdownMenuItem
//                       key={f.value}
//                       onClick={() => updateParams({ type: f.value })}
//                       className="text-xs cursor-pointer flex items-center justify-between"
//                     >
//                       {f.label}
//                       {(type || "all") === f.value && <Check className="w-3 h-3" />}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {hasFilters && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="text-xs h-7"
//                   onClick={clearAll}
//                 >
//                   <X className="w-3 h-3 mr-1" />
//                   Clear
//                 </Button>
//               )}
//             </div>

//             <div>
//               <Button onClick={() => router.refresh()} variant="outline">
//                 <RefreshCcw className="w-4 h-4" />
//                 <p className="text-xs">Refresh</p>
//               </Button>
//             </div>
//           </div>
//         </div>

//         {isPending && (
//           <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>
//         )}
//       </div>
//     );
//   }

//   /* ─────────────── /notifications ─────────────── */
//   if (pathname === "/notifications" || pathname?.startsWith("/notifications")) {
//     const type = searchParams.get("type") || "";
//     const read = searchParams.get("read") || "";
//     const currentTypeLabel =
//       NOTIF_TYPE_FILTERS.find((f) => f.value === type)?.label || "All";
//     const currentReadLabel =
//       READ_FILTERS.find((f) => f.value === read)?.label || "All";
//     const hasFilters = q || type || read;

//     return (
//       <div className="space-y-3">
//         <div className="border-b border-border py-1 flex justify-between items-center">
//           <div className="relative ml-3">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-white" />
//             <Input
//               className="pl-9 pr-9 !bg-transparent hover:!bg-[#222] border-none dark:text-white"
//               placeholder="Search notifications..."
//               defaultValue={q}
//               onChange={handleSearchChange}
//             />
//             {q && (
//               <button
//                 onClick={() => updateParams({ q: "" })}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             )}
//           </div>

//           <div className="flex items-center gap-3 flex-wrap">
//             <div className="flex items-center gap-2 flex-wrap">
//               {/* Type */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button
//                     className={cn(
//                       "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
//                       type
//                         ? "bg-primary text-primary-foreground border-primary"
//                         : "hover:bg-muted border-input text-muted-foreground"
//                     )}
//                   >
//                     Type: {currentTypeLabel}
//                     <ChevronDown className="w-3 h-3 opacity-70" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="start" className="min-w-[140px]">
//                   {NOTIF_TYPE_FILTERS.map((f) => (
//                     <DropdownMenuItem
//                       key={f.value}
//                       onClick={() => updateParams({ type: f.value })}
//                       className="text-xs cursor-pointer flex items-center justify-between"
//                     >
//                       {f.label}
//                       {type === f.value && <Check className="w-3 h-3" />}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* Read */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button
//                     className={cn(
//                       "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
//                       read
//                         ? "bg-primary text-primary-foreground border-primary"
//                         : "hover:bg-muted border-input text-muted-foreground"
//                     )}
//                   >
//                     Read: {currentReadLabel}
//                     <ChevronDown className="w-3 h-3 opacity-70" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="start" className="min-w-[140px]">
//                   {READ_FILTERS.map((f) => (
//                     <DropdownMenuItem
//                       key={f.value}
//                       onClick={() => updateParams({ read: f.value })}
//                       className="text-xs cursor-pointer flex items-center justify-between"
//                     >
//                       {f.label}
//                       {read === f.value && <Check className="w-3 h-3" />}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {hasFilters && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="text-xs h-7"
//                   onClick={clearAll}
//                 >
//                   <X className="w-3 h-3 mr-1" />
//                   Clear
//                 </Button>
//               )}
//             </div>

//             <div>
//               <Button onClick={() => router.refresh()} variant="outline">
//                 <RefreshCcw className="w-4 h-4" />
//                 <p className="text-xs">Refresh</p>
//               </Button>
//             </div>
//           </div>
//         </div>

//         {isPending && (
//           <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>
//         )}
//       </div>
//     );
//   }

//   return null;
// }

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCcw, Search, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Changed", value: "changed" },
  { label: "Error", value: "error" },
];

const JOB_TYPE_FILTERS = [
  { label: "All types", value: "all" },
  { label: "Visual", value: "visual" },
  { label: "Text", value: "text" },
  { label: "XPath", value: "xpath" },
  { label: "JSON API", value: "json_api" },
];

const CHANGED_FILTERS = [
  { label: "All", value: "" },
  { label: "Changed only", value: "yes" },
  { label: "No change", value: "no" },
];

const HISTORY_TYPE_FILTERS = [
  { label: "All types", value: "all" },
  { label: "Visual", value: "visual" },
  { label: "Text", value: "text" },
  { label: "XPath", value: "xpath" },
  { label: "JSON API", value: "json_api" },
];

const NOTIF_TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Changes", value: "change_detected" },
  { label: "Failures", value: "job_failed" },
  { label: "System", value: "system" },
];

const READ_FILTERS = [
  { label: "All", value: "" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

interface PageSearchProps {
  onRefresh?: () => void;
}

export function PageSearch({ onRefresh }: PageSearchProps = {}) {
  // ALL hooks must be called before any conditional logic
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, pathname, router]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      clearTimeout((window as any)._pageSearchTimer);
      (window as any)._pageSearchTimer = setTimeout(() => {
        updateParams({ q: val });
      }, 350);
    },
    [updateParams]
  );

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  }, [onRefresh, router]);

  // NOW safe to do conditional returns
  if (!pathname) return null;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return null;
  }

  const q = searchParams.get("q") || "";

  /* ─────────────── /jobs ─────────────── */
  if (pathname === "/jobs" || pathname.startsWith("/jobs/")) {
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "all";
    const currentStatusLabel =
      STATUS_FILTERS.find((f) => f.value === status)?.label || "All";
    const currentTypeLabel =
      JOB_TYPE_FILTERS.find((f) => f.value === type)?.label || "All types";
    const hasFilters = q || status || (type && type !== "all");

    return (
      <div className="space-y-3">
        <div className="border-b border-border py-1 flex justify-between items-center">
          <div className="relative ml-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-white" />
            <Input
              className="pl-9 pr-9 !bg-transparent hover:!bg-[#222] border-none dark:text-white"
              placeholder="Search by name, URL or description..."
              defaultValue={q}
              onChange={handleSearchChange}
            />
            {q && (
              <button
                onClick={() => updateParams({ q: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                      status
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-input text-muted-foreground"
                    )}
                  >
                    Status: {currentStatusLabel}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  {STATUS_FILTERS.map((f) => (
                    <DropdownMenuItem
                      key={f.value}
                      onClick={() => updateParams({ status: f.value })}
                      className="text-xs cursor-pointer flex items-center justify-between"
                    >
                      {f.label}
                      {status === f.value && <Check className="w-3 h-3" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                      type && type !== "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-input text-muted-foreground"
                    )}
                  >
                    Type: {currentTypeLabel}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  {JOB_TYPE_FILTERS.map((f) => (
                    <DropdownMenuItem
                      key={f.value}
                      onClick={() => updateParams({ type: f.value })}
                      className="text-xs cursor-pointer flex items-center justify-between"
                    >
                      {f.label}
                      {(type || "all") === f.value && <Check className="w-3 h-3" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={clearAll}
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>

            <div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCcw className="w-4 h-4" />
                <p className="text-xs">Refresh</p>
              </Button>
            </div>
          </div>
        </div>

        {isPending && (
          <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>
        )}
      </div>
    );
  }

  /* ─────────────── /history ─────────────── */
  if (pathname === "/history" || pathname.startsWith("/history/")) {
    const changed = searchParams.get("changed") || "";
    const type = searchParams.get("type") || "all";
    const currentChangedLabel =
      CHANGED_FILTERS.find((f) => f.value === changed)?.label || "All";
    const currentTypeLabel =
      HISTORY_TYPE_FILTERS.find((f) => f.value === type)?.label || "All types";
    const hasFilters = q || changed || (type && type !== "all");

    return (
      <div className="space-y-3">
        <div className="border-b border-border py-1 flex justify-between items-center">
          <div className="relative ml-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-white" />
            <Input
              className="pl-9 pr-9 !bg-transparent hover:!bg-[#222] border-none dark:text-white"
              placeholder="Search by monitor name or URL..."
              defaultValue={q}
              onChange={handleSearchChange}
            />
            {q && (
              <button
                onClick={() => updateParams({ q: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                      changed
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-input text-muted-foreground"
                    )}
                  >
                    Changed: {currentChangedLabel}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  {CHANGED_FILTERS.map((f) => (
                    <DropdownMenuItem
                      key={f.value}
                      onClick={() => updateParams({ changed: f.value })}
                      className="text-xs cursor-pointer flex items-center justify-between"
                    >
                      {f.label}
                      {changed === f.value && <Check className="w-3 h-3" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                      type && type !== "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-input text-muted-foreground"
                    )}
                  >
                    Type: {currentTypeLabel}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  {HISTORY_TYPE_FILTERS.map((f) => (
                    <DropdownMenuItem
                      key={f.value}
                      onClick={() => updateParams({ type: f.value })}
                      className="text-xs cursor-pointer flex items-center justify-between"
                    >
                      {f.label}
                      {(type || "all") === f.value && <Check className="w-3 h-3" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={clearAll}
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCcw className="w-4 h-4" />
                <p className="text-xs">Refresh</p>
              </Button>
            </div>
          </div>
        </div>

        {isPending && (
          <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>
        )}
      </div>
    );
  }

  /* ─────────────── /notifications ─────────────── */
  if (pathname === "/notifications" || pathname.startsWith("/notifications/")) {
    const type = searchParams.get("type") || "";
    const read = searchParams.get("read") || "";
    const currentTypeLabel =
      NOTIF_TYPE_FILTERS.find((f) => f.value === type)?.label || "All";
    const currentReadLabel =
      READ_FILTERS.find((f) => f.value === read)?.label || "All";
    const hasFilters = q || type || read;

    return (
      <div className="space-y-3">
        <div className="border-b border-border py-1 flex justify-between items-center">
          <div className="relative ml-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-white" />
            <Input
              className="pl-9 pr-9 !bg-transparent hover:!bg-[#222] border-none dark:text-white"
              placeholder="Search notifications..."
              defaultValue={q}
              onChange={handleSearchChange}
            />
            {q && (
              <button
                onClick={() => updateParams({ q: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                      type
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-input text-muted-foreground"
                    )}
                  >
                    Type: {currentTypeLabel}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  {NOTIF_TYPE_FILTERS.map((f) => (
                    <DropdownMenuItem
                      key={f.value}
                      onClick={() => updateParams({ type: f.value })}
                      className="text-xs cursor-pointer flex items-center justify-between"
                    >
                      {f.label}
                      {type === f.value && <Check className="w-3 h-3" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                      read
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted border-input text-muted-foreground"
                    )}
                  >
                    Read: {currentReadLabel}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  {READ_FILTERS.map((f) => (
                    <DropdownMenuItem
                      key={f.value}
                      onClick={() => updateParams({ read: f.value })}
                      className="text-xs cursor-pointer flex items-center justify-between"
                    >
                      {f.label}
                      {read === f.value && <Check className="w-3 h-3" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={clearAll}
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCcw className="w-4 h-4" />
                <p className="text-xs">Refresh</p>
              </Button>
            </div>
          </div>
        </div>

        {isPending && (
          <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>
        )}
      </div>
    );
  }

  return null;
}