// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// Vite exposes .env.local through import.meta.env, while server routes use process.env.
Object.assign(process.env, loadEnv("development", process.cwd(), ""));

export default defineConfig({
  vite: {
    ssr: {
      external: [
        "firebase-admin/app",
        "firebase-admin/auth",
        "firebase-admin/firestore",
        "firebase-admin/messaging",
      ],
    },
  },
  nitro: {
    preset: "vercel",
    vercel: {
      entryFormat: "node",
    },
    traceDeps: ["firebase-admin*", "@google-cloud/firestore*"],
  } as Parameters<typeof defineConfig>[0] extends infer Config
    ? Config extends { nitro?: infer Nitro }
      ? Exclude<Nitro, boolean> & { traceDeps: (string | RegExp)[] }
      : never
    : never,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
