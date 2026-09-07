"use server"

import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

import { prisma } from "@/db/client"
import { requireRole } from "@/server/authorization"
import { recordAuditLog } from "@/server/services/audit-log"
import { employeeFormSchema } from "@/validations/employee"

export interface EmployeeActionState {
  error: string | null
  success: boolean
}

function parseEmployeeForm(formData: FormData) {
  // อ่านเฉพาะช่องที่ส่งมา ช่องที่ไม่มีจึงเป็น undefined ซึ่งใช้กับฟิลด์ optional ของ Zod ได้
  // Read submitted entries so omitted optional fields stay undefined instead of becoming null.
  return employeeFormSchema.safeParse(Object.fromEntries(formData.entries()))
}

export async function createEmployeeAction(
  _prevState: EmployeeActionState,
  formData: FormData
): Promise<EmployeeActionState> {
  const session = await requireRole([Role.ADMIN, Role.HR])
  const parsed = parseEmployeeForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ตรวจข้อมูลที่กรอกแล้วลองใหม่ / Check the form and try again.", success: false }
  }

  const data = parsed.data
  const existing = await prisma.employee.findFirst({
    where: { OR: [{ email: data.email }, { employeeCode: data.employeeCode }] },
  })
  if (existing) {
    return { error: "มีพนักงานใช้อีเมลหรือรหัสนี้แล้ว / This email or employee code is already in use.", success: false }
  }

  const employee = await prisma.employee.create({
    data: {
      employeeCode: data.employeeCode,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      departmentId: data.departmentId,
      positionId: data.positionId,
      employmentType: data.employmentType,
      employmentStatus: data.employmentStatus,
      salary: data.salary,
      startDate: data.startDate,
      managerId: data.managerId || null,
      profileImageUrl: data.profileImageUrl || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
      emergencyContactRelation: data.emergencyContactRelation || null,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      province: data.province || null,
      postalCode: data.postalCode || null,
      country: data.country || "Thailand",
      bankName: data.bankName || null,
      bankAccountNumber: data.bankAccountNumber || null,
      taxId: data.taxId || null,
      socialSecurityNo: data.socialSecurityNo || null,
    },
  })

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_CREATED",
    entity: "Employee",
    entityId: employee.id,
    metadata: { employeeCode: employee.employeeCode },
  })

  revalidatePath("/employees")
  return { error: null, success: true }
}

export async function updateEmployeeAction(
  employeeId: string,
  _prevState: EmployeeActionState,
  formData: FormData
): Promise<EmployeeActionState> {
  const session = await requireRole([Role.ADMIN, Role.HR])
  const parsed = parseEmployeeForm(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ตรวจข้อมูลที่กรอกแล้วลองใหม่ / Check the form and try again.", success: false }
  }

  const data = parsed.data
  const conflict = await prisma.employee.findFirst({
    where: {
      id: { not: employeeId },
      OR: [{ email: data.email }, { employeeCode: data.employeeCode }],
    },
  })
  if (conflict) {
    return { error: "มีพนักงานคนอื่นใช้อีเมลหรือรหัสนี้แล้ว / Another employee uses this email or code.", success: false }
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      employeeCode: data.employeeCode,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      departmentId: data.departmentId,
      positionId: data.positionId,
      employmentType: data.employmentType,
      employmentStatus: data.employmentStatus,
      salary: data.salary,
      startDate: data.startDate,
      managerId: data.managerId || null,
      profileImageUrl: data.profileImageUrl || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
      emergencyContactRelation: data.emergencyContactRelation || null,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      province: data.province || null,
      postalCode: data.postalCode || null,
      country: data.country || "Thailand",
      bankName: data.bankName || null,
      bankAccountNumber: data.bankAccountNumber || null,
      taxId: data.taxId || null,
      socialSecurityNo: data.socialSecurityNo || null,
    },
  })

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_UPDATED",
    entity: "Employee",
    entityId: employeeId,
    metadata: {},
  })

  revalidatePath("/employees")
  revalidatePath(`/employees/${employeeId}`)
  return { error: null, success: true }
}

export async function deactivateEmployeeAction(employeeId: string) {
  const session = await requireRole([Role.ADMIN, Role.HR])

  await prisma.employee.update({
    where: { id: employeeId },
    data: { employmentStatus: "TERMINATED", endDate: new Date() },
  })

  await recordAuditLog({
    actorId: session.user.id,
    action: "EMPLOYEE_DEACTIVATED",
    entity: "Employee",
    entityId: employeeId,
    metadata: {},
  })

  revalidatePath("/employees")
  revalidatePath(`/employees/${employeeId}`)
}
