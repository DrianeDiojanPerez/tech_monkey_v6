import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useLayoutEffect, useState } from "react"

import appCss from "../styles.css?url"

const NOT_FOUND_EASE = [0.16, 1, 0.3, 1] as const

const PRELOAD_IMAGES = [
  "/tech-monkeys-logo.svg",
  "/assets/products-hero.png",
  "/assets/storefront.png",
  "/assets/portfolio/stickers.png",
  "/assets/portfolio/dtf.png",
  "/assets/ready-banner.png",
  "/assets/why-brush.png",
]

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Tech Monkeys — Graphics Solutions",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
      },
      {
        rel: "preload",
        href: "/fonts/Spyckers.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/tech-monkeys-logo.svg",
        as: "image",
        type: "image/svg+xml",
      },
      {
        rel: "preload",
        href: "/assets/products-hero.png",
        as: "image",
        type: "image/png",
      },
      {
        rel: "preload",
        href: "/assets/storefront.png",
        as: "image",
        type: "image/png",
      },
      {
        rel: "preload",
        href: "/assets/ready-banner.png",
        as: "image",
        type: "image/png",
      },
      {
        rel: "preload",
        href: "/assets/why-brush.png",
        as: "image",
        type: "image/png",
      },
      {
        rel: "preload",
        href: "/assets/portfolio/stickers.png",
        as: "image",
        type: "image/png",
      },
      {
        rel: "preload",
        href: "/assets/portfolio/dtf.png",
        as: "image",
        type: "image/png",
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
})

function NotFoundPage() {
  return (
    <main className="tm-404">
      <div className="tm-404-bg" aria-hidden="true" />
      <Link to="/" className="tm-404-brand" aria-label="Tech Monkeys home">
        <img
          src="/tech-monkeys-logo.svg"
          alt=""
          height={64}
          style={{ display: "block", width: "auto", height: "64px" }}
        />
        <span>
          <span className="tm-404-brand-line1">TECH MONKEYS</span>
          <span className="tm-404-brand-line2">GRAPHICS SOLUTIONS</span>
        </span>
      </Link>

      <motion.div
        className="tm-404-stack"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
        }}
      >
        <motion.span
          className="tm-404-oops"
          variants={{
            hidden: { opacity: 0, y: 16, rotate: -10, filter: "blur(6px)" },
            show: {
              opacity: 1,
              y: 0,
              rotate: -6,
              filter: "blur(0px)",
              transition: { duration: 0.9, ease: NOT_FOUND_EASE },
            },
          }}
        >
          Oops!
        </motion.span>

        <motion.h1
          className="tm-404-code"
          variants={{
            hidden: { opacity: 0, y: 32, filter: "blur(10px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 1, ease: NOT_FOUND_EASE },
            },
          }}
        >
          <span className="tm-404-digit tm-404-digit--cyan">4</span>
          <span className="tm-404-digit tm-404-digit--white">0</span>
          <span className="tm-404-digit tm-404-digit--pink">4</span>
        </motion.h1>

        <motion.p
          className="tm-404-headline"
          variants={{
            hidden: { opacity: 0, y: 18 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: NOT_FOUND_EASE },
            },
          }}
        >
          This page got <span className="tm-t-cyan">misprinted.</span>
        </motion.p>

        <motion.p
          className="tm-404-sub"
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: NOT_FOUND_EASE },
            },
          }}
        >
          The link you followed is jammed up in the press.
          <br />
          Let’s get you back to something that prints clean.
        </motion.p>

        <motion.div
          className="tm-404-cta"
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: NOT_FOUND_EASE },
            },
          }}
        >
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ y: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
          >
            <Link to="/" className="tm-btn tm-btn-cyan tm-btn-lg">
              BACK HOME <span className="tm-arr">→</span>
            </Link>
          </motion.div>
          <motion.a
            href="/#contact"
            className="tm-btn tm-btn-outline tm-btn-lg"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
          >
            CONTACT US <span className="tm-arr">→</span>
          </motion.a>
        </motion.div>
      </motion.div>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [cacheChecked, setCacheChecked] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (typeof document === "undefined") return
    if (loading) return
    const body = document.body.style
    const html = document.documentElement.style
    const prev = {
      bodyX: body.overflowX,
      bodyY: body.overflowY,
      htmlX: html.overflowX,
      htmlY: html.overflowY,
    }
    body.overflowX = "auto"
    body.overflowY = "auto"
    html.overflowX = "auto"
    html.overflowY = "auto"
    return () => {
      body.overflowX = prev.bodyX
      body.overflowY = prev.bodyY
      html.overflowX = prev.htmlX
      html.overflowY = prev.htmlY
    }
  }, [loading])

  useLayoutEffect(() => {
    if (typeof window === "undefined") return

    const allCached = PRELOAD_IMAGES.every((src) => {
      const img = new Image()
      img.src = src
      return img.complete && img.naturalWidth > 0
    })
    if (allCached) {
      setLoading(false)
    }
    setCacheChecked(true)
  }, [])

  useEffect(() => {
    if (!cacheChecked || !loading) return
    let loaded = 0
    const total = PRELOAD_IMAGES.length + 1
    const bump = () => {
      loaded += 1
      setProgress(Math.round((loaded / total) * 100))
    }
    const fonts =
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready.then(bump)
        : Promise.resolve().then(bump)
    const images = PRELOAD_IMAGES.map((src) => preloadImage(src).then(bump))
    Promise.all([fonts, ...images]).then(() => {
      setProgress(100)
      window.setTimeout(() => setLoading(false), 250)
    })
  }, [cacheChecked, loading])

  return (
    <>
      <AnimatePresence>
        {loading ? <Loader key="loader" progress={progress} /> : null}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={
          loading
            ? { opacity: 0 }
            : {
                opacity: 1,
                transition: {
                  duration: 0.7,
                  delay: 0.15,
                  ease: NOT_FOUND_EASE,
                },
              }
        }
      >
        {children}
      </motion.div>
    </>
  )
}

function Loader() {
  return (
    <motion.div
      className="tm-loader"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.7, ease: NOT_FOUND_EASE, delay: 0.1 },
      }}
    >
      <div className="tm-loader-grid" aria-hidden="true" />
      <motion.div
        className="tm-loader-inner"
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.9, ease: NOT_FOUND_EASE },
        }}
        exit={{
          opacity: 0,
          scale: 1.18,
          filter: "blur(12px)",
          transition: { duration: 0.6, ease: NOT_FOUND_EASE },
        }}
      ></motion.div>
    </motion.div>
  )
}
