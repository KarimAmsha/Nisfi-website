// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config(
  {
    // Global ignores (must be a standalone object to apply repo-wide).
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/coverage/**",
      "**/lib/**",
      "**/.next/**",
      "**/next-env.d.ts",
      "**/*.tsbuildinfo",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Next.js app rules (App Router).
    files: ["apps/web/**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // App Router only — there is no legacy `pages/` directory.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    // Backend-agnostic boundary (master spec Section 5.1): `firebase/*` may be
    // imported only inside the web app's infrastructure/firebase layer.
    files: ["apps/web/src/**/*.{ts,tsx}"],
    ignores: ["apps/web/src/infrastructure/firebase/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["firebase", "firebase/*", "firebase-admin", "firebase-admin/*"],
              message:
                "Firebase may only be imported inside apps/web/src/infrastructure/firebase/** (master spec Section 5.1). Consume domain ports instead.",
            },
          ],
        },
      ],
    },
  },
  {
    // Config files run in Node and are not part of the TS project graph.
    files: ["**/*.config.{js,mjs,ts}"],
    ...tseslint.configs.disableTypeChecked,
  },
);
