import type { Page } from "@playwright/test"

export const DEMO_CREDENTIALS = {
  admin: { email: "admin@hrflow.demo", password: "Admin@12345" },
  hr: { email: "hr@hrflow.demo", password: "Hr@12345" },
  manager: { email: "manager@hrflow.demo", password: "Manager@12345" },
  employee: { email: "employee@hrflow.demo", password: "Employee@12345" },
}

export async function loginAs(page: Page, role: keyof typeof DEMO_CREDENTIALS) {
  const { email, password } = DEMO_CREDENTIALS[role]
  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL("**/dashboard")
}
