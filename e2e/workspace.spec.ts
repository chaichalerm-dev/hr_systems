import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

test("page search respects employee permissions and navigates", async ({ page }) => {
  await loginAs(page, "employee")
  await page.getByRole("button", { name: "Find a page" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("textbox").fill("payroll")
  await expect(dialog.getByText("No results found.")).toBeVisible()
  await dialog.getByRole("textbox").fill("attendance")
  await dialog.getByRole("link", { name: "Attendance", exact: true }).click()
  await expect(page).toHaveURL(/\/attendance$/)
  await expect(page.getByRole("button", { name: "Check in", exact: true })).toBeVisible()
})

test("admin can reset filters, switch work areas and open leave details with keyboard", async ({ page }) => {
  await loginAs(page, "admin")
  await page.goto("/employees?search=NoSuchEmployeeRedesignCheck")
  await expect(page.getByText("No employees match your filters.")).toBeVisible()
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(page.getByRole("textbox", { name: "Search" })).toHaveValue("")
  await expect(page).toHaveURL(/\/employees$/)
  await page.goto("/attendance")
  await page.getByRole("tab", { name: "Team attendance" }).click()
  await expect(page.getByRole("heading", { name: "Company status today (first 20)" })).toBeVisible()
  await page.getByRole("tab", { name: "My attendance" }).click()
  await expect(page.getByRole("button", { name: "Check in", exact: true })).toBeVisible()
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Payroll rules", exact: true }).click()
  await expect(page.getByRole("button", { name: "Save payroll rules" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Save attendance rules" })).not.toBeVisible()
  await page.goto("/leave")
  const view = page.getByRole("button", { name: "View", exact: true }).first()
  if (await view.count()) {
    await view.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("Escape")
  }
})

test("Thai mobile navigation, dark theme and reports remain usable", async ({ page }) => {
  test.setTimeout(90_000)
  await loginAs(page, "admin")
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("button", { name: "Language: ไทย" }).click()
  await expect(page.getByRole("heading", { name: "วันนี้ต้องการทำอะไร?" })).toBeVisible()
  for (const route of ["dashboard", "employees", "employees/new", "attendance", "leave", "payroll", "payslips", "reports", "settings", "audit-log", "profile"]) {
    await page.goto(`/${route}`)
    await expect(page.locator("main h1")).toBeVisible()
    await expect.poll(() => page.locator("main").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
  }
  await page.getByRole("button", { name: "เปิดเมนูนำทาง" }).click()
  await page.getByRole("dialog").getByRole("link", { name: "รายงาน", exact: true }).click()
  await expect(page).toHaveURL(/\/reports$/)
  await expect(page.getByRole("dialog")).not.toBeVisible()
  await page.getByRole("button", { name: /English/ }).click()
  await page.getByRole("button", { name: "Toggle theme" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  const from = page.getByLabel("From", { exact: true }).first()
  await from.fill("2099-01-01")
  await expect(page.locator("main").getByRole("alert")).toContainText("Choose a start date")
  await expect(page.locator('main a[data-slot="button"]').first()).toHaveAttribute("aria-disabled", "true")
})
