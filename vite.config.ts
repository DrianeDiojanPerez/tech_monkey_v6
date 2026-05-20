import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const BASE = "/tech_monkey_v6/"

export default defineConfig(({ command }) => {
  const isBuild = command === "build"
  return {
    base: isBuild ? BASE : "/",
    plugins: [
      devtools(),
      nitro(),
      viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      tanstackStart({
        router: isBuild ? { basepath: BASE } : undefined,
        spa: isBuild ? { enabled: true, maskPath: BASE } : undefined,
      }),
      viteReact(),
    ],
  }
})
