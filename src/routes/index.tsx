import { useCallback, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion, type Variants } from "motion/react"
import {
  BookOpen,
  Coffee,
  Contact,
  FileText,
  Flag,
  PaintRoller,
  Presentation,
  Scissors,
  Shirt,
  Sparkles,
  Sticker,
  Tag,
} from "lucide-react"
import type { ComponentType, SVGProps } from "react"

const EASE = [0.16, 1, 0.3, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE },
  },
}

const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
}

const heroLine: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: EASE },
  },
}

const viewport = { once: true, amount: 0.2 } as const

const softSpring = { type: "spring", stiffness: 220, damping: 26, mass: 0.9 } as const

const btnInteraction = {
  whileHover: { y: -2, transition: softSpring },
  whileTap: { y: 0, scale: 0.97, transition: softSpring },
}

export const Route = createFileRoute("/")({ component: TechMonkeysHome })

type Service = {
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const SERVICES: Array<Service> = [
  { label: "SIGNS", Icon: Presentation },
  { label: "STICKERS", Icon: Sticker },
  { label: "LABELS", Icon: Tag },
  { label: "DTF", Icon: Shirt },
  { label: "EMBROIDERY", Icon: Scissors },
  { label: "ENGRAVING", Icon: Sparkles },
  { label: "SCREEN PRINTING", Icon: PaintRoller },
  { label: "PROMO ITEMS", Icon: Coffee },
  { label: "FLYERS", Icon: FileText },
  { label: "BUSINESS CARDS", Icon: Contact },
  { label: "BANNERS", Icon: Flag },
  { label: "BROCHURES", Icon: BookOpen },
]

function MonkeyMark({ size = 46 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      {/* colorful hair tufts */}
      <path d="M18 14 L20 2 L24 14 Z" fill="#00BCEB" />
      <path d="M24 14 L28 0 L32 14 Z" fill="#EC008C" />
      <path d="M32 14 L36 0 L40 14 Z" fill="#FFD500" />
      <path d="M40 14 L44 2 L46 14 Z" fill="#F2641F" />
      {/* head */}
      <ellipse
        cx="32"
        cy="38"
        rx="20"
        ry="19"
        fill="#0a0a0a"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {/* face mask */}
      <path
        d="M32 24 c-9 0 -15 7 -15 15 c0 9 7 14 15 14 c8 0 15 -5 15 -14 c0 -8 -6 -15 -15 -15z"
        fill="#f3efe7"
      />
      {/* ears */}
      <circle cx="12" cy="36" r="5.5" fill="#0a0a0a" />
      <circle cx="52" cy="36" r="5.5" fill="#0a0a0a" />
      <circle cx="12" cy="36" r="2.4" fill="#f3efe7" />
      <circle cx="52" cy="36" r="2.4" fill="#f3efe7" />
      {/* eyes */}
      <circle cx="26" cy="36" r="2.4" fill="#0a0a0a" />
      <circle cx="38" cy="36" r="2.4" fill="#0a0a0a" />
      {/* smile */}
      <path
        d="M27 46 q5 4 10 0"
        fill="none"
        stroke="#0a0a0a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* nostrils */}
      <circle cx="30" cy="42" r="0.9" fill="#0a0a0a" />
      <circle cx="34" cy="42" r="0.9" fill="#0a0a0a" />
    </svg>
  )
}

function smoothScrollTo(targetY: number, duration = 900) {
  if (typeof window === "undefined") return
  const prefersReduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches
  if (prefersReduce) {
    window.scrollTo({ top: targetY })
    return
  }
  const startY = window.scrollY
  const diff = targetY - startY
  if (Math.abs(diff) < 1) return
  const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
  let start: number | null = null
  const step = (ts: number) => {
    if (start === null) start = ts
    const t = Math.min((ts - start) / duration, 1)
    window.scrollTo(0, startY + diff * easeOutExpo(t))
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function TechMonkeysHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  const marqueeItems = [...SERVICES, ...SERVICES]

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      let el = e.target as HTMLElement | null
      while (el && el !== e.currentTarget) {
        if (el instanceof HTMLAnchorElement) break
        el = el.parentElement
      }
      if (!(el instanceof HTMLAnchorElement)) return
      const href = el.getAttribute("href")
      if (!href || !href.startsWith("#") || href === "#") return
      const target = document.querySelector(href)
      if (!(target instanceof HTMLElement)) return
      e.preventDefault()
      const navOffset = 88
      const top =
        target.getBoundingClientRect().top + window.scrollY - navOffset
      smoothScrollTo(top, 950)
      setMenuOpen(false)
    },
    [],
  )

  return (
    <div className="tm-page" onClick={handleAnchorClick}>
      {/* ===================== NAV ===================== */}
      <header className="tm-nav">
        <div className="tm-nav-inner">
          <a href="#home" className="tm-brand" aria-label="Tech Monkeys home">
            <span className="tm-brand-mark" aria-hidden="true">
              <MonkeyMark size={46} />
            </span>
            <span className="tm-brand-word">
              <span className="tm-brand-line1">TECH MONKEYS</span>
              <span className="tm-brand-line2">GRAPHICS SOLUTIONS</span>
            </span>
          </a>

          <nav
            className="tm-primary"
            aria-label="Primary"
            style={menuOpen ? { display: "block" } : undefined}
          >
            <ul>
              <li>
                <a href="#home" className="tm-active">
                  HOME
                </a>
              </li>
              <li>
                <a href="#services">
                  SERVICES <span className="tm-caret">▾</span>
                </a>
              </li>
              <li>
                <a href="#products">
                  PRODUCTS <span className="tm-caret">▾</span>
                </a>
              </li>
              <li>
                <a href="#portfolio">PORTFOLIO</a>
              </li>
              <li>
                <a href="#about">ABOUT US</a>
              </li>
              <li>
                <a href="#contact">CONTACT</a>
              </li>
            </ul>
          </nav>

          <a href="#quote" className="tm-btn tm-btn-cyan tm-btn-quote">
            GET A QUOTE
          </a>

          <button
            className="tm-hamburger"
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section id="home" className="tm-hero">
        <motion.img
          src="/assets/products-hero.png"
          alt=""
          className="tm-hero-bg"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: EASE }}
        />
        <div className="tm-hero-scrim" aria-hidden="true" />
        <div className="tm-hero-grid">
          <motion.div
            className="tm-hero-copy"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <h1 className="tm-hero-title">
              <motion.span className="line" variants={heroLine}>
                PRINT YOUR
              </motion.span>
              <motion.span className="line" variants={heroLine}>
                <span className="vision">VISION.</span>
              </motion.span>
              <motion.span className="line" variants={heroLine}>
                WE MAKE IT
              </motion.span>
              <motion.span className="line" variants={heroLine}>
                <span className="real">REAL.</span>
              </motion.span>
            </h1>
            <motion.p className="tm-hero-sub" variants={fadeUp}>
              High quality. Fast turnaround. Custom solutions
              <br />
              for your business, brand, and beyond.
            </motion.p>
            <motion.div className="tm-hero-cta" variants={fadeUp}>
              <motion.a
                href="#shop"
                className="tm-btn tm-btn-cyan tm-btn-lg"
                {...btnInteraction}
              >
                SHOP NOW <span className="tm-arr">→</span>
              </motion.a>
              <motion.a
                href="#quote"
                className="tm-btn tm-btn-outline tm-btn-lg"
                {...btnInteraction}
              >
                GET A QUOTE <span className="tm-arr">→</span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

        {/* services strip — infinite marquee */}
        <div className="tm-svc-strip" id="services">
          <ul className="tm-svc-track">
            {marqueeItems.map(({ label, Icon }, i) => (
              <li key={`${label}-${i}`} tabIndex={0}>
                <span className="tm-svc-ico">
                  <Icon />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===================== WHY CHOOSE ===================== */}
      <section id="about" className="tm-why">
        <div className="tm-why-grid">
          <motion.div
            className="tm-why-copy"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <motion.h2 className="tm-why-title" variants={fadeUp}>
              WHY CHOOSE
              <br />
              <span className="tm-t-cyan">TECH</span>{" "}
              <span className="tm-t-pink">MONKEYS?</span>
            </motion.h2>
            <motion.span className="tm-why-rule" variants={fadeUp} />
            <motion.ul className="tm-why-list" variants={stagger}>
              {[
                "Premium Quality Printing",
                "Fast Turnaround Times",
                "Custom Solutions for Every Need",
                "Competitive Pricing",
                "Local Business, Big Results",
              ].map((item) => (
                <motion.li key={item} variants={fadeUp}>
                  <span className="tm-check" aria-hidden="true">
                    ⊘
                  </span>{" "}
                  {item}
                </motion.li>
              ))}
            </motion.ul>
            <motion.a
              href="#about"
              className="tm-btn tm-btn-cyan"
              variants={fadeUp}
              {...btnInteraction}
            >
              ABOUT US <span className="tm-arr">→</span>
            </motion.a>
          </motion.div>
          <motion.div
            className="tm-why-art"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="tm-why-wm" aria-hidden="true">
              WE PRINT
              <br />
              AWESOME
            </span>
            <img
              src="/assets/storefront.png"
              alt="Tech Monkeys storefront with CMYK paint stripes"
            />
          </motion.div>
        </div>
      </section>

      {/* ===================== OUR WORK ===================== */}
      <section id="portfolio" className="tm-work">
        <motion.div
          className="tm-work-head"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={stagger}
        >
          <motion.h2 className="tm-work-title" variants={fadeUp}>
            OUR WORK <span className="tm-t-cyan">SPEAKS</span>
          </motion.h2>
          <motion.a
            href="#portfolio"
            className="tm-btn tm-btn-outline"
            variants={fadeUp}
            {...btnInteraction}
          >
            VIEW PORTFOLIO <span className="tm-arr">→</span>
          </motion.a>
        </motion.div>

        <motion.div
          className="tm-work-grid"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={stagger}
        >
          <motion.figure
            className="tm-work-card"
            data-frame="cyan"
            variants={fadeUp}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE } }}
          >
            <div className="tm-work-img">
              <div className="tm-ph tm-ph-wood">
                <div className="tm-ph-logo">
                  <div className="tm-ph-mtns">
                    <svg viewBox="0 0 100 50">
                      <polygon
                        points="10,45 30,15 45,40 55,25 75,45"
                        fill="none"
                        stroke="#e8b06b"
                        strokeWidth="2"
                      />
                      <circle
                        cx="50"
                        cy="14"
                        r="4"
                        fill="none"
                        stroke="#e8b06b"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="tm-ph-name">Timberline</div>
                  <div className="tm-ph-sub">OUTDOORS</div>
                </div>
              </div>
            </div>
            <figcaption>SIGNS</figcaption>
          </motion.figure>

          <motion.figure
            className="tm-work-card"
            data-frame="pink"
            variants={fadeUp}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE } }}
          >
            <div className="tm-work-img">
              <div className="tm-ph tm-ph-blur">
                <div className="tm-ph-sticker">
                  <span className="tm-ph-good">GOOD</span>
                  <span className="tm-ph-vibes">VIBES</span>
                  <span className="tm-ph-only">ONLY</span>
                </div>
              </div>
            </div>
            <figcaption>STICKERS</figcaption>
          </motion.figure>

          <motion.figure
            className="tm-work-card"
            data-frame="yellow"
            variants={fadeUp}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE } }}
          >
            <div className="tm-work-img">
              <div className="tm-ph tm-ph-cap">
                <div className="tm-ph-cap-front">
                  <div className="tm-ph-cap-text">
                    RAISED <br />
                    <em>Right</em>
                  </div>
                </div>
              </div>
            </div>
            <figcaption>EMBROIDERY</figcaption>
          </motion.figure>

          <motion.figure
            className="tm-work-card"
            data-frame="pink"
            variants={fadeUp}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE } }}
          >
            <div className="tm-work-img">
              <div className="tm-ph tm-ph-tee">
                <div className="tm-ph-tee-shape" />
                <div className="tm-ph-tee-art">
                  <div className="tm-ph-savage">SAVAGE</div>
                  <div className="tm-ph-gorilla">
                    <svg viewBox="0 0 100 100">
                      <ellipse
                        cx="50"
                        cy="60"
                        rx="28"
                        ry="30"
                        fill="#1a1a1a"
                      />
                      <circle cx="40" cy="55" r="3" fill="#EC008C" />
                      <circle cx="60" cy="55" r="3" fill="#EC008C" />
                      <path
                        d="M40 70 q10 10 20 0"
                        fill="none"
                        stroke="#EC008C"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <figcaption>DTF PRINTS</figcaption>
          </motion.figure>

          <motion.figure
            className="tm-work-card"
            data-frame="pink"
            variants={fadeUp}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE } }}
          >
            <div className="tm-work-img">
              <div className="tm-ph tm-ph-card">
                <div className="tm-ph-card-logo">
                  <svg viewBox="0 0 60 30">
                    <path
                      d="M20 25 l10 -15 l10 15 z"
                      fill="none"
                      stroke="#caa15a"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="22"
                      y1="25"
                      x2="38"
                      y2="25"
                      stroke="#caa15a"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="tm-ph-card-name">ELEVATE</div>
                <div className="tm-ph-card-sub">CONSTRUCTION</div>
              </div>
            </div>
            <figcaption>BUSINESS CARDS</figcaption>
          </motion.figure>
        </motion.div>
      </section>

      {/* ===================== READY CTA ===================== */}
      <section className="tm-ready" id="quote">
        <motion.div
          className="tm-ready-inner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <motion.h2
            className="tm-ready-title"
            initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={viewport}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.a
            href="#quote"
            className="tm-btn tm-btn-dark tm-btn-lg"
            {...btnInteraction}
          >
            GET A FREE QUOTE <span className="tm-arr">→</span>
          </motion.a>
        </motion.div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer id="contact" className="tm-footer">
        <div className="tm-foot-grid">
          <div className="tm-foot-col tm-foot-brand">
            <div className="tm-brand tm-brand-lg">
              <span className="tm-brand-mark" aria-hidden="true">
                <MonkeyMark size={58} />
              </span>
              <span className="tm-brand-word">
                <span
                  className="tm-brand-line1"
                  style={{ fontSize: "30px" }}
                >
                  TECH
                </span>
                <span
                  className="tm-brand-line1"
                  style={{ fontSize: "30px", lineHeight: 0.9 }}
                >
                  MONKEYS
                </span>
                <span className="tm-brand-line2">GRAPHICS SOLUTIONS</span>
              </span>
            </div>
            <p className="tm-foot-tag">
              Your one-stop shop for all your
              <br />
              printing and branding needs.
            </p>
            <div className="tm-foot-social">
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M13.5 8h2V6h-2c-1.4 0-2.5 1.1-2.5 2.5V10H9v2h2v6h2v-6h2l.5-2H13V8.5c0-.3.2-.5.5-.5z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="7"
                    y="7"
                    width="10"
                    height="10"
                    rx="3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="2.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="15.3" cy="8.7" r="0.7" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="TikTok">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M13 6.5v8a2 2 0 1 1-2-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 6.5c.4 1.6 1.6 2.6 3 2.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
              <a href="#" aria-label="Email">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="6.5"
                    y="9"
                    width="11"
                    height="7"
                    rx="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M6.5 9.5l5.5 4 5.5-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="tm-foot-col">
            <h4>QUICK LINKS</h4>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#products">Products</a>
              </li>
              <li>
                <a href="#portfolio">Portfolio</a>
              </li>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="tm-foot-col">
            <h4>SERVICES</h4>
            <div className="tm-foot-svcs">
              <ul>
                <li>
                  <a href="#">Signs</a>
                </li>
                <li>
                  <a href="#">Stickers</a>
                </li>
                <li>
                  <a href="#">Labels</a>
                </li>
                <li>
                  <a href="#">DTF</a>
                </li>
                <li>
                  <a href="#">Embroidery</a>
                </li>
              </ul>
              <ul>
                <li>
                  <a href="#">Engraving</a>
                </li>
                <li>
                  <a href="#">Screen Printing</a>
                </li>
                <li>
                  <a href="#">Promo Items</a>
                </li>
                <li>
                  <a href="#">Flyers</a>
                </li>
                <li>
                  <a href="#">Business Cards</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="tm-foot-col">
            <h4>CONTACT US</h4>
            <ul className="tm-foot-contact">
              <li>
                <span className="tm-ci">📞</span> (555) 123-4567
              </li>
              <li>
                <span className="tm-ci">✉</span> info@techmonkeysprint.com
              </li>
              <li>
                <span className="tm-ci">◎</span> 123 Print Lane
                <br />
                <span className="tm-indent">Yourtown, ST 12345</span>
              </li>
              <li>
                <span className="tm-ci">◷</span> Mon - Fri: 9AM - 6PM
              </li>
            </ul>
          </div>
        </div>
        <div className="tm-foot-bottom">
          <span>
            © 2024 Tech Monkeys Graphics Solutions. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  )
}
