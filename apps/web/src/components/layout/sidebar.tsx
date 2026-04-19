// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Eye,
//   History,
//   Bell,
//   Settings,
//   Zap,
//   LogOut,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { signOut } from "@/lib/auth-client";
// import { useRouter } from "next/navigation";

// const navItems = [
//   { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
//   { href: "/jobs", label: "Monitor Jobs", icon: Eye },
//   { href: "/history", label: "History", icon: History },
//   { href: "/notifications", label: "Notifications", icon: Bell },
//   { href: "/settings", label: "Settings", icon: Settings },
// ];

// interface SidebarProps {
//   user: { name?: string | null; email: string; image?: string | null };
// }

// export function Sidebar({ user }: SidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const handleSignOut = async () => {
//     await signOut();
//     router.push("/login");
//   };

//   return (
//     <aside className="w-64 border-r bg-sidebar flex flex-col h-full shrink-0">
//       {/* Logo */}
//       <div className="flex items-center gap-2 px-6 py-5 border-b">
//         <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
//           <Zap className="w-4 h-4 text-primary-foreground" />
//         </div>
//         <span className="font-bold text-lg tracking-tight">Changd</span>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 px-3 py-4 space-y-1">
//         {navItems.map(({ href, label, icon: Icon }) => {
//           const active =
//             href === "/dashboard"
//               ? pathname === "/dashboard"
//               : pathname.startsWith(href);
//           return (
//             <Link
//               key={href}
//               href={href}
//               className={cn(
//                 "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
//                 active
//                   ? "bg-sidebar-primary text-sidebar-primary-foreground"
//                   : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
//               )}
//             >
//               <Icon className="w-4 h-4" />
//               {label}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* User */}
//       <div className="px-3 py-4 border-t space-y-1">
//         <div className="px-3 py-2">
//           <p className="text-sm font-medium truncate">{user.name || "User"}</p>
//           <p className="text-xs text-muted-foreground truncate">{user.email}</p>
//         </div>
//         <button
//           onClick={handleSignOut}
//           className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
//         >
//           <LogOut className="w-4 h-4" />
//           Sign out
//         </button>
//       </div>
//     </aside>
//   );
// }
