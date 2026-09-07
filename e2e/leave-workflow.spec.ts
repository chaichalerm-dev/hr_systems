import { test, expect, type Browser } from "@playwright/test"

import { loginAs } from "./helpers"

test.describe("Leave approval workflow / ขั้นตอนอนุมัติการลา", () => {
  test("employee submits leave, manager approves, then HR approves / พนักงานยื่นลา หัวหน้าอนุมัติ แล้วฝ่ายบุคคลยืนยัน", async ({ browser }: { browser: Browser }) => {
    const uniqueReason = `E2E test request ${Date.now()}`

    // พนักงานยื่นคำขอลา
    // The employee submits a leave request.
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

    // หัวหน้าตรวจและอนุมัติขั้นแรก
    // The manager approves the first step.
    const managerContext = await browser.newContext()
    const managerPage = await managerContext.newPage()
    await loginAs(managerPage, "manager")
    await managerPage.goto("/leave")
    // ตารางไม่แสดงเหตุผล จึงเปิดรายการผ่านชื่อพนักงาน การทดสอบนี้สมมติว่ารายการแรกเป็นคำขอที่ต้องตรวจ
    // Open by employee name because the reason is not in the table; this test assumes the first matching row is the target request.
    await managerPage.getByText("Nattaya Suksawat").first().click()
    await expect(managerPage.getByRole("button", { name: "Approve" })).toBeVisible()
    await managerPage.getByRole("button", { name: "Approve" }).click()
    await expect(managerPage.getByText("Request approved.")).toBeVisible()
    await managerContext.close()

    // ฝ่ายบุคคลอนุมัติขั้นสุดท้าย
    // HR gives the final approval.
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
