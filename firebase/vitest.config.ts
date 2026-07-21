import { defineConfig } from "vitest/config";

// Security-rules tests run only under the Firestore emulator (root `test:rules`
// script), so they are kept out of the workspace `test` scripts / `pnpm check`.
export default defineConfig({
  test: {
    include: ["firebase/tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
