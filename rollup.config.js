import { defineConfig } from "rollup";

export default defineConfig({
  input: "index.js",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
    },
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "getError",
    },
  ],
});
