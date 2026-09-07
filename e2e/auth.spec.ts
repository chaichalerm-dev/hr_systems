import { test, expect } from "@playwright/test"

import { loginAs } from "./helpers"

test.describe("Authentication / การเข้าสู่ระบบ", () => {
  test("an employee can log in and lands on their dashboard / พนักงานล็อกอินแล้วเปิดหน้าแรกได้", async ({ page }) => {
    await loginAs(page, "employee")
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  })

  test("an unauthenticated visitor is redirected away from a protected page / ผู้ที่ยังไม่ล็อกอินถูกพาไปหน้าเข้าสู่ระบบ", async ({ page }) => {
    await page.goto("/employees")
    await page.waitForURL("**/login**")
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()
  })

  test("invalid credentials show an error and do not sign in / ข้อมูลล็อกอินผิดแสดงข้อความและไม่ให้เข้าระบบ", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("employee@hrflow.demo")
    await page.getByLabel("Password", { exact: true }).fill("wrong-password")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByText("Invalid email or password.")).toBeVisible()
  })
})
