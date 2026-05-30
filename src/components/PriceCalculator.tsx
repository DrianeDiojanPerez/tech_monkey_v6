import { useEffect, useMemo, useRef, useState } from "react"
import type { ComponentType, SVGProps } from "react"
import { animate, motion, useReducedMotion } from "motion/react"
import {
  Box,
  DollarSign,
  Flag,
  Hash,
  Layers,
  Mail,
  MoveHorizontal,
  MoveVertical,
  Presentation,
  Square,
  Sticker,
  Sun,
  Tag,
} from "lucide-react"
import { content } from "@/lib/content"

const EASE = [0.16, 1, 0.3, 1] as const

type ProductId = "labels" | "stickers" | "signs" | "banners" | "3d-signs"

type SignMaterialId =
  | "aluminium"
  | "galvalume-acm"
  | "acrylic"
  | "sticker-only"

type AcrylicThickness = "3mm" | "5mm"

type PriceResult =
  | { kind: "priced"; pricePerSqFt: number; rateLabel: string }
  | { kind: "quote"; reason: string }

type ProductMeta = {
  id: ProductId
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const PRODUCTS: ReadonlyArray<ProductMeta> = [
  { id: "labels", label: "Labels", Icon: Tag },
  { id: "stickers", label: "Stickers", Icon: Sticker },
  { id: "signs", label: "Signs", Icon: Presentation },
  { id: "banners", label: "Banners", Icon: Flag },
  { id: "3d-signs", label: "3D Signs", Icon: Layers },
]

const SIGN_MATERIALS: ReadonlyArray<{ id: SignMaterialId; label: string }> = [
  { id: "aluminium", label: "Aluminium" },
  { id: "galvalume-acm", label: "Galvalume / ACM" },
  { id: "acrylic", label: "Acrylic" },
  { id: "sticker-only", label: "Sticker Only" },
]

const ACRYLIC_PRICES: Record<
  AcrylicThickness,
  { base: number; withUv: number }
> = {
  "3mm": { base: 24, withUv: 30 },
  "5mm": { base: 31, withUv: 37 },
}

function resolvePrice(
  product: ProductId,
  signMaterial: SignMaterialId,
  acrylicThickness: AcrylicThickness,
  uvLaminate: boolean
): PriceResult {
  if (product === "labels") {
    return { kind: "priced", pricePerSqFt: 8.25, rateLabel: "Labels" }
  }
  if (product === "stickers") {
    return { kind: "priced", pricePerSqFt: 6.5, rateLabel: "Stickers" }
  }
  if (product === "signs") {
    if (signMaterial === "acrylic") {
      const tier = ACRYLIC_PRICES[acrylicThickness]
      const price = uvLaminate ? tier.withUv : tier.base
      return {
        kind: "priced",
        pricePerSqFt: price,
        rateLabel: `Acrylic ${acrylicThickness}${uvLaminate ? " · UV laminate" : ""}`,
      }
    }
    const matLabel =
      SIGN_MATERIALS.find((m) => m.id === signMaterial)?.label ??
      "this material"
    return {
      kind: "quote",
      reason: `${matLabel} pricing is custom — send your spec for a fast quote.`,
    }
  }
  if (product === "banners") {
    return {
      kind: "quote",
      reason: "Banner pricing depends on material, finish, and size.",
    }
  }
  return {
    kind: "quote",
    reason: "3D signs are made to order — share your concept for a quote.",
  }
}

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function useAnimatedNumber(target: number, duration = 0.5): number {
  const prefersReducedMotion = useReducedMotion()
  const [current, setCurrent] = useState(target)
  const currentRef = useRef(target)

  useEffect(() => {
    if (prefersReducedMotion) {
      currentRef.current = target
      setCurrent(target)
      return
    }
    const from = currentRef.current
    if (from === target) return
    const controls = animate(from, target, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        currentRef.current = v
        setCurrent(v)
      },
    })
    return () => controls.stop()
  }, [target, duration, prefersReducedMotion])

  return current
}

export function PriceCalculator() {
  const [product, setProduct] = useState<ProductId>("stickers")
  const [signMaterial, setSignMaterial] = useState<SignMaterialId>("acrylic")
  const [acrylicThickness, setAcrylicThickness] =
    useState<AcrylicThickness>("3mm")
  const [uvLaminate, setUvLaminate] = useState(false)
  const [widthIn, setWidthIn] = useState(12)
  const [heightIn, setHeightIn] = useState(12)
  const [widthStr, setWidthStr] = useState("12")
  const [heightStr, setHeightStr] = useState("12")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setWidthIn(12)
    setHeightIn(12)
    setWidthStr("12")
    setHeightStr("12")
    setQuantity(1)
  }, [product])

  const areaSqFt = useMemo(() => {
    const w = Number.isFinite(widthIn) && widthIn > 0 ? widthIn : 0
    const h = Number.isFinite(heightIn) && heightIn > 0 ? heightIn : 0
    return (w * h) / 144
  }, [widthIn, heightIn])

  const price = useMemo(
    () => resolvePrice(product, signMaterial, acrylicThickness, uvLaminate),
    [product, signMaterial, acrylicThickness, uvLaminate]
  )

  const total =
    price.kind === "priced"
      ? areaSqFt * price.pricePerSqFt * Math.max(1, quantity || 0)
      : null

  const animatedArea = useAnimatedNumber(areaSqFt, 0.45)
  const animatedQuantity = useAnimatedNumber(quantity, 0.35)
  const animatedRate = useAnimatedNumber(
    price.kind === "priced" ? price.pricePerSqFt : 0,
    0.45
  )
  const animatedTotal = useAnimatedNumber(total ?? 0, 0.55)

  const quoteHref = useMemo(() => {
    const productLabel =
      PRODUCTS.find((p) => p.id === product)?.label ?? product
    const materialLabel = SIGN_MATERIALS.find((m) => m.id === signMaterial)
      ?.label

    const specLines: Array<string> = [`• Product: ${productLabel}`]

    if (product === "signs") {
      const mat = materialLabel ?? signMaterial
      const detail =
        signMaterial === "acrylic"
          ? `${mat}, ${acrylicThickness}${uvLaminate ? " with UV laminate" : ""}`
          : mat
      specLines.push(`• Material: ${detail}`)
    }

    const sizeLine = `• Size: ${widthIn}" × ${heightIn}" (${areaSqFt.toFixed(2)} sq ft)`
    specLines.push(sizeLine)
    specLines.push(`• Quantity: ${quantity}`)

    if (price.kind === "priced" && total != null) {
      specLines.push(
        `• Estimated total: ${formatMoney(total)} (${formatMoney(price.pricePerSqFt)}/sq ft)`
      )
    }

    const closingBlock =
      price.kind === "priced"
        ? "Let me know next steps and turnaround. Thanks!"
        : "This product needs a custom quote. Could you send pricing and turnaround? Thanks!"

    const bodyText = [
      "Hi Tech Monkeys,",
      "",
      "I'd like a quote on the following:",
      "",
      ...specLines,
      "",
      closingBlock,
      "",
      "Sent from techmonkeys.com",
    ].join("\r\n")

    const subjectText =
      price.kind === "priced"
        ? `Quote request: ${productLabel} · ${widthIn}×${heightIn}" · qty ${quantity}`
        : `Quote request: ${productLabel} (custom)`

    return `mailto:${content.footer.email}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`
  }, [
    product,
    signMaterial,
    acrylicThickness,
    uvLaminate,
    widthIn,
    heightIn,
    quantity,
    areaSqFt,
    price,
    total,
  ])

  const showSignMaterial = product === "signs"
  const showAcrylicOptions = product === "signs" && signMaterial === "acrylic"

  return (
    <motion.div
      className="tm-calc-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.75, ease: EASE }}
    >
      <div className="tm-calc-products">
        <div
          role="radiogroup"
          aria-label="Product"
          className="tm-calc-products-grid"
        >
          {PRODUCTS.map((p) => {
            const active = product === p.id
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                data-active={active}
                className="tm-calc-product-tile"
                onClick={() => setProduct(p.id)}
              >
                <span className="tm-calc-product-tile-icon">
                  <p.Icon strokeWidth={1.8} />
                </span>
                <span className="tm-calc-product-tile-label">{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="tm-calc-mid">
        <div className="tm-calc-specs">
          <div className="tm-calc-form">
            {showSignMaterial ? (
              <div className="tm-calc-field tm-calc-field--full">
                <label htmlFor="calc-material">
                  <Box size={13} strokeWidth={2.2} aria-hidden="true" />
                  Material
                </label>
                <select
                  id="calc-material"
                  value={signMaterial}
                  onChange={(e) =>
                    setSignMaterial(e.target.value as SignMaterialId)
                  }
                >
                  {SIGN_MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {showAcrylicOptions ? (
              <>
                <div className="tm-calc-field">
                  <span className="tm-calc-field-label">
                    <Layers size={13} strokeWidth={2.2} aria-hidden="true" />
                    Thickness
                  </span>
                  <div
                    role="radiogroup"
                    aria-label="Acrylic thickness"
                    className="tm-calc-seg"
                  >
                    {(["3mm", "5mm"] as const).map((t) => {
                      const active = acrylicThickness === t
                      return (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          data-active={active}
                          className="tm-calc-seg-btn"
                          onClick={() => setAcrylicThickness(t)}
                        >
                          {t === "3mm" ? "3 mm" : "5 mm"}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="tm-calc-field tm-calc-field--toggle">
                  <span className="tm-calc-field-label">
                    <Sun size={13} strokeWidth={2.2} aria-hidden="true" />
                    UV laminate
                  </span>
                  <label className="tm-calc-toggle">
                    <input
                      type="checkbox"
                      checked={uvLaminate}
                      onChange={(e) => setUvLaminate(e.target.checked)}
                    />
                    <span className="tm-calc-toggle-track" aria-hidden="true">
                      <span className="tm-calc-toggle-thumb" />
                    </span>
                    <span className="tm-calc-toggle-state">
                      {uvLaminate ? "On" : "Off"}
                    </span>
                  </label>
                </div>
              </>
            ) : null}

            <div className="tm-calc-field">
              <label htmlFor="calc-width">
                <MoveHorizontal
                  size={13}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                Width (in)
              </label>
              <input
                id="calc-width"
                type="number"
                inputMode="decimal"
                min={1}
                step={0.1}
                value={widthStr}
                onChange={(e) => {
                  const v = e.target.value
                  setWidthStr(v)
                  if (v === "") {
                    setWidthIn(0)
                  } else {
                    const n = parseFloat(v)
                    if (!isNaN(n)) setWidthIn(n)
                  }
                }}
                onBlur={() => {
                  const n = parseFloat(widthStr) || 0
                  setWidthStr(String(n))
                  setWidthIn(n)
                }}
              />
            </div>

            <div className="tm-calc-field">
              <label htmlFor="calc-height">
                <MoveVertical
                  size={13}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                Height (in)
              </label>
              <input
                id="calc-height"
                type="number"
                inputMode="decimal"
                min={1}
                step={0.1}
                value={heightStr}
                onChange={(e) => {
                  const v = e.target.value
                  setHeightStr(v)
                  if (v === "") {
                    setHeightIn(0)
                  } else {
                    const n = parseFloat(v)
                    if (!isNaN(n)) setHeightIn(n)
                  }
                }}
                onBlur={() => {
                  const n = parseFloat(heightStr) || 0
                  setHeightStr(String(n))
                  setHeightIn(n)
                }}
              />
            </div>

            <div className="tm-calc-field tm-calc-field--full">
              <label htmlFor="calc-qty">
                <Hash size={13} strokeWidth={2.2} aria-hidden="true" />
                Quantity
              </label>
              <div className="tm-calc-stepper">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <input
                  id="calc-qty"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.floor(Number(e.target.value) || 1))
                    )
                  }
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="tm-calc-summary" aria-live="polite">
          <ul className="tm-calc-stats">
            <li>
              <span>
                <Square size={12} strokeWidth={2.2} aria-hidden="true" />
                Area
              </span>
              <strong>
                {animatedArea.toFixed(2)} <em>sq ft</em>
              </strong>
            </li>
            <li>
              <span>
                <DollarSign size={12} strokeWidth={2.2} aria-hidden="true" />
                Rate
              </span>
              <strong>
                {price.kind === "priced" ? (
                  <>
                    {formatMoney(animatedRate)} <em>/ sq ft</em>
                  </>
                ) : (
                  <em>Custom</em>
                )}
              </strong>
            </li>
            <li>
              <span>
                <Hash size={12} strokeWidth={2.2} aria-hidden="true" />
                Quantity
              </span>
              <strong>×{Math.round(animatedQuantity)}</strong>
            </li>
          </ul>

          {price.kind === "priced" ? (
            <div className="tm-calc-total-panel">
              <div className="tm-calc-total-head">
                <span>Total</span>
              </div>
              <div className="tm-calc-total-value">
                <span className="tm-calc-total-currency">$</span>
                <span className="tm-calc-total-dollars">
                  {Math.floor(animatedTotal).toLocaleString("en-US")}
                </span>
                <span className="tm-calc-total-cents">
                  .
                  {String(
                    Math.round(
                      (animatedTotal - Math.floor(animatedTotal)) * 100
                    )
                  ).padStart(2, "0")}
                </span>
              </div>
              <span className="tm-calc-total-rate">{price.rateLabel}</span>
              <div className="tm-calc-total-divider" aria-hidden="true" />
              <a href={quoteHref} className="tm-btn tm-btn-cyan tm-calc-cta">
                <Mail size={15} strokeWidth={2.2} aria-hidden="true" />
                Send to Tech Monkeys
                <span className="tm-arr" aria-hidden="true">→</span>
              </a>
            </div>
          ) : (
            <div className="tm-calc-total-panel">
              <div className="tm-calc-total-head">
                <span>Custom quote</span>
              </div>
              <p className="tm-calc-quote-note">{price.reason}</p>
              <div className="tm-calc-total-divider" aria-hidden="true" />
              <a href={quoteHref} className="tm-btn tm-btn-cyan tm-calc-cta">
                <Mail size={15} strokeWidth={2.2} aria-hidden="true" />
                Request a Quote
                <span className="tm-arr" aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </aside>
      </div>
    </motion.div>
  )
}
