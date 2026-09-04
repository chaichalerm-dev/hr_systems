import { z } from "zod"
import { EmploymentStatus, EmploymentType } from "@prisma/client"

export const employeeFormSchema = z.object({
  employeeCode: z.string().min(2, "Employee code is required.").max(20),
  firstName: z.string().min(1, "First name is required.").max(100),
  lastName: z.string().min(1, "Last name is required.").max(100),
  email: z.email("Enter a valid email address."),
  phone: z.string().max(30).optional().or(z.literal("")),

  departmentId: z.string().min(1, "Select a department."),
  positionId: z.string().min(1, "Select a position."),
  employmentType: z.enum(EmploymentType),
  employmentStatus: z.enum(EmploymentStatus),

  salary: z.coerce.number().positive("Salary must be greater than 0."),
  startDate: z.coerce.date(),
  managerId: z.string().optional().or(z.literal("")),

  profileImageUrl: z.string().max(500).optional().or(z.literal("")),

  emergencyContactName: z.string().max(200).optional().or(z.literal("")),
  emergencyContactPhone: z.string().max(30).optional().or(z.literal("")),
  emergencyContactRelation: z.string().max(100).optional().or(z.literal("")),

  addressLine1: z.string().max(200).optional().or(z.literal("")),
  addressLine2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  province: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),

  bankName: z.string().max(100).optional().or(z.literal("")),
  bankAccountNumber: z.string().max(50).optional().or(z.literal("")),
  taxId: z.string().max(50).optional().or(z.literal("")),
  socialSecurityNo: z.string().max(50).optional().or(z.literal("")),
})

export type EmployeeFormInput = z.infer<typeof employeeFormSchema>

// react-hook-form binds directly to typed field state (a real `number`,
// a real `Date`), not the raw strings a FormData submission would carry —
// so the client-side resolver uses plain (non-coercing) versions of the
// coerced fields to keep its input/output types aligned for zodResolver.
export const employeeFormClientSchema = employeeFormSchema.extend({
  salary: z.number().positive("Salary must be greater than 0."),
  startDate: z.date(),
})

export const employeeListFilterSchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  employmentStatus: z.enum(EmploymentStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["name", "employeeCode", "department", "startDate"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

export type EmployeeListFilter = z.infer<typeof employeeListFilterSchema>
