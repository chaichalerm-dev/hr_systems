import "server-only"

import { Prisma, Role } from "@prisma/client"
import type { Session } from "next-auth"

import { prisma } from "@/db/client"
import type { EmployeeListFilter } from "@/validations/employee"

const EMPLOYEE_LIST_SELECT = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  employmentType: true,
  employmentStatus: true,
  startDate: true,
  profileImageUrl: true,
  department: { select: { id: true, name: true } },
  position: { select: { id: true, title: true } },
  manager: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.EmployeeSelect

export type EmployeeListItem = Prisma.EmployeeGetPayload<{ select: typeof EMPLOYEE_LIST_SELECT }>

/**
 * Scopes the employee list to what the viewer is allowed to see: ADMIN/HR
 * see everyone, MANAGER sees their direct reports, EMPLOYEE sees nobody
 * (the employees list page redirects them to their own profile instead).
 */
function scopeWhere(session: Session): Prisma.EmployeeWhereInput {
  if (session.user.role === Role.ADMIN || session.user.role === Role.HR) return {}
  if (session.user.role === Role.MANAGER && session.user.employeeId) {
    return { managerId: session.user.employeeId }
  }
  return { id: "__none__" }
}

export async function listEmployees(session: Session, filter: EmployeeListFilter) {
  const where: Prisma.EmployeeWhereInput = {
    AND: [
      scopeWhere(session),
      filter.departmentId ? { departmentId: filter.departmentId } : {},
      filter.employmentStatus ? { employmentStatus: filter.employmentStatus } : {},
      filter.search
        ? {
            OR: [
              { firstName: { contains: filter.search, mode: "insensitive" } },
              { lastName: { contains: filter.search, mode: "insensitive" } },
              { email: { contains: filter.search, mode: "insensitive" } },
              { employeeCode: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  }

  const orderBy: Prisma.EmployeeOrderByWithRelationInput =
    filter.sortBy === "employeeCode"
      ? { employeeCode: filter.sortOrder }
      : filter.sortBy === "department"
        ? { department: { name: filter.sortOrder } }
        : filter.sortBy === "startDate"
          ? { startDate: filter.sortOrder }
          : { firstName: filter.sortOrder }

  const [items, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      select: EMPLOYEE_LIST_SELECT,
      orderBy,
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize,
    }),
    prisma.employee.count({ where }),
  ])

  return { items, total, page: filter.page, pageSize: filter.pageSize }
}

const EMPLOYEE_DETAIL_SELECT = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  departmentId: true,
  positionId: true,
  employmentType: true,
  employmentStatus: true,
  salary: true,
  startDate: true,
  endDate: true,
  managerId: true,
  profileImageUrl: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  emergencyContactRelation: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  province: true,
  postalCode: true,
  country: true,
  bankName: true,
  bankAccountNumber: true,
  taxId: true,
  socialSecurityNo: true,
  userId: true,
  department: { select: { id: true, name: true } },
  position: { select: { id: true, title: true } },
  manager: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
} satisfies Prisma.EmployeeSelect

export type EmployeeDetail = Prisma.EmployeeGetPayload<{ select: typeof EMPLOYEE_DETAIL_SELECT }>

export async function getEmployeeById(id: string): Promise<EmployeeDetail | null> {
  return prisma.employee.findUnique({ where: { id }, select: EMPLOYEE_DETAIL_SELECT })
}

export async function listDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } })
}

export async function listPositions(departmentId?: string) {
  return prisma.position.findMany({
    where: departmentId ? { departmentId } : undefined,
    orderBy: { title: "asc" },
  })
}

export async function listManagerCandidates(excludeEmployeeId?: string) {
  return prisma.employee.findMany({
    where: excludeEmployeeId ? { id: { not: excludeEmployeeId } } : undefined,
    select: { id: true, firstName: true, lastName: true, employeeCode: true },
    orderBy: { firstName: "asc" },
  })
}
