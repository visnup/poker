import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-dark",
      grep: /screenshot/,
      use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
    },
  ],
  webServer: {
    command: "next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
});
