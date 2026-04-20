import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/**/*.test.ts",
        "src/**/__tests__/",
        "src/index.ts",
        "src/app.ts",
      ],
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
  },
  resolve: {
    alias: {
      "@workspace/db": path.resolve(__dirname, "../../lib/db/src/index.ts"),
      "@workspace/api-zod": path.resolve(
        __dirname,
        "../../lib/api-zod/src/index.ts"
      ),
    },
  },
});
