import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Check,
  ImageIcon,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogOut,
  Moon,
  Pencil,
  Save,
  Sparkles,
  Sun,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import { Badge } from "@/components/ui/badge"

import { content as initialContent, type SiteContent } from "@/lib/content"
import {
  fileToBase64,
  getFile,
  putFile,
  rawUrl,
  utf8ToBase64,
} from "@/lib/github-content"

const ADMIN_PASSWORD = "techmonkeys2025"
const SESSION_KEY = "tm-admin-unlocked"
const TOKEN_KEY = "tm-admin-token"
const THEME_KEY = "tm-admin-theme"
const CONTENT_PATH = "src/content.json"

type Theme = "light" | "dark"

function useAdminTheme() {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_KEY) as Theme | null) ?? null
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light")
    setTheme(initial)
    document.documentElement.classList.toggle("dark", initial === "dark")
    return () => {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem(THEME_KEY, next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  return { theme, toggle }
}

export const Route = createFileRoute("/admin")({ component: AdminPage })

function AdminPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, toggle } = useAdminTheme()

  useEffect(() => {
    setMounted(true)
    setUnlocked(sessionStorage.getItem(SESSION_KEY) === "1")
  }, [])

  if (!mounted) return null
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {unlocked ? (
        <Editor theme={theme} onToggleTheme={toggle} />
      ) : (
        <Gate
          onUnlock={() => setUnlocked(true)}
          theme={theme}
          onToggleTheme={toggle}
        />
      )}
      <Toaster richColors closeButton position="bottom-right" theme={theme} />
    </div>
  )
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: Theme
  onToggle: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  )
}

function Gate({
  onUnlock,
  theme,
  onToggleTheme,
}: {
  onUnlock: () => void
  theme: Theme
  onToggleTheme: () => void
}) {
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1")
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="size-5" />
          </div>
          <CardTitle>Admin</CardTitle>
          <CardDescription>Enter the admin password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="adm-password">Password</Label>
              <Input
                id="adm-password"
                type="password"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setError(false)
                }}
                autoFocus
              />
              {error ? (
                <p className="text-destructive text-sm">Wrong password.</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

function Editor({
  theme,
  onToggleTheme,
}: {
  theme: Theme
  onToggleTheme: () => void
}) {
  const [draft, setDraft] = useState<SiteContent>(() =>
    structuredClone(initialContent)
  )
  const [token, setToken] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setToken(sessionStorage.getItem(TOKEN_KEY) ?? "")
  }, [])

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialContent),
    [draft]
  )

  function update<K extends keyof SiteContent>(
    section: K,
    next: SiteContent[K]
  ) {
    setDraft((d) => ({ ...d, [section]: next }))
  }

  function reset() {
    setDraft(structuredClone(initialContent))
    toast.info("Draft reset to last saved content.")
  }

  function lock() {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    location.reload()
  }

  async function commit() {
    if (!token) {
      toast.error("Paste a GitHub token in the Settings tab first.")
      return
    }
    setSaving(true)
    const id = toast.loading("Committing content.json to master…")
    try {
      const existing = await getFile(token, CONTENT_PATH)
      const body = JSON.stringify(draft, null, 2) + "\n"
      await putFile(
        token,
        CONTENT_PATH,
        utf8ToBase64(body),
        "chore(content): edit via /admin",
        existing?.sha
      )
      toast.success("Saved. Pages will redeploy in ~1–2 min.", { id })
    } catch (err) {
      toast.error((err as Error).message, { id })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-3">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold leading-tight">
              Tech Monkeys · Content
            </h1>
            <p className="text-muted-foreground hidden text-xs sm:block">
              Double-click any text to edit. Hover images to replace.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {dirty ? (
              <Badge variant="secondary">Unsaved changes</Badge>
            ) : (
              <Badge variant="outline">
                <Check className="mr-1 size-3" /> Up to date
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              disabled={!dirty || saving}
            >
              Reset
            </Button>
            <Button size="sm" onClick={commit} disabled={!dirty || saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <Button variant="ghost" size="icon" onClick={lock} title="Lock">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Tabs defaultValue="hero" className="flex flex-1 flex-col">
          <div className="border-b border-border bg-muted/30 px-6 py-3">
            <TabsList className="mx-auto">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="why">Why Choose</TabsTrigger>
              <TabsTrigger value="work">Portfolio</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hero" className="m-0">
            <PreviewShell>
              <HeroLive
                token={token}
                value={draft.hero}
                onChange={(v) => update("hero", v)}
              />
            </PreviewShell>
          </TabsContent>
          <TabsContent value="why" className="m-0">
            <PreviewShell>
              <WhyLive
                token={token}
                value={draft.why}
                onChange={(v) => update("why", v)}
              />
            </PreviewShell>
          </TabsContent>
          <TabsContent value="work" className="m-0">
            <PreviewShell>
              <WorkLive
                token={token}
                value={draft.work}
                onChange={(v) => update("work", v)}
              />
            </PreviewShell>
          </TabsContent>
          <TabsContent value="ready" className="m-0">
            <PreviewShell>
              <ReadyLive
                value={draft.ready}
                onChange={(v) => update("ready", v)}
              />
            </PreviewShell>
          </TabsContent>
          <TabsContent value="footer" className="m-0">
            <PreviewShell>
              <FooterLive
                value={draft.footer}
                onChange={(v) => update("footer", v)}
              />
            </PreviewShell>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-6 py-6">
              <SettingsPanel
                token={token}
                setToken={setToken}
                draft={draft}
                update={update}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function PreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="border-b border-border bg-muted/30 px-6 py-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Pencil className="size-3" />
        Double-click text to edit. Hover images to replace.
      </div>
      <div className="preview-frame">{children}</div>
    </div>
  )
}

/* =========================================================
   Editable primitives
   ========================================================= */

function Editable({
  value,
  onChange,
  multiline,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  placeholder?: string
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function commit() {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }

  function cancel() {
    setEditing(false)
    setDraft(value)
  }

  if (editing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel()
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit()
        }}
        rows={Math.max(2, draft.split("\n").length)}
        className={`editable-input ${className ?? ""}`}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel()
          if (e.key === "Enter") commit()
        }}
        className={`editable-input ${className ?? ""}`}
      />
    )
  }

  return (
    <span
      className={`editable ${className ?? ""}`}
      onDoubleClick={() => setEditing(true)}
      title="Double-click to edit"
    >
      {value || (
        <span className="editable-placeholder">{placeholder ?? "Empty"}</span>
      )}
    </span>
  )
}

function EditableImage({
  value,
  onChange,
  token,
  pathPrefix,
  alt,
  className,
  fallback,
}: {
  value: string
  onChange: (url: string) => void
  token: string
  pathPrefix: string
  alt?: string
  className?: string
  fallback?: React.ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!token) {
      toast.error("Paste a GitHub token in the Settings tab first.")
      if (inputRef.current) inputRef.current.value = ""
      return
    }
    setUploading(true)
    const id = toast.loading(`Uploading ${file.name}…`)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase()
      const path = `${pathPrefix}/${Date.now()}-${safeName}`
      const base64 = await fileToBase64(file)
      const existing = await getFile(token, path)
      await putFile(
        token,
        path,
        base64,
        `chore(content): upload ${path}`,
        existing?.sha
      )
      onChange(rawUrl(path))
      toast.success(`Uploaded ${safeName}`, { id })
    } catch (err) {
      toast.error((err as Error).message, { id })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={`editable-image ${className ?? ""}`}>
      {value ? (
        <img src={value} alt={alt ?? ""} className="editable-image-img" />
      ) : (
        fallback ?? (
          <div className="editable-image-empty">
            <ImageIcon className="size-6" />
          </div>
        )
      )}
      <div className="editable-image-overlay">
        <button
          type="button"
          className="editable-image-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        </button>
        {value ? (
          <button
            type="button"
            className="editable-image-btn editable-image-btn--ghost"
            onClick={() => onChange("")}
            disabled={uploading}
          >
            Clear
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFile}
      />
    </div>
  )
}

/* =========================================================
   Inline-editable section previews
   ========================================================= */

function HeroLive({
  token,
  value,
  onChange,
}: {
  token: string
  value: SiteContent["hero"]
  onChange: (v: SiteContent["hero"]) => void
}) {
  const setTitle = (k: keyof SiteContent["hero"]["title"], v: string) =>
    onChange({ ...value, title: { ...value.title, [k]: v } })
  return (
    <div className="preview preview--hero">
      <EditableImage
        value={value.image}
        onChange={(v) => onChange({ ...value, image: v })}
        token={token}
        pathPrefix="public/assets"
        className="preview-hero-bg-wrap"
        alt=""
      />
      <div className="preview-hero-scrim" />
      <div className="preview-hero-grid">
        <div className="preview-hero-copy">
        <h2 className="preview-hero-title">
          <span className="preview-line">
            <Editable
              value={value.title.line1}
              onChange={(v) => setTitle("line1", v)}
            />
          </span>
          <span className="preview-line">
            <span className="preview-c-cyan">
              <Editable
                value={value.title.line2}
                onChange={(v) => setTitle("line2", v)}
              />
            </span>
          </span>
          <span className="preview-line">
            <Editable
              value={value.title.line3}
              onChange={(v) => setTitle("line3", v)}
            />
          </span>
          <span className="preview-line">
            <span className="preview-c-real">
              <Editable
                value={value.title.line4}
                onChange={(v) => setTitle("line4", v)}
              />
              <span className="preview-c-real-dot">.</span>
            </span>
          </span>
        </h2>
        <p className="preview-hero-sub">
          <Editable
            value={value.subtitle}
            onChange={(v) => onChange({ ...value, subtitle: v })}
            multiline
          />
        </p>
        <div className="preview-hero-cta">
          <span className="preview-pill preview-pill--cyan">
            <Editable
              value={value.primaryCta.label}
              onChange={(v) =>
                onChange({
                  ...value,
                  primaryCta: { ...value.primaryCta, label: v },
                })
              }
            />
            <span className="preview-arr">→</span>
          </span>
          <span className="preview-pill preview-pill--outline">
            <Editable
              value={value.secondaryCta.label}
              onChange={(v) =>
                onChange({
                  ...value,
                  secondaryCta: { ...value.secondaryCta, label: v },
                })
              }
            />
            <span className="preview-arr">→</span>
          </span>
        </div>
        </div>
      </div>
      <div className="preview-hero-svc" aria-hidden="true">
        Services marquee · Signs · Stickers · Labels · DTF · Embroidery · …
      </div>
    </div>
  )
}

function WhyLive({
  token,
  value,
  onChange,
}: {
  token: string
  value: SiteContent["why"]
  onChange: (v: SiteContent["why"]) => void
}) {
  const setTitle = (k: keyof SiteContent["why"]["title"], v: string) =>
    onChange({ ...value, title: { ...value.title, [k]: v } })
  return (
    <div className="preview preview--why">
      <img
        src="https://raw.githubusercontent.com/DrianeDiojanPerez/tech_monkey_v6/refs/heads/master/public/assets/why-brush.png"
        alt=""
        aria-hidden="true"
        className="preview-why-brush"
      />
      <div className="preview-why-copy">
        <h2 className="preview-why-title">
          <span>
            <Editable
              value={value.title.line1}
              onChange={(v) => setTitle("line1", v)}
            />
          </span>
          <span>
            <span className="preview-c-cyan">
              <Editable
                value={value.title.techWord}
                onChange={(v) => setTitle("techWord", v)}
              />
            </span>{" "}
            <span className="preview-c-pink">
              <Editable
                value={value.title.monkeysWord}
                onChange={(v) => setTitle("monkeysWord", v)}
              />
            </span>
          </span>
        </h2>
        <div className="preview-why-rule" />
        <ul className="preview-why-list">
          {value.items.map((item, i) => (
            <li key={i}>
              <span className="preview-check">✓</span>
              <Editable
                value={item}
                onChange={(v) => {
                  const items = [...value.items]
                  items[i] = v
                  onChange({ ...value, items })
                }}
              />
            </li>
          ))}
        </ul>
        <span className="preview-pill preview-pill--cyan">
          <Editable
            value={value.cta.label}
            onChange={(v) =>
              onChange({ ...value, cta: { ...value.cta, label: v } })
            }
          />{" "}
          →
        </span>
      </div>
      <div className="preview-why-art">
        <span className="preview-why-wm" aria-hidden="true">
          WE PRINT
          <br />
          AWESOME
        </span>
        <EditableImage
          value={value.image}
          onChange={(v) => onChange({ ...value, image: v })}
          token={token}
          pathPrefix="public/assets"
          className="preview-why-img-wrap"
          alt=""
        />
      </div>
    </div>
  )
}

function WorkLive({
  token,
  value,
  onChange,
}: {
  token: string
  value: SiteContent["work"]
  onChange: (v: SiteContent["work"]) => void
}) {
  const frames = ["cyan", "pink", "yellow", "pink", "pink"]
  return (
    <div className="preview preview--work">
      <h2 className="preview-work-title">
        OUR WORK <span className="preview-c-cyan">SPEAKS</span>
      </h2>
      <div className="preview-work-grid">
        {value.cards.map((card, i) => (
          <figure key={i} className="preview-work-card" data-frame={frames[i]}>
            <EditableImage
              value={card.image}
              onChange={(v) => {
                const cards = [...value.cards]
                cards[i] = { ...card, image: v }
                onChange({ ...value, cards })
              }}
              token={token}
              pathPrefix="public/assets/portfolio"
              className="preview-work-img"
              fallback={
                <div className="preview-work-ph">
                  {card.label.slice(0, 1)}
                </div>
              }
            />
            <figcaption>
              <Editable
                value={card.label}
                onChange={(v) => {
                  const cards = [...value.cards]
                  cards[i] = { ...card, label: v }
                  onChange({ ...value, cards })
                }}
              />
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

function ReadyLive({
  value,
  onChange,
}: {
  value: SiteContent["ready"]
  onChange: (v: SiteContent["ready"]) => void
}) {
  return (
    <div className="preview preview--ready">
      <h2 className="preview-ready-title">
        <Editable
          value={value.title}
          onChange={(v) => onChange({ ...value, title: v })}
        />
      </h2>
      <span className="preview-pill preview-pill--dark">
        <Editable
          value={value.cta.label}
          onChange={(v) =>
            onChange({ ...value, cta: { ...value.cta, label: v } })
          }
        />{" "}
        →
      </span>
    </div>
  )
}

function FooterLive({
  value,
  onChange,
}: {
  value: SiteContent["footer"]
  onChange: (v: SiteContent["footer"]) => void
}) {
  const set = <K extends keyof SiteContent["footer"]>(
    k: K,
    v: SiteContent["footer"][K]
  ) => onChange({ ...value, [k]: v })

  return (
    <div className="preview preview--footer">
      <div className="preview-foot-grid">
        <div className="preview-foot-col preview-foot-brand">
          <div className="preview-foot-brandlg">
            <img
              src="https://raw.githubusercontent.com/DrianeDiojanPerez/tech_monkey_v6/refs/heads/master/public/tech-monkeys-logo.svg"
              alt=""
              className="preview-foot-logo"
            />
            <div className="preview-foot-brandword">
              <span className="preview-foot-brandline1">TECH</span>
              <span className="preview-foot-brandline1">MONKEYS</span>
              <span className="preview-foot-brandline2">
                GRAPHICS SOLUTIONS
              </span>
            </div>
          </div>
          <p className="preview-foot-tag">
            <Editable
              value={value.tagline}
              onChange={(v) => set("tagline", v)}
              multiline
            />
          </p>
          <div className="preview-foot-social" aria-hidden="true">
            <span>F</span>
            <span>IG</span>
            <span>TT</span>
            <span>@</span>
          </div>
        </div>

        <div className="preview-foot-col">
          <h4>QUICK LINKS</h4>
          <ul>
            <li>Home</li>
            <li>Services</li>
            <li>Products</li>
            <li>Portfolio</li>
            <li>About Us</li>
            <li>Contact</li>
          </ul>
        </div>

        <div className="preview-foot-col">
          <h4>SERVICES</h4>
          <div className="preview-foot-svcs">
            <ul>
              <li>Signs</li>
              <li>Stickers</li>
              <li>Labels</li>
              <li>DTF</li>
              <li>Embroidery</li>
            </ul>
            <ul>
              <li>Engraving</li>
              <li>Screen Printing</li>
              <li>Promo Items</li>
              <li>Flyers</li>
              <li>Business Cards</li>
            </ul>
          </div>
        </div>

        <div className="preview-foot-col">
          <h4>CONTACT US</h4>
          <ul className="preview-foot-contact">
            <li>
              <Editable value={value.phone} onChange={(v) => set("phone", v)} />
            </li>
            <li>
              <Editable value={value.email} onChange={(v) => set("email", v)} />
            </li>
            <li>
              <Editable
                value={value.addressLine1}
                onChange={(v) => set("addressLine1", v)}
              />
              <br />
              <Editable
                value={value.addressLine2}
                onChange={(v) => set("addressLine2", v)}
              />
            </li>
            <li>
              <Editable value={value.hours} onChange={(v) => set("hours", v)} />
            </li>
          </ul>
        </div>
      </div>
      <div className="preview-foot-bottom">
        <Editable
          value={value.copyright}
          onChange={(v) => set("copyright", v)}
        />
      </div>
    </div>
  )
}

/* =========================================================
   Settings tab — token + non-visible fields (hrefs, social)
   ========================================================= */

function SettingsPanel({
  token,
  setToken,
  draft,
  update,
}: {
  token: string
  setToken: (t: string) => void
  draft: SiteContent
  update: <K extends keyof SiteContent>(
    section: K,
    next: SiteContent[K]
  ) => void
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            GitHub token
          </CardTitle>
          <CardDescription>
            Create a fine-grained token with{" "}
            <strong className="text-foreground">
              Contents: Read &amp; write
            </strong>{" "}
            on this repo. Stored only in this tab's sessionStorage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="password"
            value={token}
            placeholder="github_pat_…"
            onChange={(e) => {
              setToken(e.target.value)
              sessionStorage.setItem(TOKEN_KEY, e.target.value)
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link destinations</CardTitle>
          <CardDescription>
            URLs the CTAs and social icons point to. Use{" "}
            <code className="bg-muted rounded px-1 py-px text-[11px]">
              #section-id
            </code>{" "}
            for in-page anchors.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UrlField
            label="Hero · primary CTA"
            value={draft.hero.primaryCta.href}
            onChange={(v) =>
              update("hero", {
                ...draft.hero,
                primaryCta: { ...draft.hero.primaryCta, href: v },
              })
            }
          />
          <UrlField
            label="Hero · secondary CTA"
            value={draft.hero.secondaryCta.href}
            onChange={(v) =>
              update("hero", {
                ...draft.hero,
                secondaryCta: { ...draft.hero.secondaryCta, href: v },
              })
            }
          />
          <UrlField
            label="Why · CTA"
            value={draft.why.cta.href}
            onChange={(v) =>
              update("why", {
                ...draft.why,
                cta: { ...draft.why.cta, href: v },
              })
            }
          />
          <UrlField
            label="Ready · CTA"
            value={draft.ready.cta.href}
            onChange={(v) =>
              update("ready", {
                ...draft.ready,
                cta: { ...draft.ready.cta, href: v },
              })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UrlField
            label="Facebook"
            value={draft.footer.social.facebook}
            onChange={(v) =>
              update("footer", {
                ...draft.footer,
                social: { ...draft.footer.social, facebook: v },
              })
            }
          />
          <UrlField
            label="Instagram"
            value={draft.footer.social.instagram}
            onChange={(v) =>
              update("footer", {
                ...draft.footer,
                social: { ...draft.footer.social, instagram: v },
              })
            }
          />
          <UrlField
            label="TikTok"
            value={draft.footer.social.tiktok}
            onChange={(v) =>
              update("footer", {
                ...draft.footer,
                social: { ...draft.footer.social, tiktok: v },
              })
            }
          />
          <UrlField
            label="Email (mailto:)"
            value={draft.footer.social.email}
            onChange={(v) =>
              update("footer", {
                ...draft.footer,
                social: { ...draft.footer.social, email: v },
              })
            }
          />
        </CardContent>
      </Card>
    </>
  )
}

function UrlField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
