import { describe, expect, it } from "vitest"
import { Role } from "@prisma/client"
import type { Session } from "next-auth"

import {
  canManageEmployees,
  canManagePayroll,
  canViewEmployeePayroll,
  canViewEmployeeRecord,
} from "./permissions"

function makeSession(role: Role, employeeId: string | null): Session {
  return {
    user: { id: "user-1", role, employeeId, email: "test@hrflow.demo" },
    expires: "2099-01-01",
  } as Session
}

describe("canManageEmployees / canManagePayroll", () => {
  it("allows ADMIN and HR, denies MANAGER and EMPLOYEE", () => {
    expect(canManageEmployees(Role.ADMIN)).toBe(true)
    expect(canManageEmployees(Role.HR)).toBe(true)
    expect(canManageEmployees(Role.MANAGER)).toBe(false)
    expect(canManageEmployees(Role.EMPLOYEE)).toBe(false)

    expect(canManagePayroll(Role.ADMIN)).toBe(true)
    expect(canManagePayroll(Role.HR)).toBe(true)
    expect(canManagePayroll(Role.MANAGER)).toBe(false)
    expect(canManagePayroll(Role.EMPLOYEE)).toBe(false)
  })
})

describe("canViewEmployeeRecord", () => {
  it("lets ADMIN and HR view any employee", () => {
    const employee = { id: "emp-99", managerId: null }
    expect(canViewEmployeeRecord(makeSession(Role.ADMIN, "someone-else"), employee)).toBe(true)
    expect(canViewEmployeeRecord(makeSession(Role.HR, "someone-else"), employee)).toBe(true)
  })

  it("lets an employee view their own record", () => {
    const employee = { id: "emp-1", managerId: "mgr-1" }
    expect(canViewEmployeeRecord(makeSession(Role.EMPLOYEE, "emp-1"), employee)).toBe(true)
  })

  it("denies an employee viewing a colleague's record", () => {
    const employee = { id: "emp-2", managerId: "mgr-1" }
    expect(canViewEmployeeRecord(makeSession(Role.EMPLOYEE, "emp-1"), employee)).toBe(false)
  })

  it("lets a manager view their direct report", () => {
    const employee = { id: "emp-3", managerId: "mgr-1" }
    expect(canViewEmployeeRecord(makeSession(Role.MANAGER, "mgr-1"), employee)).toBe(true)
  })

  it("denies a manager viewing an employee outside their team", () => {
    const employee = { id: "emp-4", managerId: "mgr-2" }
    expect(canViewEmployeeRecord(makeSession(Role.MANAGER, "mgr-1"), employee)).toBe(false)
  })
})

describe("canViewEmployeePayroll", () => {
  it("lets ADMIN and HR view anyone's payroll", () => {
    expect(canViewEmployeePayroll(makeSession(Role.ADMIN, "x"), "emp-1")).toBe(true)
    expect(canViewEmployeePayroll(makeSession(Role.HR, "x"), "emp-1")).toBe(true)
  })

  it("lets an employee view their own payroll", () => {
    expect(canViewEmployeePayroll(makeSession(Role.EMPLOYEE, "emp-1"), "emp-1")).toBe(true)
  })

  it("denies an employee viewing a colleague's payroll", () => {
    expect(canViewEmployeePayroll(makeSession(Role.EMPLOYEE, "emp-1"), "emp-2")).toBe(false)
  })

  it("denies a manager viewing their direct report's payroll — payroll access is not automatic for managers", () => {
    expect(canViewEmployeePayroll(makeSession(Role.MANAGER, "mgr-1"), "emp-3")).toBe(false)
  })
})
