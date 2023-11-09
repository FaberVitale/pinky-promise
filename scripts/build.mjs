import * as esbuild from "esbuild";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const paths = {
  entrypoint: resolve(__dirname, "../lib/pinky-promise.ts"),
  tsconfig: resolve(__dirname, "../tsconfig.json"),
  outDir: resolve(__dirname, "../dist"),
};

/**
 * @type {esbuild.BuildOptions}
 */
const commonBuildOptions = {
  outdir: paths.outDir,
  minify: true,
  sourcemap: true,
  target: "es2020",
  entryPoints: [paths.entrypoint],
  tsconfig: paths.tsconfig,
  drop: ["console", "debugger"],
};

async function main() {
  await esbuild.build({
    ...commonBuildOptions,
    format: "esm",
  });

  await esbuild.build({
    ...commonBuildOptions,
    outExtension: {
      ".js": ".cjs",
    },
    format: "cjs",
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    if (!process.exitCode) {
      process.exitCode = 1;
    }

    throw err;
  });
}
