# Issue: Walnut Website Account Portal - Google 登录注册与客户端授权入口

状态：In Progress / P0 Account portal bridge implemented locally
适用仓库：`walnut-website`  
创建日期：2026-06-21  
关联项目：`walnut-billing` / `ISSUE_ACCESS_DEVICE_LOGIN_BRIDGE.md`

## 1. 背景

`walnut-website` 当前是 Walnut 的 landing page，技术形态为 Next.js 静态导出：

```ts
// next.config.ts
output: "export"
distDir: "dist"
```

这适合营销页面、下载页和静态内容，但不适合生产级账号登录，因为 Google OAuth callback、服务端 session、httpOnly cookie、CSRF 校验、Google Client Secret 都必须运行在服务端。

新的产品目标是把 `walnut-website` 从纯 landing page 演进为：

```text
Marketing Site + Account Portal + Browser Auth BFF
```

其中：

- `walnut-website` 负责用户可见的账号注册/登录、Google OAuth 浏览器流程、账号中心、订阅管理入口、客户端设备登录页。
- `walnut-billing` 负责用户事实、外部身份绑定、订阅事实、支付履约、设备授权、signed access snapshot。
- Walnut 桌面客户端不直接接触 Google OAuth token，不依赖固定本地端口完成登录。

## 2. 目标架构

```text
Browser
  -> walnut-website /login
    -> Google OAuth
      -> walnut-website /api/auth/callback/google (Auth.js)
        -> Auth.js validates Google identity
        -> website server calls walnut-billing internal identity/session APIs
        -> website sets httpOnly web session cookie

Walnut Desktop
  -> walnut-billing creates device login session
  <- login_url = https://www.walnut.xxx/login/device?session=als_xxx
  -> opens browser login_url

Browser
  -> walnut-website /login/device?session=als_xxx
  -> user signs in with Google
  -> website calls billing authorize device login session
  -> browser shows success page and tries walnut:// return link

Walnut Desktop
  -> polls walnut-billing
  -> consumes authorized device login session
  -> receives user + device + signed access snapshot
```

Google Cloud Console callback 应固定为 website/account 域名：

```text
https://www.walnut.xxx/api/auth/callback/google
```

如果后续拆子域名，推荐：

```text
https://accounts.walnut.xxx/api/auth/callback/google
```

## 3. 职责边界

| 模块 | 负责 | 不负责 |
|---|---|---|
| `walnut-website` | 登录/注册 UI、Google OAuth callback、web session、账号中心、设备登录页、订阅管理入口 | 支付 webhook、权益履约、设备容量规则、signed snapshot 签发 |
| `walnut-billing` | User/ExternalIdentity、订阅/订单/支付、device login session、device binding、entitlement、signed snapshot | 营销页面、复杂浏览器 UI、Google 登录页面品牌体验 |
| Walnut Desktop | 打开 login_url、轮询授权结果、保存 signed snapshot | Google OAuth callback、Google Client Secret、浏览器 cookie |

设计原则：

1. Website 是用户体验层和 browser auth BFF。
2. Billing 是商业控制平面和授权事实源。
3. Google 登录成功不等于客户端授权成功；客户端授权必须由 billing 的 device login session 完成。
4. Website 与 billing 的服务端通信必须使用内部 API key/JWT/mTLS 等 server-to-server trust，不能从浏览器直接调用敏感内部接口。

## 4. 非目标

| 非目标 | 原因 |
|---|---|
| 不在 website 静态导出模式下硬做 OAuth | 无法安全保存 secret、httpOnly cookie、server callback |
| 不让 website 直接签发 Walnut 客户端 snapshot | Snapshot 是 billing/access 模块的事实输出 |
| 不在本期实现 GitHub/Apple 登录 | P0 只完成 Google 登录闭环，provider registry 留扩展点 |
| 不把浏览器 cookie 交给桌面端 | 桌面端应消费 billing 签发的设备授权结果 |
| 不把 Google access token 返回给客户端 | 防泄露，且客户端不需要 provider token |

## 5. 关键改造点

### 5.1 从静态站升级为 serverful Next 应用

需要调整：

- 移除或按环境禁用 `output: "export"`。
- 部署形态从静态 CDN 调整为支持 Next route handlers/server actions 的 Node runtime 或兼容平台。
- 保留 landing page 的静态优化能力，但账号相关路径必须运行在服务端。

建议路由分层：

```text
app/
  page.tsx                       # landing page, mostly static
  login/page.tsx                 # account login
  signup/page.tsx                # optional; Google first can merge into login
  account/page.tsx               # account overview
  account/billing/page.tsx       # subscription and checkout entry
  login/device/page.tsx          # desktop device login bridge
  auth/success/page.tsx          # browser success page
  auth/error/page.tsx            # browser safe error page
  api/auth/[...nextauth]/route.ts  # Auth.js handlers
  auth.ts                          # Auth.js Google provider + billing sync callbacks
```

推荐内部目录：

```text
lib/account/
  auth-actions.ts                # signIn/signOut server actions
  session.ts                     # Auth.js session projection
  billing-client.ts              # server-to-server billing client
  billing-client.ts              # server-to-server billing client
  return-url-policy.ts           # safe redirect / walnut:// allowlist
  account-presenter.ts           # UI-safe account view model
```

### 5.2 Website web session

目标：通过 Auth.js 获得 website 自己的 httpOnly session，而不是把 Google token 暴露给前端。

要求：

- 使用 Auth.js 管理 httpOnly、Secure、SameSite cookie。
- Session/JWT 中只保存 billing user id 和最小 UI claims。
- 服务端通过 billing 获取当前 user/account/subscription read model。
- logout 清理 website session，不影响 billing 的历史订单/设备授权事实。

### 5.3 Google OAuth via Auth.js

Google OAuth Web Client 配置：

- Type: `Web application`
- Authorized redirect URI:

```text
https://www.walnut.xxx/api/auth/callback/google
```

OAuth 要求：

- Auth.js 负责 OAuth state、callback、token exchange 和 session cookie。
- Website 在 Auth.js callback 中校验 Google profile 必须有 `sub`、`email`、`email_verified=true`。
- Website 在 Auth.js JWT/session callback 中调用 billing `external-login` 并只保存 billing user id。
- 不把 code/state/id_token/access_token 渲染到页面或日志。

### 5.4 Website 与 billing 的身份同步

Website callback 验证 Google identity 后，调用 billing 内部 API：

```http
POST /internal/v1/identity/external-login
Authorization: Bearer <WEBSITE_TO_BILLING_TOKEN>
```

请求草案：

```json
{
  "provider": "google",
  "subject": "google-sub-xxx",
  "email": "writer@example.com",
  "email_verified": true,
  "display_name": "Writer",
  "avatar_url": "https://...",
  "source": "website_google_login"
}
```

响应草案：

```json
{
  "user": {
    "id": "usr_xxx",
    "email": "writer@example.com",
    "display_name": "Writer"
  },
  "account": {
    "subscription_status": "trialing",
    "plan_code": "basic_own_ai"
  }
}
```

Website 只保存 web session；billing 维护 `UserExternalIdentity` 与用户事实。

### 5.5 Desktop device login bridge UI

当 Walnut 打开：

```text
https://www.walnut.xxx/login/device?session=als_xxx&token=browser_xxx
```

Website 行为：

1. 校验 query 中的 session/token 基本形态。
2. 如果用户未登录，先引导 Google 登录。
3. 登录完成后展示“授权这台 Walnut 客户端？”页面。
4. 用户确认后，website server 调 billing authorize endpoint。
5. 显示成功页，尝试打开 `walnut://access/oauth/google/success`。

注意：browser token 只能用于打开/授权 browser flow，不能 poll/consume 客户端结果。

## 6. API 依赖 billing

Website 依赖 billing 提供以下服务端 API，具体由 billing issue 落地：

| API | 用途 |
|---|---|
| `POST /internal/v1/identity/external-login` | Google identity upsert 成 Walnut user |
| `GET /internal/v1/account/me` 或 user read model | 渲染账号中心 |
| `POST /internal/v1/access/device-login-sessions/:id/authorize` | 已登录网页用户授权桌面设备登录 |
| `GET /internal/v1/commerce/subscriptions/:user_id` | 订阅管理页读取状态 |
| `POST /api/v1/commerce/checkout-sessions` | 从账号中心发起 checkout |
| `POST /api/v1/commerce/subscriptions/cancel|resume` | 订阅取消/恢复入口 |

## 7. 里程碑计划

### W1 - 架构迁移准备：Serverful Account Portal

任务：

- [ ] 决定部署目标：Vercel/Node server/自托管 Next。
- [ ] 移除或环境化 `output: "export"`，确保账号路由可运行在服务端。
- [ ] 保留 landing page 静态/缓存策略，避免影响营销页性能。
- [ ] 新增 `docs` 与账号模块目录结构。
- [ ] 定义环境变量与生产配置校验。

验收标准：

- [ ] `npm run build` 通过。
- [ ] `/` landing page 正常渲染。
- [ ] `/login`、`/account` 可使用服务端 runtime。
- [ ] 没有把 Google secret 暴露到 `NEXT_PUBLIC_*`。

### W2 - Account UI 与 Session 基础

任务：

- [ ] 新增登录页、账号页、登出入口。
- [ ] 实现 httpOnly session cookie 抽象。
- [ ] 实现 CSRF/state 生成与验证。
- [ ] 实现安全 return URL policy。
- [ ] 接入 billing account read model mock client。

验收标准：

- [ ] 未登录访问 `/account` 跳转 `/login`。
- [ ] 登录 session cookie 为 httpOnly + Secure + SameSite。
- [ ] return URL 只能跳本站安全路径或 allowlisted `walnut://access/...`。
- [ ] 单元测试覆盖 session、csrf、return-url policy。

### W3 - Google OAuth Web Login

任务：

- [ ] 实现 Google OAuth start route。
- [ ] 实现 Google OAuth callback route。
- [ ] 验证 ID token issuer/audience/nonce/email_verified。
- [ ] Callback 后调用 billing `external-login`。
- [ ] 建立 website web session。

验收标准：

- [ ] Google callback 固定为 website HTTPS URL。
- [ ] callback HTML/日志不包含 code/state/id_token/access_token。
- [ ] 未验证邮箱被拒绝。
- [ ] 成功登录后 `/account` 展示 billing 返回的 user/account view model。
- [ ] OAuth state replay、nonce mismatch、expired state 均失败。

### W4 - Desktop Device Login Page

任务：

- [ ] 新增 `/login/device` 页面。
- [ ] 支持未登录用户先 Google 登录，登录后回到 device authorization intent。
- [ ] 登录用户确认后调用 billing authorize device session。
- [ ] 成功页尝试 `walnut://...` 唤醒客户端。
- [ ] 失败页展示过期、已消费、token 错误、设备容量超限等安全文案。

验收标准：

- [ ] Website 不持有 poll/consume token。
- [ ] Browser token 不能调用客户端 consume API。
- [ ] 授权成功后 Walnut 客户端可通过 billing poll 看到 authorized。
- [ ] 成功页 `Cache-Control: no-store`。

### W5 - Account Portal 商业入口

任务：

- [ ] `/account` 展示用户、计划、订阅、设备摘要。
- [ ] `/account/billing` 展示当前订阅、checkout、取消/恢复入口。
- [ ] Checkout 调 billing 创建 session，不直接接支付 provider。
- [ ] 设备管理入口只调用 billing read/revoke APIs。

验收标准：

- [ ] Website 不读取 Creem/支付 provider 私有状态。
- [ ] 订阅状态以 billing read model 为准。
- [ ] 取消/恢复动作有二次确认与错误恢复。
- [ ] 页面能处理 billing 不可用状态。

### W6 - 生产化与观测

任务：

- [ ] 配置安全 headers、CSP、no-store auth pages。
- [ ] 增加登录事件 metrics/logs，不记录敏感 token。
- [ ] 增加 E2E：Google staging login -> account -> device authorization。
- [ ] 更新部署 runbook 和 Google Cloud Console 操作指南。

验收标准：

- [ ] 生产配置缺失时构建/启动失败。
- [ ] Lighthouse/基本可访问性不低于当前 landing page 水平。
- [ ] staging 真实 Google 登录成功。
- [ ] Walnut 客户端登录 E2E 成功。

## 8. Definition of Done

- [ ] `walnut-website` 支持生产级 Google Web 登录。
- [ ] Google OAuth callback 固定在 website/account HTTPS 域名。
- [ ] Website 拥有 httpOnly web session，但不保存/暴露 provider token。
- [ ] Website 可渲染 account portal 和 device login authorization 页面。
- [ ] Website 通过 server-to-server API 与 billing 同步身份和设备授权。
- [ ] Walnut 客户端无需本地 OAuth callback 即可完成登录。
- [ ] 登录、设备授权、订阅入口均有测试、配置校验与 runbook。

## 9. 测试矩阵

| 层级 | 测试 |
|---|---|
| Unit | csrf/state、session cookie、return URL allowlist、billing client error mapping |
| Route | Auth.js `/api/auth/[...nextauth]`、login、logout、device authorization |
| Page | `/login`、`/login/device`、`/account` 未登录/已登录状态 |
| Integration | Mock Google identity -> billing external-login -> website session |
| E2E | Staging Google login -> account portal -> authorize Walnut device |
| Security | no token in logs/HTML, no open redirect, Secure/httpOnly cookies |

## 10. 环境变量草案

```env
WALNUT_WEBSITE_PUBLIC_URL=https://www.walnut.xxx
AUTH_URL=https://www.walnut.xxx
NEXTAUTH_URL=https://www.walnut.xxx
WALNUT_BILLING_INTERNAL_BASE_URL=https://billing.walnut.xxx
WALNUT_BILLING_INTERNAL_TOKEN=...
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_ISSUER_URL=https://accounts.google.com
AUTH_SESSION_SECRET=...
AUTH_COOKIE_DOMAIN=.walnut.xxx
AUTH_RETURN_URL_ALLOWLIST=walnut://access/oauth/google/success
WALNUT_CHECKOUT_PROVIDER=creem
```


## 12. Implementation Checkpoint - 2026-06-21

已落地：

- [x] Serverful Next + Auth.js Google 登录基础。
- [x] `/login`、`/account`、`/account/billing`、`/login/device`、`/auth/success|error` 页面。
- [x] website -> billing `external-login` 已接入，用 billing user id 作为 web session 的最小身份事实。
- [x] website -> billing account summary 已接入，账号页不再只使用本地 placeholder。
- [x] `/login/device` 打开时调用 billing internal open endpoint，授权时调用 authorize endpoint。
- [x] 登录/账号页面 noindex，landing page 仍保持 SEO 可索引。

待继续：

- [ ] 配置真实 `WALNUT_BILLING_INTERNAL_TOKEN` / `WEBSITE_INTERNAL_AUTH_TOKEN` 对齐。
- [ ] Google Cloud Console 添加 website callback：`https://www.walnut.xxx/api/auth/callback/google` 和本地 `http://127.0.0.1:3000/api/auth/callback/google`；生产环境 `AUTH_URL` / `NEXTAUTH_URL` 必须指向 website origin，不能是 `localhost:3000`。
- [ ] Walnut Desktop 接入 billing create/poll/consume 后做端到端验收。
- [ ] 账号中心补齐 checkout/cancel/resume UI-safe read model 与操作入口。

## 11. Google One Tap 登录体验增强

状态：Implemented locally / pending browser verification
日期：2026-06-21

### 11.1 目标

在不改变现有身份事实源的前提下，为账号相关未登录页面增加 Google One Tap 自动提示登录体验：

```text
Google Identity Services One Tap
  -> website Auth.js credentials provider
    -> website verifies Google ID token server-side
      -> website calls walnut-billing external-login
        -> Auth.js writes httpOnly website session
```

### 11.2 架构边界

| 模块 | 负责 | 不负责 |
|---|---|---|
| Google GIS One Tap | 提供低摩擦浏览器登录提示，返回 Google ID token credential | 管理 Walnut 用户、订阅、设备授权 |
| `walnut-website` Auth.js | 校验 ID token、建立 website session、调用 billing 身份同步 | 保存 Google provider token 到桌面端 |
| `walnut-billing` | 外部身份绑定、用户事实、订阅与设备授权事实 | 渲染 One Tap UI |

### 11.3 实现点

- 新增 `components/account/GoogleOneTap.tsx`：客户端加载 Google GIS SDK，在未登录态触发 One Tap prompt。
- 新增 `lib/account/google-one-tap.ts`：服务端使用 Google 官方 `google-auth-library` 校验 ID token audience、签名与 payload。
- 更新 `auth.ts`：新增 `google-one-tap` credentials provider，与手动 Google OAuth 共享同一套 billing external-login 与 session claims 写入逻辑。
- 更新 `components/account/GoogleLoginPanel.tsx`：One Tap 不可用时保留手动 `Continue with Google` 兜底。

### 11.4 Google Cloud Console 依赖

除 OAuth redirect URI 外，One Tap 还要求 OAuth Client 配置 Authorized JavaScript origins：

```text
http://localhost:3000
http://127.0.0.1:3000
https://<production-website-domain>
```

生产验收前必须确认生产域名已经加入 Authorized JavaScript origins，否则 One Tap prompt 不会正常展示。

### 11.5 验收标准

- [ ] 未登录访问 `/login` 或 `/account` 时，浏览器可显示 Google One Tap prompt。
- [ ] 点击 One Tap 账号后，website 通过 Auth.js `google-one-tap` provider 建立 session。
- [ ] `/account` 显示 billing 返回的用户、套餐、设备摘要。
- [ ] One Tap 被关闭、跳过或浏览器不支持时，手动 `Continue with Google` 仍可完成登录。
- [ ] `/login/device` 未登录态 One Tap 登录后仍能回到原 device authorization URL。

## 12. Account Portal Visual Direction

状态：Implemented locally / no-card account UI
日期：2026-06-21

账号中心采用现代线性设置页，而不是 dashboard/card grid：

- 禁止在账号主路径使用卡片栅格、玻璃卡片堆叠、大圆角面板、发光阴影作为主要信息结构。
- `/account`、`/account/billing`、`/login`、`/login/device` 使用 typography、分割线、状态文本、细进度条和文本链接构建层级。
- 主视觉关键词是 `quiet control room`：克制、可信、现代、低噪音。
- 色彩仅用于状态和行动提示：`signal` 表示 connected/active，`soul` 表示 warning，`neural-soft` 表示 neutral。
- 保留手动 Google 登录兜底，但按钮视觉应为现代线框/文本型，不使用厚重 CTA 卡片。

## 13. Landing Page Editorial De-cardification

状态：Phase 1 implemented locally
日期：2026-06-21

Landing page 不采用账号中心的绝对 no-card 规则，但禁止把卡片网格作为默认表达方式。阶段 1 将营销叙事区从 SaaS card grid 调整为 editorial product narrative：

- `PhilosophyPyramid`：由六张玻璃卡改为编号 editorial rows。
- `ProblemSection`：由三张 comparison cards 和两张 role cards 改为左右对照行与 editorial duo。
- `FeatureRadar`：由三张 phase cards 改为 phase roadmap rows + inline feature list。
- `TasteProfile`：由 chart card + soul-data cards 改为数据线条与 editorial rows。
- `PricingSection`：保留 pricing 对比结构，但弱化为 line-based plan blocks，不再使用厚重 surface-card tone。

后续允许保留的容器类型：

- 产品视频/截图等 media frame。
- pricing/table 等需要可比较边界的信息结构。
- 下载状态或运营指标，但应进一步演进为 inline stats，而不是卡片堆叠。
