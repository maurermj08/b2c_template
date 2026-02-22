import { auth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SupportFAQ } from "./support-faq";
import { ContactForm } from "./contact-form";

export default async function SupportPage() {
  const session = await auth();

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Support</h1>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <SupportFAQ />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <p className="text-base text-muted-foreground mt-1">
            Send us a message and we&apos;ll get back to you.
          </p>
        </CardHeader>
        <CardContent>
          <ContactForm
            defaultName={session?.user?.name || ""}
            defaultEmail={session?.user?.email || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
