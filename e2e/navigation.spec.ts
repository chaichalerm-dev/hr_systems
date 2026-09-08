import { expect, test } from "@playwright/test"
import { loginAs } from "./helpers"

test("slow page navigation stays responsive / เปลี่ยนหน้าได้ต่อแม้ข้อมูลหน้าก่อนยังโหลดอยู่", async ({ page }) => {
  await loginAs(page, "hr")
  await page.route("**/employees?*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    await route.continue()
  })
  await page.locator('aside nav a[href="/employees"]').click()
  await expect(page.locator('aside nav [role="status"], [data-page-loading]').first()).toBeVisible()
  await page.locator('aside nav a[href="/reports"]').click()
  await expect(page.getByRole("heading", { name: "Reports", exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/reports$/)
})

test("search keeps typing local and sends one request / พิมพ์ค้นหาได้ทันทีแล้วส่งคำขอครั้งเดียว", async ({ page }) => {
  await loginAs(page, "hr")
  await page.goto("/employees")
  const requests: string[] = []
  page.on("request", (request) => {
    const url = new URL(request.url())
    if (url.pathname === "/employees" && url.searchParams.get("search")) requests.push(url.searchParams.get("search")!)
  })
  const search = page.getByRole("textbox", { name: "Search", exact: true })
  await search.pressSequentially("NoSuchEmployeeSpeedCheck", { delay: 10 })
  await expect(page.getByText("No employees match your filters.")).toBeVisible()
  expect(requests).toEqual(["NoSuchEmployeeSpeedCheck"])
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(page).toHaveURL(/\/employees$/)
  await expect(search).toHaveValue("")
})
