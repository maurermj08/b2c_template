import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      <Card className="border-2 border-dashed border-border p-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <LayoutDashboard className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Your dashboard</h2>
          <p className="mt-2 max-w-md text-base text-muted-foreground">
            This is where your app&apos;s main content will live. Replace this placeholder with your project-specific features.
          </p>
        </div>
      </Card>
    </div>
  );
}
