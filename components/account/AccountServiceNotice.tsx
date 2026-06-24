"use client";

import type { AccountSummaryStatus } from "@/lib/account/billing-client";
import { useI18n } from "@/lib/i18n/context";

const SERVICE_COPY = {
  zh: {
    preview: {
      title: "预览模式",
      body: "当前没有连接 Walnut 计费服务，页面展示的是本地预览权益。配置服务后会自动同步真实账号状态。",
    },
    unavailable: {
      title: "账号状态暂时无法同步",
      body: "Walnut 没有拿到计费服务的最新响应。你仍然可以查看账号页；订阅、设备数和支付操作会在服务恢复后同步。",
    },
    actionUnavailable: "服务同步中",
  },
  en: {
    preview: {
      title: "Preview mode",
      body: "The Walnut billing service is not connected, so this page is showing local preview access. Real account status will sync once the service is configured.",
    },
    unavailable: {
      title: "Account status cannot sync right now",
      body: "Walnut did not receive a fresh response from the billing service. You can still view the account page; subscription, device, and payment actions will sync when the service recovers.",
    },
    actionUnavailable: "Service syncing",
  },
} as const;

export function useAccountServiceText() {
  const { locale } = useI18n();
  return SERVICE_COPY[locale === "zh" ? "zh" : "en"];
}

export default function AccountServiceNotice({
  reason,
  status,
}: {
  reason?: string;
  status: AccountSummaryStatus;
}) {
  const copy = useAccountServiceText();

  if (status === "live") return null;

  const view = status === "unavailable" ? copy.unavailable : copy.preview;

  return (
    <div className="account-service-notice" data-tone={status} role="status">
      <strong>{view.title}</strong>
      <span>{view.body}</span>
      {reason ? <code>{reason}</code> : null}
    </div>
  );
}
