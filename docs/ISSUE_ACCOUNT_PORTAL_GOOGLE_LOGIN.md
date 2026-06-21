# Issue: Walnut Website Account Portal - Google 登录注册与客户端授权入口

状态：Draft / P0 Planned  
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
WALNUT_BILLING_INTERNAL_BASE_URL=https://billing.walnut.xxx
WALNUT_BILLING_INTERNAL_TOKEN=...
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_ISSUER_URL=https://accounts.google.com
AUTH_SESSION_SECRET=...
AUTH_COOKIE_DOMAIN=.walnut.xxx
AUTH_RETURN_URL_ALLOWLIST=walnut://access/oauth/google/success
```
