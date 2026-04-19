// "use client";

// import { useEffect, useState } from "react";
// import { formatDistanceToNow } from "date-fns";
// import { toast } from "sonner";
// import Link from "next/link";
// import { Bell, CheckCheck, ArrowRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";

// interface Notification {
//   id: string;
//   type: string;
//   title: string;
//   message: string;
//   read: boolean;
//   actionUrl: string | null;
//   actionText: string | null;
//   createdAt: string;
// }

// export default function NotificationsPage() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const fetchNotifications = async () => {
//     const res = await fetch("/api/notifications?limit=50");
//     const data = await res.json();
//     setNotifications(data.notifications || []);
//     setUnreadCount(data.unreadCount || 0);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const markAllRead = async () => {
//     await fetch("/api/notifications", {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ markAllRead: true }),
//     });
//     setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//     setUnreadCount(0);
//     toast.success("All notifications marked as read");
//   };

//   const markRead = async (id: string) => {
//     await fetch("/api/notifications", {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id }),
//     });
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//     );
//     setUnreadCount((c) => Math.max(0, c - 1));
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Notifications</h1>
//           <p className="text-muted-foreground text-sm mt-1">
//             {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
//           </p>
//         </div>
//         {unreadCount > 0 && (
//           <Button variant="outline" size="sm" onClick={markAllRead}>
//             <CheckCheck className="w-4 h-4 mr-2" />
//             Mark all read
//           </Button>
//         )}
//       </div>

//       {loading ? (
//         <div className="text-center py-16 text-muted-foreground text-sm">
//           Loading notifications…
//         </div>
//       ) : notifications.length === 0 ? (
//         <div className="text-center py-16 border rounded-xl bg-muted/30">
//           <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
//           <p className="text-muted-foreground">No notifications yet</p>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {notifications.map((n) => (
//             <Card
//               key={n.id}
//               className={cn(!n.read && "border-primary/30 bg-primary/5")}
//             >
//               <CardContent className="p-4">
//                 <div className="flex items-start gap-3">
//                   {/* Unread indicator */}
//                   {!n.read && (
//                     <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
//                   )}

//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-2">
//                       <div>
//                         <p className={cn("text-sm font-medium", !n.read && "font-semibold")}>
//                           {n.title}
//                         </p>
//                         <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
//                       </div>
//                       <span className="text-xs text-muted-foreground shrink-0">
//                         {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-3 mt-2">
//                       {n.actionUrl && n.actionText && (
//                         <Link
//                           href={n.actionUrl}
//                           onClick={() => !n.read && markRead(n.id)}
//                           className="text-xs text-primary hover:underline flex items-center gap-1"
//                         >
//                           {n.actionText}
//                           <ArrowRight className="w-3 h-3" />
//                         </Link>
//                       )}
//                       {!n.read && (
//                         <button
//                           onClick={() => markRead(n.id)}
//                           className="text-xs text-muted-foreground hover:text-foreground"
//                         >
//                           Mark read
//                         </button>
//                       )}
//                     </div>
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

// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { formatDistanceToNow } from "date-fns";
// import { toast } from "sonner";
// import Link from "next/link";
// import { Bell, CheckCheck, ArrowRight, Search, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";

// interface Notification {
//   id: string;
//   type: string;
//   title: string;
//   message: string;
//   read: boolean;
//   actionUrl: string | null;
//   actionText: string | null;
//   createdAt: string;
// }

// const TYPE_FILTERS = [
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

// export default function NotificationsPage() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("");
//   const [readFilter, setReadFilter] = useState("");

//   const fetchNotifications = useCallback(async () => {
//     const params = new URLSearchParams({ limit: "100" });
//     if (readFilter === "unread") params.set("unread", "true");
//     const res = await fetch(`/api/notifications?${params}`);
//     const data = await res.json();
//     setNotifications(data.notifications || []);
//     setUnreadCount(data.unreadCount || 0);
//     setLoading(false);
//   }, [readFilter]);

//   useEffect(() => {
//     fetchNotifications();
//   }, [fetchNotifications]);

//   const markAllRead = async () => {
//     await fetch("/api/notifications", {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ markAllRead: true }),
//     });
//     setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//     setUnreadCount(0);
//     toast.success("All notifications marked as read");
//   };

//   const markRead = async (id: string) => {
//     await fetch("/api/notifications", {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id }),
//     });
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//     );
//     setUnreadCount((c) => Math.max(0, c - 1));
//   };

//   // Client-side filtering
//   const filtered = notifications.filter((n) => {
//     const matchesSearch =
//       !search ||
//       n.title.toLowerCase().includes(search.toLowerCase()) ||
//       n.message.toLowerCase().includes(search.toLowerCase());
//     const matchesType = !typeFilter || n.type === typeFilter;
//     const matchesRead =
//       !readFilter ||
//       (readFilter === "unread" && !n.read) ||
//       (readFilter === "read" && n.read);
//     return matchesSearch && matchesType && matchesRead;
//   });

//   const hasFilters = search || typeFilter || readFilter;

//   return (
//     <div className="space-y-6">
//       {/* <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Notifications</h1>
//           <p className="text-muted-foreground text-sm mt-1">
//             {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
//           </p>
//         </div>
//         {unreadCount > 0 && (
//           <Button variant="outline" size="sm" onClick={markAllRead}>
//             <CheckCheck className="w-4 h-4 mr-2" />
//             Mark all read
//           </Button>
//         )}
//       </div> */}

//       {/* Search + filters */}
//       <div className="space-y-3">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <Input
//             className="pl-9 pr-9"
//             placeholder="Search notifications..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value) }
//           />
//           {search && (
//             <button
//               onClick={() => setSearch("")}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>

//         <div className="flex items-center gap-4 flex-wrap">
//           {/* Type */}
//           <div className="flex items-center gap-1">
//             {TYPE_FILTERS.map((f) => (
//               <button
//                 key={f.value}
//                 onClick={() => setTypeFilter(f.value)}
//                 className={cn(
//                   "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
//                   typeFilter === f.value
//                     ? "bg-primary text-primary-foreground border-primary"
//                     : "hover:bg-muted border-input text-muted-foreground"
//                 )}
//               >
//                 {f.label}
//               </button>
//             ))}
//           </div>

//           <div className="w-px h-4 bg-border" />

//           {/* Read status */}
//           <div className="flex items-center gap-1">
//             {READ_FILTERS.map((f) => (
//               <button
//                 key={f.value}
//                 onClick={() => setReadFilter(f.value)}
//                 className={cn(
//                   "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
//                   readFilter === f.value
//                     ? "bg-primary text-primary-foreground border-primary"
//                     : "hover:bg-muted border-input text-muted-foreground"
//                 )}
//               >
//                 {f.label}
//               </button>
//             ))}
//           </div>

//           {hasFilters && (
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-xs h-7"
//               onClick={() => { setSearch(""); setTypeFilter(""); setReadFilter(""); }}
//             >
//               <X className="w-3 h-3 mr-1" />
//               Clear
//             </Button>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-16 border rounded-xl bg-muted/30">
//           <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
//           <p className="text-muted-foreground">
//             {hasFilters ? "No notifications match your filters" : "No notifications yet"}
//           </p>
//           {hasFilters && (
//             <button
//               onClick={() => { setSearch(""); setTypeFilter(""); setReadFilter(""); }}
//               className="text-primary text-sm hover:underline mt-2"
//             >
//               Clear filters
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {filtered.map((n) => (
//             <Card key={n.id} className={cn(!n.read && "border-primary/30 bg-primary/5")}>
//               <CardContent className="p-4">
//                 <div className="flex items-start gap-3">
//                   {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-2">
//                       <div>
//                         <p className={cn("text-sm font-medium", !n.read && "font-semibold")}>
//                           {n.title}
//                         </p>
//                         <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
//                       </div>
//                       <span className="text-xs text-muted-foreground shrink-0">
//                         {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3 mt-2">
//                       {n.actionUrl && n.actionText && (
//                         <Link
//                           href={n.actionUrl}
//                           onClick={() => !n.read && markRead(n.id)}
//                           className="text-xs text-primary hover:underline flex items-center gap-1"
//                         >
//                           {n.actionText}
//                           <ArrowRight className="w-3 h-3" />
//                         </Link>
//                       )}
//                       {!n.read && (
//                         <button
//                           onClick={() => markRead(n.id)}
//                           className="text-xs text-muted-foreground hover:text-foreground"
//                         >
//                           Mark read
//                         </button>
//                       )}
//                     </div>
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

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Bell, CheckCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  actionText: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read filters from URL (driven by PageSearch component)
  const q = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type") || "";
  const readFilter = searchParams.get("read") || "";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const params = new URLSearchParams({ limit: "100" });
    if (readFilter === "unread") params.set("unread", "true");
    const res = await fetch(`/api/notifications?${params}`);
    const data = await res.json();
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
    setLoading(false);
  }, [readFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success("All notifications marked as read");
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  // Client-side filtering from URL params
  const filtered = notifications.filter((n) => {
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q.toLowerCase()) ||
      n.message.toLowerCase().includes(q.toLowerCase());
    const matchesType = !typeFilter || n.type === typeFilter;
    const matchesRead =
      !readFilter ||
      (readFilter === "unread" && !n.read) ||
      (readFilter === "read" && n.read);
    return matchesSearch && matchesType && matchesRead;
  });

  const hasFilters = q || typeFilter || readFilter;

  return (
    <div className="space-y-6">
      {/* PageSearch component renders the search + dropdowns + refresh */}

      {unreadCount > 0 && (
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/30">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {hasFilters
              ? "No notifications match your filters"
              : "No notifications yet"}
          </p>
          {hasFilters && (
            <button
              onClick={() => router.push(pathname)}
              className="text-primary text-sm hover:underline mt-2"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <Card
              key={n.id}
              className={cn(!n.read && "border-primary/30 bg-primary/5")}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={cn(
                            "text-sm font-medium",
                            !n.read && "font-semibold"
                          )}
                        >
                          {n.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {n.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {n.actionUrl && n.actionText && (
                        <Link
                          href={n.actionUrl}
                          onClick={() => !n.read && markRead(n.id)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {n.actionText}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}