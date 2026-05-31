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
  Ruler,
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

type SizeUnit =
  | "ft-in"
  | "in"
  | "ft"
  | "yd"
  | "mile"
  | "mm"
  | "cm"
  | "m"
  | "km"

const UNITS: ReadonlyArray<{ id: SizeUnit; label: string; short: string }> = [
  { id: "ft-in", label: "ft + in", short: "ft + in" },
  { id: "in", label: "Inches (in)", short: "in" },
  { id: "ft", label: "Feet (ft)", short: "ft" },
  { id: "yd", label: "Yards (yd)", short: "yd" },
  { id: "mile", label: "Miles", short: "mi" },
  { id: "mm", label: "Millimeters (mm)", short: "mm" },
  { id: "cm", label: "Centimeters (cm)", short: "cm" },
  { id: "m", label: "Meters (m)", short: "m" },
  { id: "km", label: "Kilometers (km)", short: "km" },
]

const UNIT_FACTOR: Record<Exclude<SizeUnit, "ft-in">, number> = {
  in: 1,
  ft: 12,
  yd: 36,
  mile: 63360,
  mm: 0.03937008,
  cm: 0.3937008,
  m: 39.37008,
  km: 39370.08,
}

const UNIT_STEP: Record<SizeUnit, number> = {
  "ft-in": 1,
  in: 1,
  ft: 0.1,
  yd: 0.1,
  mile: 0.001,
  mm: 1,
  cm: 0.1,
  m: 0.05,
  km: 0.001,
}

const UNIT_SHORT: Record<SizeUnit, string> = {
  "ft-in": "ft + in",
  in: "in",
  ft: "ft",
  yd: "yd",
  mile: "mi",
  mm: "mm",
  cm: "cm",
  m: "m",
  km: "km",
}

function dimToInches(
  unit: SizeUnit,
  str: string,
  ftStr: string,
  inStr: string
): number {
  if (unit === "ft-in") {
    return (parseFloat(ftStr) || 0) * 12 + (parseFloat(inStr) || 0)
  }
  return (parseFloat(str) || 0) * UNIT_FACTOR[unit]
}

function roundDisplay(n: number, places = 4): string {
  if (!Number.isFinite(n)) return "0"
  const p = Math.pow(10, places)
  return String(Math.round(n * p) / p)
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
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>("in")
  const [widthStr, setWidthStr] = useState("12")
  const [heightStr, setHeightStr] = useState("12")
  const [widthFtStr, setWidthFtStr] = useState("1")
  const [widthInPartStr, setWidthInPartStr] = useState("0")
  const [heightFtStr, setHeightFtStr] = useState("1")
  const [heightInPartStr, setHeightInPartStr] = useState("0")
  const [quantity, setQuantity] = useState(1)

  const widthIn = dimToInches(sizeUnit, widthStr, widthFtStr, widthInPartStr)
  const heightIn = dimToInches(
    sizeUnit,
    heightStr,
    heightFtStr,
    heightInPartStr
  )

  useEffect(() => {
    setSizeUnit("in")
    setWidthStr("12")
    setHeightStr("12")
    setWidthFtStr("1")
    setWidthInPartStr("0")
    setHeightFtStr("1")
    setHeightInPartStr("0")
    setQuantity(1)
  }, [product])

  function handleUnitChange(next: SizeUnit) {
    if (next === sizeUnit) return
    const curW = dimToInches(sizeUnit, widthStr, widthFtStr, widthInPartStr)
    const curH = dimToInches(sizeUnit, heightStr, heightFtStr, heightInPartStr)
    if (next === "ft-in") {
      const wFt = Math.floor(curW / 12)
      const wIn = Math.round((curW - wFt * 12) * 10) / 10
      const hFt = Math.floor(curH / 12)
      const hIn = Math.round((curH - hFt * 12) * 10) / 10
      setWidthFtStr(String(wFt))
      setWidthInPartStr(String(wIn))
      setHeightFtStr(String(hFt))
      setHeightInPartStr(String(hIn))
    } else {
      const factor = UNIT_FACTOR[next]
      setWidthStr(roundDisplay(curW / factor))
      setHeightStr(roundDisplay(curH / factor))
    }
    setSizeUnit(next)
  }

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

    const sizeStr =
      sizeUnit === "ft-in"
        ? `${widthFtStr} ft ${widthInPartStr} in × ${heightFtStr} ft ${heightInPartStr} in`
        : `${widthStr} × ${heightStr} ${UNIT_SHORT[sizeUnit]}`
    const sizeLine = `• Size: ${sizeStr} (${areaSqFt.toFixed(2)} sq ft)`
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

    const sizeCompact =
      sizeUnit === "ft-in"
        ? `${widthFtStr}ft${widthInPartStr}in×${heightFtStr}ft${heightInPartStr}in`
        : `${widthStr}×${heightStr} ${UNIT_SHORT[sizeUnit]}`
    const subjectText =
      price.kind === "priced"
        ? `Quote request: ${productLabel} · ${sizeCompact} · qty ${quantity}`
        : `Quote request: ${productLabel} (custom)`

    return `mailto:${content.footer.email}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`
  }, [
    product,
    signMaterial,
    acrylicThickness,
    uvLaminate,
    widthStr,
    heightStr,
    widthFtStr,
    widthInPartStr,
    heightFtStr,
    heightInPartStr,
    sizeUnit,
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

            <div className="tm-calc-field tm-calc-field--full tm-calc-field--units">
              <label htmlFor="calc-unit" className="tm-calc-field-label">
                <Ruler size={13} strokeWidth={2.2} aria-hidden="true" />
                Size unit
              </label>
              <select
                id="calc-unit"
                className="tm-calc-units-select"
                value={sizeUnit}
                onChange={(e) =>
                  handleUnitChange(e.target.value as SizeUnit)
                }
              >
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="tm-calc-field">
              <label htmlFor="calc-width">
                <MoveHorizontal
                  size={13}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                Width ({UNIT_SHORT[sizeUnit]})
              </label>
              {sizeUnit === "ft-in" ? (
                <div className="tm-calc-ftin">
                  <input
                    id="calc-width"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={widthFtStr}
                    onChange={(e) => setWidthFtStr(e.target.value)}
                    onBlur={() =>
                      setWidthFtStr(String(parseFloat(widthFtStr) || 0))
                    }
                    aria-label="Width feet"
                  />
                  <span className="tm-calc-ftin-unit">ft</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.5}
                    value={widthInPartStr}
                    onChange={(e) => setWidthInPartStr(e.target.value)}
                    onBlur={() =>
                      setWidthInPartStr(String(parseFloat(widthInPartStr) || 0))
                    }
                    aria-label="Width inches"
                  />
                  <span className="tm-calc-ftin-unit">in</span>
                </div>
              ) : (
                <input
                  id="calc-width"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={UNIT_STEP[sizeUnit]}
                  value={widthStr}
                  onChange={(e) => setWidthStr(e.target.value)}
                  onBlur={() => setWidthStr(String(parseFloat(widthStr) || 0))}
                />
              )}
            </div>

            <div className="tm-calc-field">
              <label htmlFor="calc-height">
                <MoveVertical
                  size={13}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
                Height ({UNIT_SHORT[sizeUnit]})
              </label>
              {sizeUnit === "ft-in" ? (
                <div className="tm-calc-ftin">
                  <input
                    id="calc-height"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={heightFtStr}
                    onChange={(e) => setHeightFtStr(e.target.value)}
                    onBlur={() =>
                      setHeightFtStr(String(parseFloat(heightFtStr) || 0))
                    }
                    aria-label="Height feet"
                  />
                  <span className="tm-calc-ftin-unit">ft</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.5}
                    value={heightInPartStr}
                    onChange={(e) => setHeightInPartStr(e.target.value)}
                    onBlur={() =>
                      setHeightInPartStr(
                        String(parseFloat(heightInPartStr) || 0)
                      )
                    }
                    aria-label="Height inches"
                  />
                  <span className="tm-calc-ftin-unit">in</span>
                </div>
              ) : (
                <input
                  id="calc-height"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={UNIT_STEP[sizeUnit]}
                  value={heightStr}
                  onChange={(e) => setHeightStr(e.target.value)}
                  onBlur={() =>
                    setHeightStr(String(parseFloat(heightStr) || 0))
                  }
                />
              )}
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
