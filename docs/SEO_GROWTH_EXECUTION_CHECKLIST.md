# Walnut SEO Growth Execution Checklist

Status: Draft / execution checklist
Created: 2026-06-24
Primary domain: `https://walnut.evofarm.top`

## Goal

Build a repeatable SEO growth system for Walnut, starting with recovery of the
`walnut llm wiki` query and expanding into high-intent topics around LLM wiki,
AI knowledge management, AI agent memory, private knowledge bases, and
local-first AI.

This document is intentionally written as a checklist. Complete tasks from top
to bottom unless a later task explicitly has no dependency.

## Operating principles

- [ ] Prioritize useful pages over keyword volume.
- [ ] Point external links to the most relevant page, not always the homepage.
- [ ] Keep login, account, checkout, and API pages out of search indexes.
- [ ] Avoid mass-produced thin articles, paid link packages, PBNs, and spam
      directories.
- [ ] Use Google Search Console data to decide what to improve each week.
- [ ] Treat SEO as a closed loop: crawlability -> content -> internal links ->
      external discovery -> measurement -> iteration.

## Target architecture

```text
/
  -> /llm-wiki
  -> /knowledge-management
  -> /ai-agent-memory
  -> /local-first-ai
  -> /blogs
       -> /blogs/what-is-an-llm-wiki
       -> /blogs/personal-ai-agent-memory
       -> /blogs/local-first-ai-knowledge-management
       -> /blogs/rag-vs-agent-memory
       -> /blogs/mcp-personal-knowledge-base
       -> /blogs/private-ai-knowledge-base
```

Recommended dependency order:

```text
Technical SEO health
  -> Core topic pages
  -> Static blog system
  -> First content cluster
  -> External links
  -> Weekly Search Console iteration
```

## Success metrics

### 30-day goals

- [ ] `walnut llm wiki` shows a Walnut result again.
- [ ] Homepage and all core topic pages are indexed.
- [ ] Sitemap is successfully fetched by Google Search Console.
- [ ] At least 6 high-quality, highly relevant pages are live.
- [ ] At least 10 meaningful external mentions or links are created.
- [ ] At least 10 long-tail queries have impressions in Google Search Console.

### 60-day goals

- [ ] `walnut llm wiki` ranks on page 1.
- [ ] `LLM wiki`, `AI agent memory`, or `personal AI knowledge base` start
      receiving impressions.
- [ ] At least 20 external discovery paths exist.
- [ ] Top 3 pages by impressions have been improved based on Search Console
      data.

### 90-day goals

- [ ] Walnut has a stable content cluster around LLM wiki and AI memory.
- [ ] At least one article or core page receives natural backlinks without
      manual outreach.
- [ ] Search traffic creates measurable product actions: login, download,
      signup, waitlist, or pricing visits.

## Phase 0: Baseline and tracking

Complete before publishing new pages.

- [ ] Confirm Google Search Console property is verified for
      `https://walnut.evofarm.top`.
- [ ] Submit `https://walnut.evofarm.top/sitemap.xml`.
- [ ] Run URL Inspection for `https://walnut.evofarm.top/`.
- [ ] Click `Test Live URL` for the homepage.
- [ ] Click `Request Indexing` for the homepage.
- [ ] Record current Search Console baseline:
      - [ ] Indexed pages count.
      - [ ] Total impressions.
      - [ ] Total clicks.
      - [ ] Average position.
      - [ ] Queries containing `walnut`.
      - [ ] Queries containing `llm`.
      - [ ] Queries containing `knowledge`.
- [ ] Create a tracking sheet with columns:
      `Date`, `Query`, `Target URL`, `Impressions`, `Clicks`, `CTR`,
      `Average Position`, `Action`, `Owner`, `Next Review Date`.

Definition of done:

- [ ] Search Console can fetch the sitemap.
- [ ] Homepage live test says the page can be fetched.
- [ ] Indexing is allowed for the homepage.
- [ ] A baseline record exists before new SEO work begins.

## Phase 1: Technical SEO health

Objective: make sure Google can crawl, index, and understand the public pages.

### Crawlability

- [ ] `https://walnut.evofarm.top/` returns HTTP 200.
- [ ] `http://walnut.evofarm.top/` redirects to HTTPS with 301.
- [ ] `https://walnut.evofarm.top/sitemap.xml` returns HTTP 200.
- [ ] `https://walnut.evofarm.top/robots.txt` returns HTTP 200.
- [ ] `robots.txt` points to the canonical sitemap URL.
- [ ] `sitemap.xml` contains only public, canonical, indexable URLs.
- [ ] `sitemap.xml` does not include `/login`, `/account`, `/checkout`,
      `/auth`, or `/api`.

### Indexability

- [ ] Homepage metadata has `index, follow`.
- [ ] Public marketing pages have `index, follow`.
- [ ] Login/account/checkout/auth pages are `noindex` or otherwise not
      discoverable through sitemap.
- [ ] Canonical URLs use `https://walnut.evofarm.top`.
- [ ] No duplicate canonical variants exist for `www`, HTTP, or trailing slash
      inconsistencies.

### Performance and rendering

- [ ] Homepage is not dependent on login session checks.
- [ ] Homepage returns a public/cacheable response.
- [ ] Important text is present in server-rendered HTML.
- [ ] Largest images are optimized and have explicit dimensions.
- [ ] No missing static asset creates 404 noise, such as a missing demo video.

### Structured data

- [ ] Organization structured data is present.
- [ ] WebSite structured data is present.
- [ ] SoftwareApplication structured data is present for Walnut.
- [ ] Future blog posts use Article structured data.
- [ ] Future core topic pages use WebPage and BreadcrumbList structured data.

Definition of done:

- [ ] Homepage, sitemap, and robots pass external checks.
- [ ] Search Console URL Inspection has no blocking issue for the homepage.
- [ ] Search Console sitemap status is `Success`.

## Phase 2: Core topic pages

Objective: build stable landing pages that own the main topics. These pages
should be stronger than individual blog posts and should receive most internal
and external links.

### Page 1: `/llm-wiki`

Primary purpose: recover and expand from `walnut llm wiki`.

Target keywords:

- [ ] `walnut llm wiki`
- [ ] `Walnut LLM Wiki`
- [ ] `LLM wiki`
- [ ] `AI wiki`
- [ ] `LLM knowledge management`
- [ ] `AI knowledge base for agents`

Content checklist:

- [ ] H1 clearly includes `LLM Wiki`.
- [ ] First paragraph defines Walnut as a local-first LLM Wiki.
- [ ] Explain what an LLM Wiki is.
- [ ] Explain why AI agents need structured personal context.
- [ ] Explain how Walnut differs from a normal notes app.
- [ ] Include 3-5 practical use cases.
- [ ] Include a comparison section: notes app vs LLM Wiki.
- [ ] Include FAQ with real questions.
- [ ] Link to homepage.
- [ ] Link to `/ai-agent-memory`.
- [ ] Link to `/knowledge-management`.
- [ ] Link to 2-3 supporting blog posts after they exist.
- [ ] Add CTA: download, login, or join.

Definition of done:

- [ ] Page is listed in sitemap.
- [ ] Page has canonical URL.
- [ ] Page can be requested for indexing in Search Console.
- [ ] At least 3 internal links point to this page.
- [ ] At least 3 external links or mentions eventually point to this page.

### Page 2: `/ai-agent-memory`

Primary purpose: capture the AI agent memory trend and connect it to Walnut.

Target keywords:

- [ ] `AI agent memory`
- [ ] `personal AI agent memory`
- [ ] `long-term memory for AI agents`
- [ ] `AI memory layer`
- [ ] `agent memory layer`
- [ ] `AI context management`

Content checklist:

- [ ] H1 clearly includes `AI Agent Memory`.
- [ ] Explain short-term context vs long-term memory.
- [ ] Explain why personal knowledge is better than generic model memory for
      private workflows.
- [ ] Explain how Walnut can serve as a memory layer.
- [ ] Include examples: research, writing, coding, planning, personal CRM.
- [ ] Include a section on privacy and local-first storage.
- [ ] Include FAQ.
- [ ] Link to `/llm-wiki`.
- [ ] Link to `/knowledge-management`.
- [ ] Link to future article `/blogs/rag-vs-agent-memory`.

Definition of done:

- [ ] Page is listed in sitemap.
- [ ] Page has canonical URL.
- [ ] Page can be requested for indexing.
- [ ] At least 2 external discussions link to this page within 30 days.

### Page 3: `/knowledge-management`

Primary purpose: connect Walnut to the broader knowledge management category.

Target keywords:

- [ ] `AI knowledge management`
- [ ] `personal AI knowledge base`
- [ ] `knowledge management for AI`
- [ ] `AI second brain`
- [ ] `local-first second brain`
- [ ] `personal knowledge management for AI`

Content checklist:

- [ ] H1 clearly includes `AI Knowledge Management`.
- [ ] Define knowledge management in the Walnut context.
- [ ] Explain capture, organization, retrieval, and AI usage.
- [ ] Explain why local-first matters.
- [ ] Include workflow examples.
- [ ] Include comparison with traditional PKM.
- [ ] Include FAQ.
- [ ] Link to `/llm-wiki`.
- [ ] Link to `/ai-agent-memory`.
- [ ] Link to homepage CTA.

Definition of done:

- [ ] Page is listed in sitemap.
- [ ] Page has canonical URL.
- [ ] Page gets internal links from homepage and blog posts.

### Page 4: `/local-first-ai`

Primary purpose: differentiate Walnut on privacy, ownership, and local-first AI.

Target keywords:

- [ ] `local-first AI`
- [ ] `local-first AI knowledge base`
- [ ] `private AI knowledge base`
- [ ] `privacy-first AI tools`
- [ ] `private AI memory`
- [ ] `local-first second brain`

Content checklist:

- [ ] H1 clearly includes `Local-first AI`.
- [ ] Define local-first in plain language.
- [ ] Explain why local-first is important for personal AI memory.
- [ ] Explain tradeoffs: privacy, sync, reliability, collaboration.
- [ ] Explain what Walnut does today and avoid claiming features that do not
      exist yet.
- [ ] Include FAQ.
- [ ] Link to `/llm-wiki`.
- [ ] Link to `/ai-agent-memory`.
- [ ] Link to `/knowledge-management`.

Definition of done:

- [ ] Page is listed in sitemap.
- [ ] Page has canonical URL.
- [ ] Page is suitable for self-hosted, privacy, and local-first communities.

## Phase 3: Static blog system

Objective: create a maintainable system for publishing content without changing
SEO infrastructure each time.

Recommended architecture:

```text
content/blogs/*.mdx
  -> lib/content/blogs.ts
  -> app/blogs/page.tsx
  -> app/blogs/[slug]/page.tsx
  -> lib/seo/routes.ts or sitemap content source
  -> app/sitemap.ts
```

Required fields for every post:

- [ ] `title`
- [ ] `description`
- [ ] `slug`
- [ ] `publishedAt`
- [ ] `updatedAt`
- [ ] `author`
- [ ] `tags`
- [ ] `targetKeywords`
- [ ] `canonical`
- [ ] `summary`
- [ ] `heroImage` if available

Blog index checklist:

- [ ] `/blogs` lists all published posts.
- [ ] `/blogs` is listed in sitemap.
- [ ] `/blogs` links to `/llm-wiki`, `/ai-agent-memory`, and
      `/knowledge-management`.
- [ ] Posts are grouped by theme, not only by date.
- [ ] Each card has title, description, date, and tags.

Article page checklist:

- [ ] Every post has unique title and meta description.
- [ ] Every post has canonical URL.
- [ ] Every post has Article structured data.
- [ ] Every post has BreadcrumbList structured data.
- [ ] Every post links to one core topic page.
- [ ] Every post links to two related posts once available.
- [ ] Every post has CTA.
- [ ] Every post is added to sitemap automatically.

Definition of done:

- [ ] Publishing a new MDX post automatically creates a route.
- [ ] Publishing a new MDX post automatically updates sitemap.
- [ ] Build fails if required metadata is missing.
- [ ] No manual sitemap editing is needed for future posts.

## Phase 4: First content cluster

Objective: publish a small number of strong articles that support the core topic
pages. Do not publish low-quality filler.

### Article 1

- [ ] Slug: `/blogs/what-is-an-llm-wiki`
- [ ] Title: `What Is an LLM Wiki? A Knowledge Base Built for AI Agents`
- [ ] Target page: `/llm-wiki`
- [ ] Target keywords:
      - [ ] `what is an LLM wiki`
      - [ ] `LLM wiki`
      - [ ] `AI wiki`
      - [ ] `AI knowledge base for agents`
- [ ] Must include:
      - [ ] Definition.
      - [ ] Difference from traditional wikis.
      - [ ] Difference from notes apps.
      - [ ] Walnut positioning.
      - [ ] CTA to `/llm-wiki`.

### Article 2

- [ ] Slug: `/blogs/personal-ai-agent-memory`
- [ ] Title: `Why Personal AI Agents Need Long-Term Memory`
- [ ] Target page: `/ai-agent-memory`
- [ ] Target keywords:
      - [ ] `personal AI agent memory`
      - [ ] `long-term memory for AI agents`
      - [ ] `AI memory layer`
      - [ ] `AI context management`
- [ ] Must include:
      - [ ] Short-term context vs long-term memory.
      - [ ] Personal examples.
      - [ ] Privacy risks.
      - [ ] Link to `/ai-agent-memory`.

### Article 3

- [ ] Slug: `/blogs/local-first-ai-knowledge-management`
- [ ] Title: `Local-first AI Knowledge Management: Why Your AI Memory Should Stay Private`
- [ ] Target page: `/local-first-ai`
- [ ] Target keywords:
      - [ ] `local-first AI knowledge management`
      - [ ] `private AI knowledge base`
      - [ ] `privacy-first AI tools`
      - [ ] `local-first second brain`
- [ ] Must include:
      - [ ] Local-first definition.
      - [ ] Ownership and privacy angle.
      - [ ] Tradeoffs.
      - [ ] Link to `/local-first-ai`.

### Article 4

- [ ] Slug: `/blogs/rag-vs-agent-memory`
- [ ] Title: `RAG vs Agent Memory: Why Personal Context Needs More Than Retrieval`
- [ ] Target page: `/ai-agent-memory`
- [ ] Target keywords:
      - [ ] `RAG vs agent memory`
      - [ ] `agentic RAG`
      - [ ] `AI agent memory`
      - [ ] `personal context layer`
- [ ] Must include:
      - [ ] RAG definition.
      - [ ] Agent memory definition.
      - [ ] Where they overlap.
      - [ ] Where Walnut fits.
      - [ ] Developer-oriented diagrams or examples.

### Article 5

- [ ] Slug: `/blogs/mcp-personal-knowledge-base`
- [ ] Title: `MCP and Personal Knowledge Bases: A Context Layer for AI Tools`
- [ ] Target page: `/llm-wiki`
- [ ] Target keywords:
      - [ ] `MCP knowledge base`
      - [ ] `MCP server for personal knowledge`
      - [ ] `AI context layer`
      - [ ] `context engineering`
- [ ] Must include:
      - [ ] Explain MCP as context plumbing.
      - [ ] Explain personal knowledge as context.
      - [ ] Clearly separate current Walnut features from future possibilities.
      - [ ] Do not claim MCP support unless implemented.

### Article 6

- [ ] Slug: `/blogs/private-ai-knowledge-base`
- [ ] Title: `Private AI Knowledge Bases: How to Use Personal Data Without Giving Up Control`
- [ ] Target page: `/local-first-ai`
- [ ] Target keywords:
      - [ ] `private AI knowledge base`
      - [ ] `private AI memory`
      - [ ] `personal AI knowledge base`
      - [ ] `privacy-first AI`
- [ ] Must include:
      - [ ] Risk of uploading everything to cloud tools.
      - [ ] Local-first alternative.
      - [ ] Practical workflow.
      - [ ] Link to `/local-first-ai`.

Definition of done for the cluster:

- [ ] All 6 articles are published.
- [ ] All 6 articles are in sitemap.
- [ ] All 6 articles link back to their target core page.
- [ ] All 6 articles have Article structured data.
- [ ] Search Console indexing is requested for each article.

## Phase 5: Internal linking

Objective: help Google understand the relationship between pages.

Homepage links:

- [ ] Add visible link to `/llm-wiki`.
- [ ] Add visible link to `/knowledge-management`.
- [ ] Add visible link to `/ai-agent-memory`.
- [ ] Add visible link to `/blogs`.

Core page links:

- [ ] `/llm-wiki` links to `/ai-agent-memory`.
- [ ] `/llm-wiki` links to `/knowledge-management`.
- [ ] `/llm-wiki` links to at least 2 related blog posts.
- [ ] `/ai-agent-memory` links to `/llm-wiki`.
- [ ] `/ai-agent-memory` links to `/local-first-ai`.
- [ ] `/knowledge-management` links to `/llm-wiki`.
- [ ] `/knowledge-management` links to `/local-first-ai`.
- [ ] `/local-first-ai` links to `/ai-agent-memory`.

Anchor text rules:

- [ ] Use descriptive anchors like `LLM Wiki`, `AI agent memory`, and
      `local-first AI knowledge base`.
- [ ] Avoid vague anchors like `click here`, `read more`, and `learn more`
      when SEO context matters.
- [ ] Keep anchors natural; do not repeat the same exact keyword everywhere.

Definition of done:

- [ ] Every public SEO page is reachable within 2-3 clicks from the homepage.
- [ ] Every article links to a core topic page.
- [ ] Every core topic page receives internal links from homepage and articles.

## Phase 6: External links and mentions

Objective: create relevant discovery paths and trust signals without spam.

### Link asset priorities

Use this target order:

1. [ ] `/llm-wiki`
2. [ ] `/ai-agent-memory`
3. [ ] `/local-first-ai`
4. [ ] `/blogs/rag-vs-agent-memory`
5. [ ] `/blogs/mcp-personal-knowledge-base`
6. [ ] Homepage

### Anchor text mix

Maintain a natural distribution:

- [ ] 50% brand or naked URL:
      - [ ] `Walnut`
      - [ ] `Walnut by EvoFarm`
      - [ ] `walnut.evofarm.top`
      - [ ] `https://walnut.evofarm.top`
- [ ] 25% category phrase:
      - [ ] `local-first LLM Wiki`
      - [ ] `AI knowledge base`
      - [ ] `personal AI agent memory`
      - [ ] `private AI knowledge management`
- [ ] 15% page-title phrase:
      - [ ] `What is an LLM Wiki?`
      - [ ] `AI Agent Memory`
      - [ ] `Local-first AI Knowledge Management`
- [ ] 10% exact keyword:
      - [ ] `Walnut LLM Wiki`
      - [ ] `LLM Wiki`

### Week 1: owned and controlled links

- [ ] Add Walnut link from EvoFarm main website.
      - [ ] Target URL: `/llm-wiki` or homepage.
      - [ ] Suggested text: `Walnut, a local-first LLM Wiki for personal AI memory`.
- [ ] Add Walnut link to GitHub profile.
      - [ ] Target URL: homepage.
- [ ] Add Walnut link to relevant GitHub README.
      - [ ] Target URL: `/llm-wiki`.
      - [ ] Suggested text: `Walnut - a local-first LLM Wiki for personal AI agent memory`.
- [ ] Add Walnut link to GitHub release notes if desktop/app releases exist.
      - [ ] Target URL: `/download` or homepage.
- [ ] Add Walnut link to internal docs/changelog where appropriate.
      - [ ] Target URL: `/llm-wiki`.

Definition of done:

- [ ] At least 5 owned or controlled external links are live.
- [ ] At least 2 links point to `/llm-wiki`.

### Week 2: product and builder communities

- [ ] Prepare Product Hunt listing.
      - [ ] Primary URL: homepage.
      - [ ] Secondary reference: `/llm-wiki`.
      - [ ] Tagline: `A local-first LLM Wiki for personal AI agent memory`.
- [ ] Prepare Hacker News post.
      - [ ] Suggested title:
            `Show HN: Walnut - a local-first LLM Wiki for personal AI memory`.
      - [ ] Primary URL: `/llm-wiki`.
      - [ ] Avoid sales copy; emphasize technical tradeoffs.
- [ ] Prepare Indie Hackers post.
      - [ ] Topic: building a local-first knowledge base for AI agents.
      - [ ] Target URL: `/ai-agent-memory`.
- [ ] Prepare Dev.to article.
      - [ ] Topic: `RAG vs Agent Memory`.
      - [ ] Target URL: `/blogs/rag-vs-agent-memory`.
- [ ] Prepare Substack or Medium article.
      - [ ] Topic: why AI needs a local-first second brain.
      - [ ] Link back to `/local-first-ai`.

Definition of done:

- [ ] At least 3 community/product posts are published.
- [ ] At least one post points to `/llm-wiki`.
- [ ] At least one post points to `/ai-agent-memory`.

### Week 3: directories and resource lists

Only submit to relevant, human-reviewed resources.

- [ ] Submit to Product Hunt alternatives or startup directories.
- [ ] Submit to AI tool directories with real traffic.
- [ ] Submit to local-first software directories if Walnut fits.
- [ ] Submit to PKM or productivity directories if Walnut fits.
- [ ] Find 10 relevant GitHub awesome lists:
      - [ ] `awesome-ai-agents`
      - [ ] `awesome-rag`
      - [ ] `awesome-local-first`
      - [ ] `awesome-productivity`
      - [ ] `awesome-pkm`
      - [ ] `awesome-knowledge-management`
      - [ ] `awesome-llm-apps`
      - [ ] other relevant lists
- [ ] Submit 3 high-quality PRs to relevant awesome lists.

Definition of done:

- [ ] At least 5 directory submissions are completed.
- [ ] At least 3 awesome-list PRs are opened.
- [ ] Descriptions are accurate and do not claim unsupported features.

### Week 4: vertical communities

Do not spam. Share useful thinking, diagrams, or lessons.

- [ ] Reddit `r/PKMS`
      - [ ] Angle: should personal knowledge management become AI memory?
      - [ ] Target URL: `/knowledge-management` or `/ai-agent-memory`.
- [ ] Reddit `r/selfhosted`
      - [ ] Angle: local-first/private AI knowledge base tradeoffs.
      - [ ] Target URL: `/local-first-ai`.
- [ ] Reddit `r/LocalLLaMA`
      - [ ] Angle: long-term context and local models.
      - [ ] Target URL: `/ai-agent-memory`.
- [ ] Obsidian or PKM communities
      - [ ] Angle: notes vs LLM wiki.
      - [ ] Target URL: `/llm-wiki`.
- [ ] AI agent communities
      - [ ] Angle: agent memory layer.
      - [ ] Target URL: `/ai-agent-memory`.

Definition of done:

- [ ] At least 3 useful community posts are published.
- [ ] Each post contains a real discussion point, not only a product link.

### Weeks 5-8: partnership outreach

- [ ] Build a list of 30 potential partners:
      - [ ] PKM bloggers.
      - [ ] Obsidian plugin authors.
      - [ ] AI agent builders.
      - [ ] MCP tool builders.
      - [ ] local-first software builders.
      - [ ] AI productivity newsletter authors.
- [ ] Send 10 personalized outreach messages.
- [ ] Offer one of these assets:
      - [ ] guest article.
      - [ ] product demo.
      - [ ] technical diagram.
      - [ ] quote for their article.
      - [ ] comparison table.
      - [ ] case study.
- [ ] Ask for feedback before asking for a link.
- [ ] Track responses and published mentions.

Definition of done:

- [ ] At least 10 outreach messages sent.
- [ ] At least 3 replies received.
- [ ] At least 1 high-quality contextual mention or link published.

## Phase 7: Hot keyword backlog

Use this list to decide future pages and articles. Do not create a page unless
you can answer the search intent better than existing results.

### P0: recovery and brand-category binding

| Keyword | Intent | Target URL | Status |
| --- | --- | --- | --- |
| `walnut llm wiki` | brand recovery | `/` and `/llm-wiki` | [ ] |
| `Walnut LLM Wiki` | brand recovery | `/llm-wiki` | [ ] |
| `walnut ai wiki` | brand category | `/llm-wiki` | [ ] |
| `walnut knowledge management` | brand category | `/knowledge-management` | [ ] |
| `walnut second brain` | brand category | `/knowledge-management` | [ ] |

### P1: category pages

| Keyword | Intent | Target URL | Status |
| --- | --- | --- | --- |
| `LLM wiki` | category | `/llm-wiki` | [ ] |
| `AI knowledge base` | category | `/knowledge-management` | [ ] |
| `personal AI knowledge base` | high-intent category | `/knowledge-management` | [ ] |
| `AI knowledge management` | category | `/knowledge-management` | [ ] |
| `private AI knowledge base` | differentiation | `/local-first-ai` | [ ] |
| `local-first AI knowledge base` | differentiation | `/local-first-ai` | [ ] |
| `AI agent memory` | category trend | `/ai-agent-memory` | [ ] |
| `personal AI agent memory` | high-intent trend | `/ai-agent-memory` | [ ] |
| `long-term memory for AI agents` | educational | `/ai-agent-memory` | [ ] |
| `AI context management` | category trend | `/ai-agent-memory` | [ ] |

### P2: developer and trend articles

| Keyword | Intent | Target URL | Status |
| --- | --- | --- | --- |
| `RAG vs agent memory` | comparison | `/blogs/rag-vs-agent-memory` | [ ] |
| `agentic RAG` | technical | `/blogs/rag-vs-agent-memory` | [ ] |
| `MCP knowledge base` | developer trend | `/blogs/mcp-personal-knowledge-base` | [ ] |
| `MCP server for personal knowledge` | developer trend | `/blogs/mcp-personal-knowledge-base` | [ ] |
| `context engineering` | developer trend | future blog | [ ] |
| `personal context layer for AI` | developer trend | future blog | [ ] |

### P3: comparison and alternative pages

| Keyword | Intent | Target URL | Status |
| --- | --- | --- | --- |
| `Obsidian AI knowledge base` | comparison | future blog | [ ] |
| `Notion AI knowledge base` | comparison | future blog | [ ] |
| `Obsidian vs Notion vs Walnut` | comparison | future blog | [ ] |
| `best AI knowledge base app` | commercial | future page or blog | [ ] |
| `AI second brain` | category | `/knowledge-management` | [ ] |

## Phase 8: Weekly Search Console loop

Run this every week after pages are live.

### Data pull

- [ ] Open Search Console.
- [ ] Export queries for the last 7 days.
- [ ] Export pages for the last 7 days.
- [ ] Filter queries containing:
      - [ ] `walnut`
      - [ ] `llm`
      - [ ] `wiki`
      - [ ] `knowledge`
      - [ ] `agent`
      - [ ] `memory`
      - [ ] `local`
      - [ ] `mcp`
      - [ ] `rag`

### Decision rules

- [ ] If a page has impressions but low CTR:
      - [ ] Improve title.
      - [ ] Improve meta description.
      - [ ] Make search intent clearer in H1.
- [ ] If a page ranks position 8-20:
      - [ ] Add examples.
      - [ ] Add FAQ.
      - [ ] Add internal links from related pages.
      - [ ] Add one external mention if possible.
- [ ] If a page ranks position 20-50:
      - [ ] Recheck intent match.
      - [ ] Add deeper sections.
      - [ ] Consider whether the keyword needs a separate page.
- [ ] If a page has no impressions after 2-4 weeks:
      - [ ] Confirm indexing.
      - [ ] Confirm sitemap inclusion.
      - [ ] Add internal links.
      - [ ] Add one external discovery path.
- [ ] If a query receives impressions but no matching page exists:
      - [ ] Add it to the keyword backlog.
      - [ ] Decide whether to update an existing page or create a new article.

### Weekly report template

```text
Week:
Pages indexed:
Top queries:
Top pages:
New impressions:
Queries with low CTR:
Pages improved:
New links or mentions:
Next week's priority:
```

Definition of done:

- [ ] Weekly report is saved.
- [ ] At least one page improvement is completed or scheduled.
- [ ] At least one external discovery action is completed or scheduled.

## Phase 9: Quality gates before publishing

Apply to every new public page.

Content quality:

- [ ] The page answers a real user question.
- [ ] The page has a clear search intent.
- [ ] The page says something specific to Walnut.
- [ ] The page avoids unsupported claims.
- [ ] The page is not just a rewritten summary of existing search results.
- [ ] The page has examples, workflows, or comparisons.
- [ ] The page has a clear next action.

SEO quality:

- [ ] Unique title.
- [ ] Unique meta description.
- [ ] One H1.
- [ ] Canonical URL.
- [ ] Open Graph metadata.
- [ ] Sitemap inclusion.
- [ ] Structured data if relevant.
- [ ] Internal links in and out.
- [ ] No accidental `noindex`.

Technical quality:

- [ ] Page returns HTTP 200.
- [ ] Page renders important content in HTML.
- [ ] No critical console errors.
- [ ] No missing images or media.
- [ ] Mobile layout is readable.
- [ ] Build and lint pass before deployment.

## Phase 10: What not to do

- [ ] Do not buy backlink packages.
- [ ] Do not create PBN links.
- [ ] Do not submit to hundreds of low-quality directories.
- [ ] Do not publish thin AI-generated articles.
- [ ] Do not create many near-duplicate keyword pages.
- [ ] Do not fake product features for hot keywords like MCP.
- [ ] Do not use the same exact anchor text for every external link.
- [ ] Do not include private/login pages in sitemap.
- [ ] Do not update article dates without meaningful content updates.
- [ ] Do not judge SEO success in less than a few weeks unless it is a technical
      indexing issue.

## Immediate next actions

Complete these first:

1. [ ] Confirm current Search Console baseline.
2. [ ] Finalize `/llm-wiki` page brief.
3. [ ] Finalize `/ai-agent-memory` page brief.
4. [ ] Finalize `/knowledge-management` page brief.
5. [ ] Decide whether `/local-first-ai` ships in the first batch or second
       batch.
6. [ ] Prepare first 5 owned external links.
7. [ ] Build the static blog architecture only after the core pages are scoped.
8. [ ] Publish the first content cluster.
9. [ ] Start external distribution.
10. [ ] Run the weekly Search Console loop.

