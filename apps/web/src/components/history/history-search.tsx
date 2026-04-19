// "use client";

// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { useCallback, useTransition } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Search, X } from "lucide-react";
// import { cn } from "@/lib/utils";

// const CHANGED_FILTERS = [
//   { label: "All", value: "" },
//   { label: "Changed only", value: "yes" },
//   { label: "No change", value: "no" },
// ];

// const TYPE_FILTERS = [
//   { label: "All types", value: "all" },
//   { label: "Visual", value: "visual" },
//   { label: "Text", value: "text" },
//   { label: "XPath", value: "xpath" },
//   { label: "JSON API", value: "json_api" },
// ];

// export function HistorySearch() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();

//   const q = searchParams.get("q") || "";
//   const changed = searchParams.get("changed") || "";
//   const type = searchParams.get("type") || "all";

//   const updateParams = useCallback(
//     (updates: Record<string, string>) => {
//       const params = new URLSearchParams(searchParams.toString());
//       Object.entries(updates).forEach(([key, value]) => {
//         if (value) params.set(key, value);
//         else params.delete(key);
//       });
//       startTransition(() => router.push(`${pathname}?${params.toString()}`));
//     },
//     [searchParams, pathname, router]
//   );

//   const hasFilters = q || changed || (type && type !== "all");

//   return (
//     <div className="space-y-3">
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//         <Input
//           className="pl-9 pr-9"
//           placeholder="Search by monitor name or URL..."
//           defaultValue={q}
//           onChange={(e) => {
//             const val = e.target.value;
//             clearTimeout((window as any)._historySearchTimer);
//             (window as any)._historySearchTimer = setTimeout(() => {
//               updateParams({ q: val });
//             }, 350);
//           }}
//         />
//         {q && (
//           <button
//             onClick={() => updateParams({ q: "" })}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         )}
//       </div>

//       <div className="flex items-center gap-4 flex-wrap">
//         <div className="flex items-center gap-1">
//           {CHANGED_FILTERS.map((f) => (
//             <button
//               key={f.value}
//               onClick={() => updateParams({ changed: f.value })}
//               className={cn(
//                 "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
//                 changed === f.value
//                   ? "bg-primary text-primary-foreground border-primary"
//                   : "hover:bg-muted border-input text-muted-foreground"
//               )}
//             >
//               {f.label}
//             </button>
//           ))}
//         </div>

//         <div className="w-px h-4 bg-border" />

//         <div className="flex items-center gap-1">
//           {TYPE_FILTERS.map((f) => (
//             <button
//               key={f.value}
//               onClick={() => updateParams({ type: f.value })}
//               className={cn(
//                 "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
//                 type === f.value
//                   ? "bg-primary text-primary-foreground border-primary"
//                   : "hover:bg-muted border-input text-muted-foreground"
//               )}
//             >
//               {f.label}
//             </button>
//           ))}
//         </div>

//         {hasFilters && (
//           <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => router.push(pathname)}>
//             <X className="w-3 h-3 mr-1" />
//             Clear
//           </Button>
//         )}
//       </div>

//       {isPending && <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>}
//     </div>
//   );
// }