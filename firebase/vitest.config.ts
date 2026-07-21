import { defineConfig } from "vitest/config";

// Security-rules tests run only under the Firestore emulator (root `test:rules`
// script), so they are kept out of the workspace `test` scripts / `pnpm check`.
export default defineConfig({
  test: {
    include: ["firebase/tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 20000,
    hookTimeout: 30000,
    // All files share one emulator and one demo project, and each clears
    // Firestore in `beforeEach`. Parallel files would wipe each other's seeded
    // data mid-test, so run them sequentially in a single worker.
    fileParallelism: false,
  },
});
