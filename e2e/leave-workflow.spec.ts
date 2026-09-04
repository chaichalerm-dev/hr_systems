import { test, expect, type Browser } from "@playwright/test"

import { loginAs } from "./helpers"

test.describe("Leave approval workflow", () => {
  test("employee submits leave, manager approves, then HR approves", async ({ browser }: { browser: Browser }) => {
    const uniqueReason = `E2E test request ${Date.now()}`

    // --- Employee submits a new leave request ---
    const employeeContext = await browser.newContext()
    const employeePage = await employeeContext.newPage()
    await loginAs(employeePage, "employee")
    await employeePage.goto("/leave")
    await employeePage.getByRole("button", { name: "New request" }).click()

    await employeePage.getByRole("combobox").first().click()
    await employeePage.getByRole("option", { name: "Personal Leave" }).click()
    await employeePage.getByLabel("Reason").fill(uniqueReason)
    await employeePage.getByRole("button", { name: "Submit request" }).click()
    await expect(employeePage.getByText("Leave request submitted.")).toBeVisible()
    await employeeContext.close()

    // --- Manager approves the manager-level step ---
    const managerContext = await browser.newContext()
    const managerPage = await managerContext.newPage()
    await loginAs(managerPage, "manager")
    await managerPage.goto("/leave")
    // The approvals table doesn't show the reason text, so open the request
    // by the employee's name (there's one pending request for them here).
    await managerPage.getByText("Nattaya Suksawat").first().click()
    await expect(managerPage.getByRole("button", { name: "Approve" })).toBeVisible()
    await managerPage.getByRole("button", { name: "Approve" }).click()
    await expect(managerPage.getByText("Request approved.")).toBeVisible()
    await managerContext.close()

    // --- HR gives the final approval ---
    const hrContext = await browser.newContext()
    const hrPage = await hrContext.newPage()
    await loginAs(hrPage, "hr")
    await hrPage.goto("/leave")
    await hrPage.getByText("Nattaya Suksawat").first().click()
    await expect(hrPage.getByRole("button", { name: "Approve" })).toBeVisible()
    await hrPage.getByRole("button", { name: "Approve" }).click()
    await expect(hrPage.getByText("Request approved.")).toBeVisible()
    await hrContext.close()
  })
})
