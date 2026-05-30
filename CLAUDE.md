# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **Bun** (a `bun.lock` is present). Use `bun install` / `bun add`; scripts are run with `bun run <script>`.

- `bun run dev` — start the Vite dev server on port 3000 (TanStack Start with SSR).
- `bun run build` — production build.
- `bun run preview` — preview the production build.
- `bun run test` — run Vitest once (jsdom environment available).
  - Run a single test file: `bun run test path/to/file.test.ts`
  - Run by name: `bun run test -t "<pattern>"`
- `bun run typecheck` — `tsc --noEmit`.
- `bun run lint` — ESLint via `@tanstack/eslint-config`.
- `bun run format` — Prettier write across `**/*.{ts,tsx,js,jsx}`.

## Adding shadcn components

Components are installed (not vendored as a library) into `src/components/ui/`:

```bash
npx shadcn@latest add <component>
```

`components.json` is configured with `style: base-vega`, `baseColor: zinc`, `iconLibrary: lucide`, and the aliases below. The Tailwind stylesheet shadcn reads from is `src/styles.css`.

## Architecture

This is a **TanStack Start** app (SSR-capable React framework on Vite + Nitro) using **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**. It is **deployed as a static SPA to GitHub Pages** — SSR is available in dev but not used in production.

- **Entry / SSR**: TanStack Start owns the entry; there is no hand-written `main.tsx`. Vite plugins wire it up in `vite.config.ts` (`tanstackStart()`, `nitro()`, `tailwindcss()`, `viteTsConfigPaths()`, `@tanstack/devtools-vite`).
- **Router**: `src/router.tsx` exports `getRouter()` consuming `src/routeTree.gen.ts`. The route tree is **auto-generated** by `@tanstack/router-plugin` from files in `src/routes/` — do not edit `routeTree.gen.ts` by hand; add/rename route files and let the plugin regenerate it.
- **Routes**: file-based under `src/routes/`. `__root.tsx` defines the HTML shell (`shellComponent`), head metadata, 404 component, and embeds `TanStackDevtools`. Each child route uses `createFileRoute("<path>")({ component: ... })`.
- **Path alias**: `@/*` → `./src/*` (resolved by `vite-tsconfig-paths` + `tsconfig.json` `paths`). shadcn aliases (`components.json`): `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- **Styling**: Tailwind v4 via `@tailwindcss/vite` — config lives inside `src/styles.css` (no `tailwind.config.*`). `cn` lives in `src/lib/utils.ts`. Prettier is configured with `prettier-plugin-tailwindcss`; `cn` and `cva` are registered as `tailwindFunctions` for class sorting.

## Deployment (GitHub Pages)

- Build mode is **SPA**, not server-rendered: `vite.config.ts` only applies `BASE = "/tech_monkey_v6/"`, `router.basepath`, and `tanstackStart({ spa: { enabled: true, maskPath: BASE } })` when `command === "build"`. Dev keeps `base: "/"` and full SSR.
- `.github/workflows/deploy.yml` builds with Bun, then promotes `.output/public/_shell.html` to both `index.html` and `404.html` before uploading the Pages artifact. This is what makes client-side routing work on Pages.
- **Asset URLs in `src/content.json` are absolute `raw.githubusercontent.com` URLs**, not paths under `/tech_monkey_v6/`. The admin editor writes them this way intentionally — they survive base-path changes and are reachable without redeploying.

## Content & admin

The marketing copy/imagery is data, not JSX:

- **`src/content.json`** is the single source of truth for hero/why/work/ready/footer text and image URLs.
- **`src/lib/content.ts`** imports it (via `resolveJsonModule`) and re-exports it typed as `SiteContent`. `src/routes/index.tsx` reads from this — when changing the homepage, edit the JSON (or types + JSON), not hardcoded strings.
- **`/admin` route** (`src/routes/admin.tsx`) is a password-gated editor that calls the GitHub Contents API via `src/lib/github-content.ts` to commit updates to `src/content.json` and upload new images directly to the repo. It needs a user-supplied GitHub PAT with `contents:write` on this repo; the password and token live in `localStorage` only.
- Editing `content.json` from the admin UI triggers a fresh GitHub Pages deploy via the workflow above — there is no separate CMS.

## Conventions

- **TypeScript** is strict with `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax` — use `import type` for type-only imports.
- **Prettier**: `semi: false`, `singleQuote: false` (use double quotes), `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 80`.
