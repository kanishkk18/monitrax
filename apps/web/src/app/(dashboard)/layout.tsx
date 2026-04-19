import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
// import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PageSearch } from "@/components/PageSearch";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  return (
    <SidebarProvider className="overflow-y-hidden max-h-screen ">
      <AppSidebar className="dark:!bg-[#121212] !bg-[#ffffff] border-r border-border dark:border-[#272A2B] relative w-64" collapsible="offcanvas" variant="inset"/>
      <SidebarInset className="flex flex-1 flex-col gap-0 ">
        <Header user={session.user} />
        <PageSearch />
        <main className="flex-1 w-full h-full overflow-y-auto px-5 py-5">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
