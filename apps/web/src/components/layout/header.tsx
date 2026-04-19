// "use client";

// import { Bell, Layout, LayoutDashboard, Plus } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
// import { SidebarTrigger } from "../ui/sidebar";
// import UserAvatar from "../ui/userAvatar";

// interface HeaderProps {
//   user: { name?: string | null; email: string };
// }

// export function Header({ user }: HeaderProps) {
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     const fetchCount = async () => {
//       try {
//         const res = await fetch("/api/notifications?limit=1");
//         const data = await res.json();
//         setUnreadCount(data.unreadCount || 0);
//       } catch {}
//     };
//     fetchCount();
//     const interval = setInterval(fetchCount, 30_000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <header className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-background">
//        <div className="">
//         <div className="flex items-center gap-3">
//           <div className="p-1 w-6 h-6 bg-[#E8E8E8] dark:bg-[#292929] border dark:border-[#4A4E51] rounded-md flex items-center justify-center">
//             <LayoutDashboard className="w-5 h-5 dark:text-[#ABABAB] text-[#292929]"/>
//           </div>
//           <span className="text-md font-normal capitalize truncate">Dashboard</span>
//         </div>
//        </div>
//       <div className="flex items-center gap-3">
//         <Link href="/jobs/new">
//           <Button className="hidden md:flex py-1 h-7 items-center gap-2">
//             <Plus className="w-4 h-4 " />
//             New Monitor
//           </Button>
//         </Link>
//          <SidebarTrigger/>
//         <Link href="/notifications">
//           <Button variant="ghost" size="icon" className="relative">
//             <Bell className="w-4 h-4" />
//             {unreadCount > 0 && (
//               <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </span>
//             )}
//           </Button>
//         </Link>
//         <UserAvatar user={user}/>

//             <AnimatedThemeToggler />
//       </div>
//     </header>
//   );
// }


"use client";

import { Bell, LayoutDashboard, Plus, Airplay, History, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "../ui/sidebar";
import UserAvatar from "../ui/userAvatar";

interface HeaderProps {
  user: { name?: string | null; email: string };
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications?limit=1");
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  const getPageConfig = () => {
    switch (pathname) {
      case "/jobs":
        return { icon: Airplay, title: "Monitor", showNewButton: true };
      case "/history":
        return { icon: History, title: "History", showNewButton: false };
      case "/notifications":
        return { icon: Bell, title: "Notifications", showNewButton: false };
      case "/settings":
        return { icon: Settings, title: "Settings", showNewButton: false };
      case "/jobs/new":
        return { icon: Airplay, title: "New Monitor", showNewButton: true };
      case "/dashboard":
      default:
        return { icon: LayoutDashboard, title: "Dashboard", showNewButton: true };
    }
  };

  const config = getPageConfig();
  const Icon = config.icon;

  return (
    <header className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-background">
       <div className="">
        <div className="flex items-center gap-3">
          <div className="p-1 w-6 h-6 bg-[#E8E8E8] dark:bg-[#292929] border dark:border-[#4A4E51] rounded-md flex items-center justify-center">
            <Icon className="w-5 h-5 dark:text-[#ABABAB] text-[#292929]"/>
          </div>
          <span className="text-md font-normal capitalize truncate">{config.title}</span>
        </div>
       </div>
      <div className="flex items-center gap-3">
        {config.showNewButton && (
          <Link href="/jobs/new">
            <Button className="hidden md:flex py-1 h-7 rounded-md items-center gap-2">
              <Plus className="w-4 h-4 " />
              New Monitor
            </Button>
          </Link>
        )}
         {/* <SidebarTrigger/> */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>
        <UserAvatar user={user}/>
      </div>
    </header>
  );
}