"use server";

import { auth } from "@/lib/auth";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function submitContactForm(data: ContactFormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📬 Support message from ${data.name} (${data.email}):\n${data.message}\n`);
    return { success: true };
  }

  console.log(`📬 Support form submitted by ${data.email} — wire up email delivery for production`);
  return { success: true };
}
