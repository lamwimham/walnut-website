"use client";

import { ReactNode } from "react";
import DownloadButtons from "./DownloadButtons";
import DownloadStatsPanel from "./DownloadStatsPanel";
import BrainLogo from "./effects/BrainLogo";

export interface AgentFooterProps {
  /** Agent 产品名称，如 "Walnut" */
  agentName: string;
  /** Agent 标语/副标题 */
  agentTagline?: string;
  /** 自定义 Logo 组件，默认使用 BrainLogo */
  logo?: ReactNode;
  /** GitHub 仓库信息，用于获取下载链接 */
  repoOwner: string;
  repoName: string;
  /** 是否显示下载按钮 */
  showDownloads?: boolean;
  /** 底部特性标签 */
  badges?: string[];
  /** 版权年份 */
  year?: number;
  /** 下载区标题 */
  downloadLabel?: string;
  /** 可选镜像清单；异常时下载组件自动回退 GitHub Release */
  mirrorManifestUrl?: string;
  /** 可选下载统计 JSON；用于静态站点展示全球下载次数和 Top 国家 */
  downloadStatsUrl?: string;
}

/**
 * AgentFooter — 体现 evofarm Agent 系列关系的统一页脚
 *
 * 设计理念：
 * - 每个 Agent 的 landing page 都共享同一套页脚结构
 * - 明确标示 "An Agent by evofarm"，建立品牌系列感
 * - 下载按钮自动从 GitHub Release 获取最新安装包
 * - 版权统一归属 evofarm，体现公司主体
 */
export default function AgentFooter({
  agentName,
  agentTagline,
  logo,
  repoOwner,
  repoName,
  showDownloads = true,
  badges = ["本地优先", "开源友好", "数据主权"],
  year = new Date().getFullYear(),
  downloadLabel,
  mirrorManifestUrl,
  downloadStatsUrl,
}: AgentFooterProps) {
  const resolvedLogo = logo ?? (
    <BrainLogo className="w-5 h-5 opacity-40" />
  );

  return (
    <footer className="mt-24 pt-16 border-t border-border-subtle">
      {/* Top: Brand relationship */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          {/* Agent identity */}
          <div className="flex items-center gap-2.5 mb-3">
            {resolvedLogo}
            <span className="text-sm tracking-[0.25em] uppercase text-text-primary font-medium">
              {agentName}
            </span>
          </div>

          {/* Series relationship — the core message */}
          <div className="flex items-center gap-2 text-xs tracking-wider text-text-muted mb-2">
            <span>An Agent by</span>
            <a
              href="https://www.evofarm.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neural-soft hover:text-neural transition-colors font-medium"
            >
              evofarm
            </a>
          </div>

          {agentTagline && (
            <p className="text-xs text-text-muted max-w-sm leading-relaxed">
              {agentTagline}
            </p>
          )}
        </div>

        {/* Middle: Downloads */}
        {showDownloads && (
          <div className="flex flex-col items-center mb-12">
            <p className="text-xs text-text-muted mb-4 tracking-wider uppercase">
              {downloadLabel ?? "Get the Latest"}
            </p>
            <DownloadButtons
              repoOwner={repoOwner}
              repoName={repoName}
              productName={agentName}
              fallbackLabel={downloadLabel}
              mirrorManifestUrl={mirrorManifestUrl}
            />
            <DownloadStatsPanel
              statsUrl={downloadStatsUrl}
              className="mt-8 w-full max-w-3xl"
            />
          </div>
        )}

        {/* Bottom: Links & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-8 border-t border-border-subtle">
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {badges.map((badge, i) => (
              <span key={badge} className="flex items-center gap-2">
                <span className="text-[0.65rem] text-text-muted tracking-wider">
                  {badge}
                </span>
                {i < badges.length - 1 && (
                  <span className="text-text-muted/30">·</span>
                )}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-[0.65rem] text-text-muted tracking-wider">
            © {year}{" "}
            <a
              href="https://www.evofarm.top"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neural-soft transition-colors"
            >
              evofarm
            </a>
            . All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
