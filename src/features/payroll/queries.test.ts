import { beforeEach, describe, expect, it, vi } from "vitest"
import { listPayrollRuns } from "./queries"

const database = vi.hoisted(() => ({ runs: vi.fn(), totals: vi.fn() }))
vi.mock("server-only", () => ({}))
vi.mock("@/db/client", () => ({ prisma: { payrollRun: { findMany: database.runs }, payrollItem: { groupBy: database.totals } } }))

describe("Payroll list totals / ยอดรวมในรายการเงินเดือน", () => {
  beforeEach(() => vi.clearAllMocks())
  it("matches totals by run and handles empty runs / จับยอดให้ตรงรอบและรองรับรอบว่าง", async () => {
    const date = new Date("2026-09-01")
    database.runs.mockResolvedValue([
      { id: "new", month: 9, year: 2026, status: "DRAFT", createdAt: date, paidAt: null },
      { id: "paid", month: 8, year: 2026, status: "PAID", createdAt: date, paidAt: date },
    ])
    database.totals.mockResolvedValue([{ payrollRunId: "paid", _count: { _all: 2 }, _sum: { netSalary: "53000.75" } }])
    const rows = await listPayrollRuns()
    expect(rows.map(({ id, employeeCount, totalNet }) => ({ id, employeeCount, totalNet }))).toEqual([
      { id: "new", employeeCount: 0, totalNet: 0 },
      { id: "paid", employeeCount: 2, totalNet: 53000.75 },
    ])
    expect(rows[1].paidAt).toEqual(date)
  })
})
