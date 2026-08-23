import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierRecommended,
  { settings: { react: { version: "19" } } }, // Avoids auto-detection crash (eslint-plugin-react #3977)
  {
    rules: {
      "react-hooks/refs": "off", // react-spring targets ref.current from render
      "react-hooks/set-state-in-effect": "off", // client-only Math.random(), keeps SSR hydration matching
    },
  },
  {
    files: ["tests/**"],
    rules: {
      // Playwright fixtures also call a `use` function — not React hooks.
      "react-hooks/rules-of-hooks": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "convex/_generated/**",
  ]),
]);
