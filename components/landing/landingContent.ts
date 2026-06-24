export type LandingLocale = "zh" | "en";

export interface LandingContent {
  nav: Array<{ label: string; href: string }>;
  account: string;
  llms: string;
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    copy: string;
    primary: string;
    secondary: string;
    proof: string[];
  };
  mockup: {
    inbox: string;
    today: string;
    selected: string;
    editorTitle: string;
    editorLines: string[];
    contextTitle: string;
    contextItems: string[];
    mobileTitle: string;
    mobileActions: string[];
  };
  thesis: {
    kicker: string;
    title: string;
    copy: string;
    points: Array<{ label: string; title: string; body: string }>;
  };
  capture: {
    kicker: string;
    title: string;
    copy: string;
    modes: Array<{ title: string; body: string }>;
    note: string;
  };
  workspace: {
    kicker: string;
    title: string;
    copy: string;
    principles: Array<{ title: string; body: string }>;
  };
  intelligence: {
    kicker: string;
    title: string;
    copy: string;
    steps: Array<{ label: string; title: string; body: string }>;
  };
  pricing: {
    kicker: string;
    title: string;
    copy: string;
    beta: string;
    plans: Array<{
      name: string;
      price: string;
      period: string;
      description: string;
      cta: string;
      href: string;
      featured?: boolean;
      rows: string[];
    }>;
    note: string;
  };
  final: {
    kicker: string;
    title: string;
    copy: string;
    downloadLabel: string;
    feedback: string;
    badges: string[];
  };
}

export const landingContent: Record<LandingLocale, LandingContent> = {
  zh: {
    nav: [
      { label: "定位", href: "#thesis" },
      { label: "移动记录", href: "#capture" },
      { label: "桌面工作台", href: "#workspace" },
      { label: "AI", href: "#intelligence" },
      { label: "定价", href: "#pricing" },
    ],
    account: "账号",
    llms: "LLMs.txt",
    hero: {
      eyebrow: "本地优先 LLM Wiki",
      title: "记忆交给 Agent，",
      titleAccent: "索引留给自己。",
      copy: "",
      primary: "下载 Walnut",
      secondary: "看工作流",
      proof: ["本地优先", "实体索引", "自带 AI Key"],
    },
    mockup: {
      inbox: "Wiki 索引",
      today: "收集箱 / 实体 / 来源",
      selected: "agent-memory.md",
      editorTitle: "Memory for Agent",
      editorLines: [
        "记录先进入本地索引，而不是散落在又一个笔记堆里。",
        "实体、来源和任务保持可追踪，桌面端负责确认关系。",
        "Agent 读取结构化记忆，你保留最终的知识地图。",
      ],
      contextTitle: "Index hints",
      contextItems: ["实体：Walnut", "来源：语音备忘", "主题：移动记录", "动作：回顾"],
      mobileTitle: "Mobile capture",
      mobileActions: ["文本", "语音", "图片"],
    },
    thesis: {
      kicker: "Why Walnut",
      title: "知识管理不应该增加心理负担。",
      copy:
        "真正可持续的个人知识系统，需要先允许混乱存在，再提供温和的整理路径。Walnut 把记录、索引、回顾拆成低压力的节奏。",
      points: [
        {
          label: "01",
          title: "少做分类决定",
          body: "捕获时不强迫你选择文件夹、标签或模板，先把素材留下来。",
        },
        {
          label: "02",
          title: "把连接留到更合适的时候",
          body: "桌面端在阅读和写作上下文中提示相关内容，而不是让你维护复杂系统。",
        },
        {
          label: "03",
          title: "AI 是安静的整理助手",
          body: "实体、主题、冲突和链接可以由 AI 建议，但最终确认权仍在你手里。",
        },
      ],
    },
    capture: {
      kicker: "Mobile Capture",
      title: "移动端只做一件事：让记录变得足够轻。",
      copy:
        "手机不是完整知识库，而是入口。它应该像便签一样快，像相机一样自然，像语音备忘录一样没有压力。",
      modes: [
        { title: "文本", body: "打开即写，不先选择数据库、项目或模板。" },
        { title: "语音", body: "路上想到的内容先录下来，之后再转写和整理。" },
        { title: "图片", body: "截图、书页、白板、票据都可以先进入收集箱。" },
      ],
      note: "移动端是桌面端的延伸，不抢占桌面端的深度整理角色。",
    },
    workspace: {
      kicker: "Desktop Workspace",
      title: "桌面端是安静的一体化工作台。",
      copy:
        "减少漂浮卡片和过度装饰，用连续区域、文字列表、轻分隔线和明确层级承载长期工作。",
      principles: [
        { title: "文字列表选中", body: "只通过背景色对比表达状态，不使用圆点、竖条或位移。" },
        { title: "标签高亮", body: "标签不加边线，使用低饱和背景色和主题色文字。" },
        { title: "图标选中", body: "图标本身切换为主题色，背景保持透明。" },
        { title: "边框标准", body: "结构边界使用 1px hairline；焦点态才使用主题色描边。" },
      ],
    },
    intelligence: {
      kicker: "Gentle Intelligence",
      title: "AI 应该降低整理成本，而不是制造紧迫感。",
      copy:
        "Walnut 的 AI 设计是慢的、可确认的、可撤回的。它负责生成建议，你负责保留判断。",
      steps: [
        { label: "Extract", title: "提取关键实体", body: "从文本、语音转写和图片 OCR 中提取人物、主题、项目和时间线。" },
        { label: "Suggest", title: "建议关联", body: "当新记录和旧笔记相关时，给出轻量提示，而不是自动改写你的库。" },
        { label: "Review", title: "定期回顾", body: "在写作、学习和决策时，让旧知识自然浮现。" },
      ],
    },
    pricing: {
      kicker: "Pricing",
      title: "软件功能和 AI 算力分开。",
      copy:
        "基础能力保持免费。当前优先支持自带 AI Key 的使用方式，高级功能通过订阅或买断解锁。",
      beta: "Beta 期间开放安全支付通道；如果尚未登录，会先登录账号，再继续选择的方案。",
      plans: [
        {
          name: "免费版",
          price: "$0",
          period: "永久",
          description: "适合先建立本地记录和轻量知识库。",
          cta: "下载 Walnut",
          href: "#download",
          rows: ["基础记录和整理", "本地优先", "可使用自己的 AI Key"],
        },
        {
          name: "专业版 · 自带 AI",
          price: "$5",
          period: "每月",
          description: "适合需要高级整理和云存储的长期用户。",
          cta: "选择月付",
          href: "/checkout/start?plan=proByok",
          featured: true,
          rows: ["包含免费版能力", "高级工作流", "云存储服务"],
        },
        {
          name: "专业买断版",
          price: "$99",
          period: "一次",
          description: "适合不喜欢订阅、愿意长期使用的用户。",
          cta: "选择买断",
          href: "/checkout/start?plan=lifetime",
          rows: ["高级功能长期有效", "云存储服务", "继续自带 AI Key"],
        },
      ],
      note: "当前付费项目只包含软件功能和云存储服务，不包含托管 AI 算力。",
    },
    final: {
      kicker: "Start Quietly",
      title: "把零散素材放到一个更安静的地方。",
      copy: "从今天开始记录。连接可以慢慢发生。",
      downloadLabel: "获取最新版本",
      feedback: "问题反馈与建议",
      badges: ["本地优先", "隐私优先", "数据主权"],
    },
  },
  en: {
    nav: [
      { label: "Positioning", href: "#thesis" },
      { label: "Capture", href: "#capture" },
      { label: "Workspace", href: "#workspace" },
      { label: "AI", href: "#intelligence" },
      { label: "Pricing", href: "#pricing" },
    ],
    account: "Account",
    llms: "LLMs.txt",
    hero: {
      eyebrow: "Local-first LLM Wiki",
      title: "Memory for your Agent.",
      titleAccent: "Indexing for you.",
      copy: "",
      primary: "Download Walnut",
      secondary: "See the workflow",
      proof: ["Local-first", "Entity index", "Bring your own AI key"],
    },
    mockup: {
      inbox: "Wiki Index",
      today: "Inbox / Entities / Sources",
      selected: "agent-memory.md",
      editorTitle: "Memory for Agent",
      editorLines: [
        "Capture becomes searchable context, not another pile of notes.",
        "Entities, sources, and tasks stay linked inside one local index.",
        "Agent reads structured memory; you keep the map.",
      ],
      contextTitle: "Index hints",
      contextItems: ["Entity: Walnut", "Source: voice memo", "Topic: mobile capture", "Action: review"],
      mobileTitle: "Mobile capture",
      mobileActions: ["Text", "Voice", "Image"],
    },
    thesis: {
      kicker: "Why Walnut",
      title: "Knowledge work should not add more pressure.",
      copy:
        "A sustainable personal knowledge system needs to accept mess first, then offer a gentle path back to order. Walnut separates capture, indexing, and review into a calm rhythm.",
      points: [
        {
          label: "01",
          title: "Make fewer filing decisions",
          body: "Capture does not force folders, tags, or templates before the thought is saved.",
        },
        {
          label: "02",
          title: "Connect when context is ready",
          body: "Desktop review surfaces relationships while you read and write, not as a maintenance chore.",
        },
        {
          label: "03",
          title: "Keep AI quiet and reversible",
          body: "Entities, topics, conflicts, and links can be suggested by AI, but confirmation stays with you.",
        },
      ],
    },
    capture: {
      kicker: "Mobile Capture",
      title: "The mobile app has one job: make recording feel light.",
      copy:
        "The phone is not the full knowledge base. It is the doorway: as fast as a sticky note, as natural as a camera, and as low-pressure as a voice memo.",
      modes: [
        { title: "Text", body: "Open and write before choosing a database, project, or template." },
        { title: "Voice", body: "Record thoughts on the move, then transcribe and organize later." },
        { title: "Image", body: "Screenshots, book pages, whiteboards, and receipts can enter the inbox first." },
      ],
      note: "Mobile extends the desktop app; it does not compete with the desktop's deeper organizing role.",
    },
    workspace: {
      kicker: "Desktop Workspace",
      title: "The desktop app is a quiet, integrated workbench.",
      copy:
        "Less floating cards and decoration. More continuous regions, text lists, hairline dividers, and hierarchy that can support long sessions.",
      principles: [
        { title: "Selected text rows", body: "Use background contrast only. No dots, side bars, or physical offset." },
        { title: "Highlighted tags", body: "No borders. Use soft fills and theme-colored text." },
        { title: "Selected icons", body: "The icon itself turns to the theme color while the background remains transparent." },
        { title: "Border standard", body: "Use 1px hairlines for structure; reserve theme borders for focus states." },
      ],
    },
    intelligence: {
      kicker: "Gentle Intelligence",
      title: "AI should reduce organizing cost, not create urgency.",
      copy:
        "Walnut's AI behavior is slow, confirmable, and reversible. It prepares suggestions; you keep the judgment.",
      steps: [
        { label: "Extract", title: "Extract key entities", body: "Find people, topics, projects, and timelines across text, transcripts, and OCR." },
        { label: "Suggest", title: "Suggest relationships", body: "When a new capture relates to old notes, surface a light prompt instead of rewriting your library." },
        { label: "Review", title: "Bring memory back", body: "During writing, learning, and decisions, let old knowledge reappear naturally." },
      ],
    },
    pricing: {
      kicker: "Pricing",
      title: "Software access and AI compute are separate.",
      copy:
        "Core capabilities stay free. Walnut currently focuses on bring-your-own-key usage, with advanced software features unlocked by subscription or lifetime access.",
      beta: "Secure payment is available during beta. If you are not signed in, Walnut signs you in first and then continues with the selected plan.",
      plans: [
        {
          name: "Free",
          price: "$0",
          period: "forever",
          description: "For starting a local record and a lightweight knowledge base.",
          cta: "Download Walnut",
          href: "#download",
          rows: ["Core capture and organizing", "Local-first", "Use your own AI key"],
        },
        {
          name: "Pro · Own AI",
          price: "$5",
          period: "per month",
          description: "For long-term users who want advanced workflows and cloud storage.",
          cta: "Choose monthly",
          href: "/checkout/start?plan=proByok",
          featured: true,
          rows: ["Everything in Free", "Advanced workflows", "Cloud storage service"],
        },
        {
          name: "Pro Lifetime",
          price: "$99",
          period: "once",
          description: "For users who dislike subscriptions and plan to use Walnut long term.",
          cta: "Choose lifetime",
          href: "/checkout/start?plan=lifetime",
          rows: ["Lifetime advanced access", "Cloud storage service", "Keep your own AI key"],
        },
      ],
      note: "Current paid items include software features and cloud storage service, not hosted AI compute.",
    },
    final: {
      kicker: "Start Quietly",
      title: "Put scattered material in a calmer place.",
      copy: "Start recording today. Connections can happen slowly.",
      downloadLabel: "Get the latest version",
      feedback: "Report issues or feedback",
      badges: ["Local-first", "Privacy first", "Data sovereignty"],
    },
  },
};
