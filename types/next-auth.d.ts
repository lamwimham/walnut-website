import type { DefaultSession } from "next-auth";

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      planCode?: string;
      subscriptionStatus?: string;
      deviceCount?: number;
      maxDevices?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    billingUserId?: string;
    planCode?: string;
    subscriptionStatus?: string;
    deviceCount?: number;
    maxDevices?: number;
  }
}
