import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    minify: "esbuild",
    lib: {
      entry: resolve(__dirname, "./lib/pinky-promise.ts"),
      formats: ["es"],
      fileName: "pinky-promise",
    },
  },
});
