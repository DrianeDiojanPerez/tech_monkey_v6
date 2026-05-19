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

This is a **TanStack Start** app (SSR-capable React framework on Vite + Nitro) using **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**.

- **Entry / SSR**: TanStack Start owns the entry; there is no hand-written `main.tsx`. Vite plugins wire it up in `vite.config.ts` (`tanstackStart()`, `nitro()`, `tailwindcss()`, `viteTsConfigPaths()`, `@tanstack/devtools-vite`).
- **Router**: `src/router.tsx` exports `getRouter()` consuming `src/routeTree.gen.ts`. The route tree is **auto-generated** by `@tanstack/router-plugin` from files in `src/routes/` — do not edit `routeTree.gen.ts` by hand; add/rename route files and let the plugin regenerate it.
- **Routes**: file-based under `src/routes/`. `__root.tsx` defines the HTML shell (`shellComponent`), head metadata, 404 component, and embeds `TanStackDevtools`. Each child route uses `createFileRoute("<path>")({ component: ... })`.
- **Path alias**: `@/*` → `./src/*` (resolved by `vite-tsconfig-paths` + `tsconfig.json` `paths`). shadcn aliases (`components.json`): `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- **Styling**: Tailwind v4 via `@tailwindcss/vite` — config lives inside `src/styles.css` (no `tailwind.config.*`). `cn` lives in `src/lib/utils.ts`. Prettier is configured with `prettier-plugin-tailwindcss`; `cn` and `cva` are registered as `tailwindFunctions` for class sorting.

## Conventions

- **TypeScript** is strict with `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax` — use `import type` for type-only imports.
- **Prettier**: `semi: false`, `singleQuote: false` (use double quotes), `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 80`.
