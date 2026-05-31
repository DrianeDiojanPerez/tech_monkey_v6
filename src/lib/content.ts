import contentJson from "../content.json"

export type SiteContent = {
  hero: {
    title: { line1: string; line2: string; line3: string; line4: string }
    subtitle: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    image: string
  }
  why: {
    title: { line1: string; techWord: string; monkeysWord: string }
    items: Array<string>
    cta: { label: string; href: string }
    image: string
  }
  work: {
    cards: Array<{ label: string; image: string }>
  }
  ready: {
    title: string
    cta: { label: string; href: string }
  }
  footer: {
    tagline: string
    phone: string
    phone2?: string
    email: string
    email2?: string
    addressLine1: string
    addressLine2: string
    hours: string
    copyright: string
    social: {
      facebook: string
      instagram: string
      tiktok: string
      email: string
    }
  }
}

export const content = contentJson as SiteContent
