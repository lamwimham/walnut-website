import { auth } from "@/auth";

export type WebsiteSession = {
  userId: string;
  email?: string;
  displayName?: string;
};

export async function currentWebsiteSession(): Promise<WebsiteSession | null> {
  const session = await auth();
  const user = session?.user;
  const userId = user?.id?.trim();
  if (!user || !userId) return null;
  return {
    userId,
    email: user.email ?? undefined,
    displayName: user.name ?? undefined,
  };
}
