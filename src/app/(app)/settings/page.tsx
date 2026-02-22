import { auth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";
import { DeleteAccountSection } from "./delete-account";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account information.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            currentName={session?.user?.name || ""}
            email={session?.user?.email || ""}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccountSection />
        </CardContent>
      </Card>
    </div>
  );
}
