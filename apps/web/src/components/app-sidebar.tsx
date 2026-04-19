"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { 
  GalleryVerticalEndIcon, 
  AudioLinesIcon, 
  TerminalIcon, 
  TerminalSquareIcon, 
  BotIcon, 
  BookOpenIcon, 
  FrameIcon, 
  PieChartIcon, 
  MapIcon, 
  Bell 
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { Separator } from "./ui/separator"
import BrandCursorIcon from "./ui/brand-cursor-icon"

const data = {
  teams: [
    {
      name: "Monitrax",
      logo: <BrandCursorIcon className="-rotate-90" />,
      plan: "Enterprise",
    },
   
  ],
  navMain: [
    {
      title: "Audit Logs",
      url: "/dashboard",
      icon: <TerminalSquareIcon />,
      isActive: false,
      collapsible: false,
    },
    {
      title: "Monitor Jobs",
      url: "/jobs",
      icon: <BotIcon />,
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },

  ],
  projects: [
    {
      name: "dashboard",
      url: "/dashboard",
      icon: <PieChartIcon />,
    },
    {
      name: "Monitor Jobs",
      url: "/jobs",
      icon: <BotIcon />
    },
    {
      name: "History",
      url: "/history",
      icon: <BookOpenIcon />
    },
    {
      name: "Notifications",
      url: "/notifications",
      icon: <Bell />
    },
    {
      name: "Settings",
      url: "/settings",
      icon: <FrameIcon />,
    },
    
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = useSession()

  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>
      <SidebarHeader className="">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="space-y-3">
       
        <NavProjects projects={data.projects} /> 
        {/* <Separator className="dark:bg-[#232526] h-[1px] w-full" orientation="horizontal" />
        <NavMain items={data.navMain} /> */}
      </SidebarContent>
      <SidebarFooter >
        <NavUser user={session?.user} />
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  )
}