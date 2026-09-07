import { defineConfig, devices } from "@playwright/test"

// ใช้พอร์ต 4200 หรือ PLAYWRIGHT_PORT โดยต้องตั้ง NEXTAUTH_URL ให้ตรงด้วย ไม่ได้อ่านค่าจาก .env ที่นี่
// Use port 4200 or PLAYWRIGHT_PORT. Set NEXTAUTH_URL to match; this file does not load it from .env.
const PORT = process.env.PLAYWRIGHT_PORT ?? "4200"
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
