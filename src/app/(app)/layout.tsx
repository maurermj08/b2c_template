import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="md:pl-64">
        <AppHeader
          userName={session.user?.name}
          userEmail={session.user?.email}
        />
        <main className="px-6 py-8 md:px-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
