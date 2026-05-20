import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { createFileRoute } from "@tanstack/react-router"
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  type Variants,
} from "motion/react"
import {
  BookOpen,
  CircleCheck,
  Clock,
  Coffee,
  Contact,
  FileText,
  Flag,
  Mail,
  MapPin,
  PaintRoller,
  Phone,
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

const navOuterVariants: Variants = {
  top: {
    backgroundColor: "rgba(0, 0, 0, 0.62)",
    paddingTop: 0,
  },
  scrolled: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    paddingTop: 10,
  },
}

const navInnerVariants: Variants = {
  top: {
    maxWidth: 1440,
    paddingTop: 18,
    paddingBottom: 18,
    paddingLeft: 40,
    paddingRight: 40,
    borderRadius: 0,
    borderColor: "rgba(255, 255, 255, 0)",
    backgroundColor: "rgba(0, 0, 0, 0)",
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    gap: 32,
  },
  scrolled: {
    maxWidth: 1080,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 22,
    paddingRight: 22,
    borderRadius: 26,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(6, 6, 6, 0.62)",
    boxShadow:
      "0 12px 36px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    gap: 24,
  },
}

const navTransition = { duration: 0.7, ease: EASE } as const

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
    <img
      src="/tech-monkeys-logo.svg"
      alt=""
      height={size}
      style={{ display: "block", width: "auto", height: `${size}px` }}
    />
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

const NAV_SECTIONS = [
  "home",
  "services",
  "products",
  "portfolio",
  "about",
  "contact",
] as const

const NAV_LINKS = [
  ["#services", "SERVICES"],
  ["#products", "PRODUCTS"],
  ["#portfolio", "PORTFOLIO"],
  ["#about", "ABOUT US"],
  ["#contact", "CONTACT"],
] as const

function TechMonkeysHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState("#home")
  const [marqueePaused, setMarqueePaused] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const marqueeItems = [...SERVICES, ...SERVICES]

  const marqueeX = useMotionValue(0)
  useAnimationFrame((_, delta) => {
    if (marqueePaused) return
    const next = marqueeX.get() - delta * (50 / 38000)
    marqueeX.set(next <= -50 ? next + 50 : next)
  })
  const marqueeTransform = useMotionTemplate`translate3d(${marqueeX}%, 0, 0)`

  useEffect(() => {
    if (typeof window === "undefined") return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        raf = 0
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  useEffect(() => {
    if (typeof window === "undefined") return
    const sections = NAV_SECTIONS.map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (!sections.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveHash(`#${visible[0].target.id}`)
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

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
      setActiveHash(href)
      setMenuOpen(false)
    },
    [],
  )

  return (
    <div className="tm-page" onClick={handleAnchorClick}>
      {/* ===================== NAV ===================== */}
      <motion.header
        className={`tm-nav${scrolled ? " tm-nav--scrolled" : ""}`}
        variants={navOuterVariants}
        initial={false}
        animate={scrolled ? "scrolled" : "top"}
        transition={navTransition}
      >
        <motion.div
          className="tm-nav-inner"
          variants={navInnerVariants}
          initial={false}
          animate={scrolled ? "scrolled" : "top"}
          transition={navTransition}
        >
          <a href="#home" className="tm-brand" aria-label="Tech Monkeys home">
            <span className="tm-brand-mark" aria-hidden="true">
              <MonkeyMark size={58} />
            </span>
            <span className="tm-brand-word">
              <span className="tm-brand-line1">TECH MONKEYS</span>
              <span className="tm-brand-line2">GRAPHICS SOLUTIONS</span>
            </span>
          </a>

          <nav className="tm-primary" aria-label="Primary">
            <ul>
              {NAV_LINKS.map(([href, label]) => (
                <li key={href}>
                  <motion.a
                    href={href}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                  >
                    {label}
                    <motion.span
                      className="tm-nav-underline"
                      aria-hidden="true"
                      variants={{
                        rest: { scaleX: 0 },
                        hover: { scaleX: 1 },
                      }}
                      transition={{ duration: 0.35, ease: EASE }}
                    />
                  </motion.a>
                </li>
              ))}
            </ul>
          </nav>

          <a href="#quote" className="tm-btn tm-btn-cyan tm-btn-quote">
            GET A QUOTE
          </a>

          <button
            type="button"
            className="tm-hamburger"
            data-open={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="tm-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </motion.div>
      </motion.header>

      {mounted
        ? createPortal(
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.div
                  key="tm-mobile-menu"
                  id="tm-mobile-menu"
                  className="tm-mobile-menu"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Site menu"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  onClick={handleAnchorClick}
                >
            <motion.div
              className="tm-mobile-menu-bg"
              aria-hidden="true"
              initial={{ clipPath: "circle(0% at calc(100% - 36px) 40px)" }}
              animate={{ clipPath: "circle(160% at calc(100% - 36px) 40px)" }}
              exit={{ clipPath: "circle(0% at calc(100% - 36px) 40px)" }}
              transition={{ duration: 0.65, ease: EASE }}
            />
            <motion.ul
              className="tm-mobile-list"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.07, delayChildren: 0.18 },
                },
              }}
            >
              {NAV_LINKS.map(([href, label]) => (
                <motion.li
                  key={href}
                  variants={{
                    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
                    show: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 0.55, ease: EASE },
                    },
                  }}
                >
                  <a href={href}>{label}</a>
                </motion.li>
              ))}
            </motion.ul>
            <motion.a
              href="#quote"
              className="tm-btn tm-btn-cyan tm-btn-lg tm-mobile-cta"
              initial={{ opacity: 0, y: 18 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: EASE, delay: 0.45 },
              }}
            >
              GET A QUOTE <span className="tm-arr">→</span>
            </motion.a>
          </motion.div>
        ) : null}
      </AnimatePresence>,
            document.body,
          )
        : null}

      {/* ===================== HERO ===================== */}
      <section id="home" className="tm-hero">
        <div className="tm-hero-bg-frame" aria-hidden="true">
          <motion.img
            src="/assets/products-hero-v2.jpg"
            alt=""
            className="tm-hero-bg"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: EASE }}
          />
        </div>
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
                <span className="real">
                  REAL<span className="real-dot">.</span>
                </span>
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
        <div
          className="tm-svc-strip"
          id="services"
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => setMarqueePaused(false)}
        >
          <motion.ul
            className="tm-svc-track"
            style={{ transform: marqueeTransform }}
          >
            {marqueeItems.map(({ label, Icon }, i) => (
              <li key={`${label}-${i}`} tabIndex={0}>
                <span className="tm-svc-ico">
                  <Icon />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ===================== WHY CHOOSE ===================== */}
      <section id="about" className="tm-why">
        <img
          src="/assets/why-brush.png"
          alt=""
          aria-hidden="true"
          className="tm-why-brush"
        />
        <div className="tm-why-grid">
          <motion.div
            className="tm-why-copy"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <motion.h2 className="tm-why-title" variants={fadeUp}>
              <span className="tm-why-line">WHY CHOOSE</span>
              <span className="tm-why-line">
                <span className="tm-t-cyan">TECH</span>{" "}
                <span className="tm-t-pink">MONKEYS?</span>
              </span>
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
                  <CircleCheck
                    className="tm-check"
                    size={22}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
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
              <span className="tm-why-wm-awesome">AWESOME</span>
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
              <img
                src="/assets/portfolio/stickers.png"
                alt="Custom vinyl sticker on a Jeep"
                className="tm-work-photo"
              />
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
              <img
                src="/assets/portfolio/dtf.png"
                alt="DTF print on a t-shirt"
                className="tm-work-photo"
              />
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
                <MonkeyMark size={80} />
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
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path
                    d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="TikTok">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path
                    d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 4c.4 2.4 2.2 4.2 4.6 4.6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a href="#" aria-label="Email">
                <Mail size={20} strokeWidth={1.6} />
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
                <Phone className="tm-ci" size={18} strokeWidth={1.8} />
                (555) 123-4567
              </li>
              <li>
                <Mail className="tm-ci" size={18} strokeWidth={1.8} />
                info@techmonkeysprint.com
              </li>
              <li>
                <MapPin className="tm-ci" size={18} strokeWidth={1.8} />
                <span>
                  123 Print Lane
                  <br />
                  <span className="tm-indent">Yourtown, ST 12345</span>
                </span>
              </li>
              <li>
                <Clock className="tm-ci" size={18} strokeWidth={1.8} />
                Mon - Fri: 9AM - 6PM
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
