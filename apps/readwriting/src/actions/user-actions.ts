"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { signOutAction } from "./auth-actions";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || null },
  });

  revalidatePath("/settings");
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.delete({
    where: { id: session.user.id },
  });

  await signOutAction();
}
