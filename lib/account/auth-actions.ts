"use server";

import { signIn, signOut } from "@/auth";
import { safeReturnUrl } from "./return-url-policy";

export async function signInWithGoogle(formData: FormData) {
  const returnTo = safeReturnUrl(String(formData.get("returnTo") ?? ""), "/account");
  await signIn("google", { redirectTo: returnTo });
}

export async function signOutFromAccount() {
  await signOut({ redirectTo: "/login" });
}
