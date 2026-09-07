import { z } from "zod"
import { EmploymentStatus, EmploymentType } from "@prisma/client"

export const employeeFormSchema = z.object({
  employeeCode: z.string().min(2, "กรอกรหัสพนักงานอย่างน้อย 2 ตัวอักษร / Enter an employee code of at least 2 characters.").max(20),
  firstName: z.string().min(1, "กรอกชื่อ / Enter a first name.").max(100),
  lastName: z.string().min(1, "กรอกนามสกุล / Enter a last name.").max(100),
  email: z.email("กรอกอีเมลให้ถูกต้อง / Enter a valid email address."),
  phone: z.string().max(30).optional().or(z.literal("")),

  departmentId: z.string().min(1, "เลือกแผนก / Select a department."),
  positionId: z.string().min(1, "เลือกตำแหน่ง / Select a position."),
  employmentType: z.enum(EmploymentType),
  employmentStatus: z.enum(EmploymentStatus),

  salary: z.coerce.number().positive("กรอกเงินเดือนมากกว่า 0 / Enter a salary greater than 0."),
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

// ฟอร์มฝั่งหน้าจอเก็บ number และ Date อยู่แล้ว จึงไม่ต้องแปลงจากข้อความเหมือนข้อมูล FormData
// Client form values already contain numbers and dates; only server FormData values need conversion.
export const employeeFormClientSchema = employeeFormSchema.extend({
  salary: z.number().positive("กรอกเงินเดือนมากกว่า 0 / Enter a salary greater than 0."),
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
