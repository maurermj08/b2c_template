"use server";

import { signIn, signOut } from "@/lib/auth";

export async function signInWithEmail(email: string) {
  await signIn("email", { email, redirectTo: "/verify?email=" + encodeURIComponent(email) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
