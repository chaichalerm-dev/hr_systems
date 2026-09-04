import { test, expect } from "@playwright/test"

import { loginAs } from "./helpers"

test.describe("Payroll generation", () => {
  test("HR can generate a payroll run and see it in the list", async ({ page }) => {
    await loginAs(page, "hr")
    await page.goto("/payroll")

    await page.getByRole("button", { name: "Generate payroll" }).click()
    await page.getByRole("button", { name: "Generate" }).click()
    await expect(page.getByText("Payroll run generated.")).toBeVisible()

    await expect(page.getByRole("table")).toBeVisible()
  })

  test("employees without payroll access cannot reach the payroll section", async ({ page }) => {
    await loginAs(page, "employee")
    await page.goto("/payroll")
    await page.waitForURL("**/unauthorized")
  })
})
