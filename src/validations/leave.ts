import { z } from "zod"

const leaveRequestShape = {
  leaveTypeId: z.string().min(1, "เลือกประเภทการลา / Select a leave type."),
  reason: z.string().min(5, "บอกเหตุผลอย่างน้อย 5 ตัวอักษร / Enter a reason of at least 5 characters."),
  attachmentName: z.string().max(255).optional().or(z.literal("")),
  attachmentUrl: z.string().max(500).optional().or(z.literal("")),
}

const dateOrderRefinement = {
  message: "เลือกวันสิ้นสุดไม่ก่อนวันเริ่มต้น / The end date must be on or after the start date.",
  path: ["endDate"],
}

// แปลงข้อความวันที่จาก FormData เป็น Date ก่อนตรวจข้อมูล
// Convert FormData date strings to Date values for validation.
export const leaveRequestFormSchema = z
  .object({ ...leaveRequestShape, startDate: z.coerce.date(), endDate: z.coerce.date() })
  .refine((data) => data.endDate >= data.startDate, dateOrderRefinement)

export type LeaveRequestFormInput = z.infer<typeof leaveRequestFormSchema>

// ฟอร์มฝั่งหน้าจอเก็บ Date ไว้แล้ว จึงไม่ต้องแปลงข้อความ
// Client forms already hold Date values, so no string conversion is needed.
export const leaveRequestFormClientSchema = z
  .object({ ...leaveRequestShape, startDate: z.date(), endDate: z.date() })
  .refine((data) => data.endDate >= data.startDate, dateOrderRefinement)

export const leaveDecisionSchema = z.object({
  leaveRequestId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().max(1000).optional().or(z.literal("")),
})

export type LeaveDecisionInput = z.infer<typeof leaveDecisionSchema>
