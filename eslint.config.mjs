import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierRecommended,
  { settings: { react: { version: "19" } } }, // Avoids auto-detection crash (eslint-plugin-react #3977)
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
