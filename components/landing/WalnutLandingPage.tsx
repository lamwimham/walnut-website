"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import DownloadButtons from "@/components/DownloadButtons";
import { WALNUT_DOWNLOAD_MANIFEST_URL } from "@/lib/downloads/config";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { landingContent, type LandingLocale } from "./landingContent";
import styles from "./WalnutLandingPage.module.css";

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

function cn(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

function useLandingCopy() {
  const { locale, setLocale } = useI18n();
  const landingLocale: LandingLocale = locale === "zh" ? "zh" : "en";
  return {
    copy: landingContent[landingLocale],
    locale,
    setLocale,
  };
}

function scrollToId(href: string) {
  if (!href.startsWith("#")) return;
  const target = document.querySelector(href);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function LocaleToggle({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  return (
    <div className={styles.localeToggle} aria-label="Language">
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          className={cn(styles.localeButton, locale === item && styles.localeButtonActive)}
          onClick={() => setLocale(item)}
          aria-pressed={locale === item}
        >
          {LOCALE_LABELS[item]}
        </button>
      ))}
    </div>
  );
}

function Header() {
  const { copy, locale, setLocale } = useLandingCopy();

  return (
    <header className={styles.header}>
      <a className={styles.brand} href="#top" onClick={(event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}>
        <span className={styles.logoMark}>
          <Image src="/logo.svg" width={28} height={28} alt="Walnut logo" priority />
        </span>
        <span>Walnut</span>
      </a>

      <nav className={styles.nav} aria-label="Primary navigation">
        {copy.nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => {
              event.preventDefault();
              scrollToId(item.href);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className={styles.headerActions}>
        <a className={styles.quietLink} href="/llms.txt">{copy.llms}</a>
        <a className={styles.accountLink} href="/login">{copy.account}</a>
        <LocaleToggle locale={locale} setLocale={setLocale} />
      </div>
    </header>
  );
}

function HeroMockup() {
  const { copy } = useLandingCopy();
  const m = copy.mockup;

  return (
    <div className={styles.mockupShell} aria-label="Walnut LLM wiki workspace preview">
      <div className={styles.desktopFrame}>
        <div className={styles.mockupBar}>
          <span />
          <span />
          <span />
          <em>Walnut Wiki</em>
        </div>
        <div className={styles.workspaceGrid}>
          <aside className={styles.inboxPane}>
            <p>{m.inbox}</p>
            <small>{m.today}</small>
            <div className={styles.selectedRow}>{m.selected}</div>
            <div className={styles.indexRows}>
              {m.contextItems.slice(0, 3).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </aside>
          <main className={styles.editorPane}>
            <div className={styles.editorMeta}>{m.contextTitle}</div>
            <h3>{m.editorTitle}</h3>
            <div className={styles.editorBody}>
              {m.editorLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className={styles.tagLine}>
              {m.contextItems.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </main>
          <aside className={styles.contextPane}>
            <p>{m.contextTitle}</p>
            <div className={styles.memoryRows}>
              {m.contextItems.map((item, index) => (
                <span key={item}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  {item}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <div className={styles.mobileSlip}>
        <div className={styles.mobileTop}>
          <span className={styles.mobileHandle} />
          <em>{m.mobileTitle}</em>
        </div>
        <p>{m.selected}</p>
        <div className={styles.mobileActions}>
          {m.mobileActions.map((action) => (
            <span key={action}>{action}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  const { copy } = useLandingCopy();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="top" className={styles.heroSection}>
      <motion.div
        className={styles.heroCopy}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        variants={reveal}
        transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className={styles.eyebrow}>{copy.hero.eyebrow}</p>
        <h1>
          {copy.hero.title}
          <span>{copy.hero.titleAccent}</span>
        </h1>
        <div className={styles.heroActions} id="download">
          <DownloadButtons
            repoOwner="lamwimham"
            repoName="walnut-releases"
            productName="Walnut"
            fallbackLabel={copy.hero.primary}
            mirrorManifestUrl={WALNUT_DOWNLOAD_MANIFEST_URL}
            showVersion={false}
            className={styles.downloadButtons}
          />
          <a
            className={styles.secondaryButton}
            href="#capture"
            onClick={(event) => {
              event.preventDefault();
              scrollToId("#capture");
            }}
          >
            {copy.hero.secondary}
          </a>
        </div>
        <div className={styles.proofLine}>
          {copy.hero.proof.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </motion.div>

      <motion.div
        className={styles.heroVisual}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.78, delay: shouldReduceMotion ? 0 : 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <HeroMockup />
      </motion.div>
    </section>
  );
}

function ThesisSection() {
  const { copy } = useLandingCopy();
  const section = copy.thesis;

  return (
    <section id="thesis" className={styles.editorialSection}>
      <div className={styles.sectionHead}>
        <p className={styles.eyebrow}>{section.kicker}</p>
        <h2>{section.title}</h2>
        <p>{section.copy}</p>
      </div>
      <div className={styles.thesisRows}>
        {section.points.map((point) => (
          <article key={point.label} className={styles.thesisRow}>
            <span>{point.label}</span>
            <h3>{point.title}</h3>
            <p>{point.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CaptureSection() {
  const { copy } = useLandingCopy();
  const section = copy.capture;

  return (
    <section id="capture" className={cn(styles.editorialSection, styles.captureSection)}>
      <div className={styles.splitIntro}>
        <div>
          <p className={styles.eyebrow}>{section.kicker}</p>
          <h2>{section.title}</h2>
        </div>
        <p>{section.copy}</p>
      </div>

      <div className={styles.captureBoard}>
        <div className={styles.phonePreview}>
          <div className={styles.phoneTop} />
          <div className={styles.noteText}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.noteToolbar}>
            {section.modes.map((mode) => (
              <button key={mode.title} type="button">{mode.title}</button>
            ))}
          </div>
        </div>
        <div className={styles.captureModes}>
          {section.modes.map((mode) => (
            <article key={mode.title}>
              <h3>{mode.title}</h3>
              <p>{mode.body}</p>
            </article>
          ))}
          <p className={styles.inlineNote}>{section.note}</p>
        </div>
      </div>
    </section>
  );
}

function WorkspaceSection() {
  const { copy } = useLandingCopy();
  const section = copy.workspace;

  return (
    <section id="workspace" className={styles.editorialSection}>
      <div className={styles.workspaceLayout}>
        <div className={styles.sectionHeadCompact}>
          <p className={styles.eyebrow}>{section.kicker}</p>
          <h2>{section.title}</h2>
          <p>{section.copy}</p>
        </div>
        <div className={styles.rulesList}>
          {section.principles.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntelligenceSection() {
  const { copy } = useLandingCopy();
  const section = copy.intelligence;

  return (
    <section id="intelligence" className={cn(styles.editorialSection, styles.intelligenceSection)}>
      <div className={styles.sectionHead}>
        <p className={styles.eyebrow}>{section.kicker}</p>
        <h2>{section.title}</h2>
        <p>{section.copy}</p>
      </div>
      <div className={styles.timeline}>
        {section.steps.map((step) => (
          <article key={step.label}>
            <span>{step.label}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PricingSection() {
  const { copy } = useLandingCopy();
  const section = copy.pricing;

  return (
    <section id="pricing" className={styles.editorialSection}>
      <div className={styles.splitIntro}>
        <div>
          <p className={styles.eyebrow}>{section.kicker}</p>
          <h2>{section.title}</h2>
        </div>
        <p>{section.copy}</p>
      </div>
      <p className={styles.betaNotice}>{section.beta}</p>
      <div className={styles.pricingTable}>
        {section.plans.map((plan) => (
          <article key={plan.name} className={cn(styles.planColumn, plan.featured && styles.planFeatured)}>
            <div>
              <div className={styles.planPrice}>
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
            </div>
            <ul>
              {plan.rows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
            <a className={styles.planAction} href={plan.href}>{plan.cta}</a>
          </article>
        ))}
      </div>
      <p className={styles.pricingNote}>{section.note}</p>
    </section>
  );
}

function FinalSection() {
  const { copy } = useLandingCopy();
  const final = copy.final;

  return (
    <section className={cn(styles.editorialSection, styles.finalSection)}>
      <p className={styles.eyebrow}>{final.kicker}</p>
      <h2>{final.title}</h2>
      <p>{final.copy}</p>
      <DownloadButtons
        repoOwner="lamwimham"
        repoName="walnut-releases"
        productName="Walnut"
        fallbackLabel={final.downloadLabel}
        mirrorManifestUrl={WALNUT_DOWNLOAD_MANIFEST_URL}
        className={styles.footerDownloads}
      />
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Image src="/logo.svg" width={24} height={24} alt="Walnut logo" />
          <span>Walnut</span>
          <em>An Agent by <a href="https://www.evofarm.top" target="_blank" rel="noreferrer">EvoFarm</a></em>
        </div>
        <div className={styles.footerBadges}>
          {final.badges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        <a className={styles.footerLink} href={`mailto:lianwimham@gmail.com?subject=${encodeURIComponent("Walnut Feedback")}`}>
          {final.feedback}
        </a>
      </footer>
    </section>
  );
}

export default function WalnutLandingPage() {
  return (
    <main className={styles.landing}>
      <Header />
      <HeroSection />
      <ThesisSection />
      <CaptureSection />
      <WorkspaceSection />
      <IntelligenceSection />
      <PricingSection />
      <FinalSection />
    </main>
  );
}
