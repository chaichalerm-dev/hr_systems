import { expect, test } from "@playwright/test"
import { loginAs } from "./helpers"

for (const [role, count] of [["employee", 11], ["manager", 14], ["hr", 21], ["admin", 23]] as const) {
  test(`guide matches ${role} permissions / คู่มือตามบทบาท ${role}`, async ({ page }) => {
    await loginAs(page, role)
    await page.locator('aside nav a[href="/guide"]').click()
    await expect(page.getByRole("heading", { name: "User guide", exact: true })).toBeVisible()
    await expect(page.locator("[data-guide-topic]")).toHaveCount(count)
    await expect(page.locator('[data-guide-topic="payrollSettings"]')).toHaveCount(role === "admin" ? 1 : 0)
    await expect(page.locator('[data-guide-topic="payrollCreate"]')).toHaveCount(role === "admin" || role === "hr" ? 1 : 0)
    await expect(page.locator('[data-guide-topic="leaveApprovals"]')).toHaveCount(role === "employee" ? 0 : 1)
    await page.locator('[data-guide-topic="attendance"]').click()
    await expect(page).toHaveURL(/topic=attendance/)
    await expect(page.locator('[data-guide-article="attendance"]')).toBeVisible()
    await page.getByRole("button", { name: "Next step", exact: true }).click()
    await expect(page.getByRole("heading", { name: /^Step 2 of/ })).toBeVisible()
    await page.reload()
    await expect(page.locator('[data-guide-article="attendance"]')).toBeVisible()
    await expect(page.getByRole("link", { name: "Open work page" })).toHaveAttribute("href", "/attendance")
    if (role === "employee") {
      await page.goto("/guide?topic=payrollSettings")
      await expect(page.locator('[data-guide-article="basics"]')).toBeVisible()
    }
  })
}

test("Thai mobile guide searches locally and stays readable / คู่มือไทยบนมือถือ", async ({ page, context }) => {
  await loginAs(page, "employee")
  await context.addCookies([{ name: "hrflow_locale", value: "th", url: new URL(page.url()).origin }])
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/guide?topic=leaveRequest")
  await expect(page.getByRole("heading", { name: "คู่มือใช้งานระบบ", exact: true })).toBeVisible()
  const guideRequests: string[] = []
  page.on("request", (request) => { if (new URL(request.url()).pathname === "/guide") guideRequests.push(request.url()) })
  const search = page.getByRole("searchbox", { name: "ค้นหาในคู่มือ" })
  await search.fill("zz-no-match-zz")
  await expect(page.getByText("ยังไม่พบหัวข้อ ลองใช้คำสั้นลง หรือเลือกทุกหัวข้อ")).toBeVisible()
  await page.getByRole("button", { name: "ล้างคำค้นและตัวกรอง" }).first().click()
  await page.locator('[data-guide-topic="attendance"]').click()
  await page.getByRole("button", { name: "ดูทุกขั้นตอน", exact: true }).click()
  await expect(page.getByRole("heading", { name: /^ขั้นที่ 2 จาก/ })).toBeVisible()
  expect(guideRequests).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
